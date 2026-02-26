from __future__ import annotations

from datetime import datetime, timezone
import hashlib
import json
import logging
import secrets
import time
import uuid

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.signal import (
    CheckinConfirmIn,
    CheckinConfirmOut,
    CheckinIntentOut,
    CheckinStatusOut,
    PlaceFeedOut,
    SignalFeedItem,
)
from app.services.redis_client import redis_client

logger = logging.getLogger(__name__)
CHECKIN_INTENT_TTL_SECONDS = 120
CHECKIN_PENDING_TTL_SECONDS = 900  # 15 minutes
CHECKIN_STATUS_PENDING_WINDOW_SECONDS = 20


async def get_place_feed(db: AsyncSession, place_id: str, limit: int = 50) -> PlaceFeedOut:
    rows = (
        await db.execute(
            text(
                """
                SELECT event_id, pubkey, status, created_at
                FROM signals
                WHERE place_id = :place_id
                ORDER BY created_at DESC
                LIMIT :limit
                """
            ),
            {"place_id": place_id, "limit": limit},
        )
    ).mappings().all()

    summary = (
        await db.execute(
            text(
                """
                SELECT
                  COUNT(*)::int AS total_signals,
                  COUNT(*) FILTER (WHERE status = 'success')::int AS recent_successes,
                  MAX(created_at) FILTER (WHERE status = 'success') AS last_confirmed_at
                FROM signals
                WHERE place_id = :place_id
                """
            ),
            {"place_id": place_id},
        )
    ).mappings().first()

    total = int(summary["total_signals"] or 0) if summary else 0
    successes = int(summary["recent_successes"] or 0) if summary else 0
    confidence = 0.0 if total == 0 else round((successes / total) * 100, 2)

    items = [
        SignalFeedItem(
            event_id=r["event_id"],
            pubkey=r["pubkey"],
            status=r["status"],
            created_at=r["created_at"],
            content="",
        )
        for r in rows
    ]

    return PlaceFeedOut(
        place_id=place_id,
        confidence_score=confidence,
        total_signals=total,
        recent_successes=successes,
        last_confirmed_at=summary["last_confirmed_at"] if summary else None,
        items=items,
    )


async def create_checkin_intent(place_id: str, requester_id: str) -> CheckinIntentOut:
    issued_at = datetime.now(timezone.utc)
    nonce = secrets.token_hex(8)
    digest = hashlib.sha256(
        f"{place_id}:{requester_id}:{nonce}:{issued_at.timestamp()}".encode(),
    ).hexdigest()
    token = f"sr_ci_{digest[:32]}"

    payload = {
        "place_id": place_id,
        "requester_id": requester_id,
        "issued_at": issued_at.isoformat(),
    }
    await redis_client.setex(
        f"checkin:intent:{token}",
        CHECKIN_INTENT_TTL_SECONDS,
        json.dumps(payload),
    )

    return CheckinIntentOut(intent_token=token, expires_in_seconds=CHECKIN_INTENT_TTL_SECONDS)


async def _find_same_day_signal_event_id(
    *,
    db: AsyncSession,
    pubkey: str,
    place_id: str,
) -> str | None:
    row = (
        await db.execute(
            text(
                """
                SELECT event_id
                FROM signals
                WHERE pubkey = :pubkey
                  AND place_id = :place_id
                  AND signal_date = CURRENT_DATE
                ORDER BY created_at DESC
                LIMIT 1
                """
            ),
            {"pubkey": pubkey, "place_id": place_id},
        )
    ).mappings().first()
    if not row:
        return None
    event_id = row.get("event_id")
    return event_id if isinstance(event_id, str) else None


async def _store_checkin_meta(
    *,
    checkin_id: str,
    place_id: str,
    pubkey: str | None,
) -> None:
    payload = {
        "checkin_id": checkin_id,
        "place_id": place_id,
        "pubkey": pubkey,
        "observed_at": datetime.now(timezone.utc).isoformat(),
    }
    await redis_client.setex(
        f"checkin:meta:{checkin_id}",
        CHECKIN_PENDING_TTL_SECONDS,
        json.dumps(payload),
    )


async def confirm_checkin(
    *,
    db: AsyncSession,
    payload: CheckinConfirmIn,
    intent_token: str | None,
) -> CheckinConfirmOut:
    if not intent_token:
        return CheckinConfirmOut(status="rejected", reason_code="missing_intent_token")

    intent_key = f"checkin:intent:{intent_token}"
    raw_intent = await redis_client.getdel(intent_key)
    if not raw_intent:
        return CheckinConfirmOut(status="rejected", reason_code="intent_expired")

    intent = json.loads(raw_intent)
    if intent.get("place_id") != payload.place_id:
        return CheckinConfirmOut(status="rejected", reason_code="intent_place_mismatch")

    if payload.pubkey:
        existing_event_id = await _find_same_day_signal_event_id(
            db=db,
            pubkey=payload.pubkey,
            place_id=payload.place_id,
        )
        if existing_event_id:
            await redis_client.setex(
                f"checkin:pending:{payload.event_id}",
                CHECKIN_PENDING_TTL_SECONDS,
                json.dumps(
                    {
                        "state": "ok",
                        "reason_code": "duplicate_checkin_same_day",
                        "event_id": existing_event_id,
                        "place_id": payload.place_id,
                        "pubkey": payload.pubkey,
                    }
                ),
            )
            await _store_checkin_meta(
                checkin_id=payload.event_id,
                place_id=payload.place_id,
                pubkey=payload.pubkey,
            )
            return CheckinConfirmOut(
                status="ok",
                reason_code="duplicate_checkin_same_day",
                event_id=existing_event_id,
            )

    await db.execute(
        text(
            """
            INSERT INTO checkin_submissions (
                id,
                event_id,
                pubkey,
                place_id,
                status,
                reason_code,
                raw_event,
                payment_evidence
            )
            VALUES (
                :id,
                :event_id,
                :pubkey,
                :place_id,
                'pending',
                :reason_code,
                CAST(:raw_event AS JSONB),
                CAST(:payment_evidence AS JSONB)
            )
            ON CONFLICT (event_id) DO NOTHING
            """
        ),
        {
            "id": str(uuid.uuid4()),
            "event_id": payload.event_id,
            "pubkey": payload.pubkey or "",
            "place_id": payload.place_id,
            "reason_code": "indexing_delay",
            "raw_event": None,
            "payment_evidence": (
                json.dumps(payload.payment_evidence, separators=(",", ":"))
                if payload.payment_evidence is not None
                else None
            ),
        },
    )

    ingested_row = (
        await db.execute(
            text("SELECT event_id FROM signals WHERE event_id = :event_id LIMIT 1"),
            {"event_id": payload.event_id},
        )
    ).mappings().first()
    if ingested_row and isinstance(ingested_row.get("event_id"), str):
        await db.execute(
            text(
                """
                UPDATE checkin_submissions
                SET status = 'confirmed',
                    confirmed_at = now(),
                    reason_code = 'confirmed'
                WHERE event_id = :event_id
                  AND status = 'pending'
                """
            ),
            {"event_id": payload.event_id},
        )
        return CheckinConfirmOut(
            status="ok",
            reason_code="confirmed",
            event_id=ingested_row["event_id"],
        )

    pending_key = f"checkin:pending:{payload.event_id}"
    pending_record = {
        "event_id": payload.event_id,
        "place_id": payload.place_id,
        "pubkey": payload.pubkey,
        "payment_evidence": payload.payment_evidence,
        "state": "pending",
        "reason_code": "indexing_delay",
        "confirmed_at": datetime.now(timezone.utc).isoformat(),
    }

    await redis_client.setex(
        pending_key,
        CHECKIN_PENDING_TTL_SECONDS,
        json.dumps(pending_record),
    )
    await _store_checkin_meta(
        checkin_id=payload.event_id,
        place_id=payload.place_id,
        pubkey=payload.pubkey,
    )

    logger.info(
        "checkin_confirm_pending",
        extra={
            "event_id": payload.event_id,
            "place_id": payload.place_id,
            "has_pubkey": payload.pubkey is not None,
        },
    )

    return CheckinConfirmOut(status="pending", reason_code="indexing_delay", event_id=payload.event_id)


async def get_checkin_status(
    *,
    db: AsyncSession,
    checkin_id: str,
    pubkey: str | None = None,
    place_id: str | None = None,
) -> CheckinStatusOut:
    submission_row = (
        await db.execute(
            text(
                """
                SELECT event_id, status, reason_code
                FROM checkin_submissions
                WHERE event_id = :event_id
                LIMIT 1
                """
            ),
            {"event_id": checkin_id},
        )
    ).mappings().first()
    if submission_row and isinstance(submission_row.get("status"), str):
        submission_status = submission_row["status"]
        reason_code = submission_row.get("reason_code")
        event_id = submission_row.get("event_id")
        normalized_reason = reason_code if isinstance(reason_code, str) else None
        normalized_event_id = event_id if isinstance(event_id, str) else checkin_id

        if submission_status == "pending":
            return CheckinStatusOut(
                status="pending",
                reason_code=normalized_reason or "indexing_delay",
                event_id=normalized_event_id,
            )
        if submission_status == "confirmed":
            return CheckinStatusOut(
                status="ok",
                reason_code=normalized_reason or "confirmed",
                event_id=normalized_event_id,
            )
        if submission_status == "rejected":
            return CheckinStatusOut(
                status="failed",
                reason_code=normalized_reason or "rejected",
                event_id=normalized_event_id,
            )

    raw_pending = await redis_client.get(f"checkin:pending:{checkin_id}")
    if raw_pending:
        if isinstance(raw_pending, bytes):
            raw_pending = raw_pending.decode("utf-8")
        payload = json.loads(raw_pending)
        status = payload.get("state")
        if isinstance(status, str) and status in {"pending", "ok", "failed", "not_found"}:
            reason_code = payload.get("reason_code")
            event_id = payload.get("event_id")
            return CheckinStatusOut(
                status=status,
                reason_code=reason_code if isinstance(reason_code, str) else None,
                event_id=event_id if isinstance(event_id, str) else None,
            )

    event_row = (
        await db.execute(
            text("SELECT event_id FROM signals WHERE event_id = :event_id LIMIT 1"),
            {"event_id": checkin_id},
        )
    ).mappings().first()
    if event_row and isinstance(event_row.get("event_id"), str):
        return CheckinStatusOut(status="ok", reason_code="confirmed", event_id=event_row["event_id"])

    derived_pubkey = pubkey
    derived_place_id = place_id
    if not derived_pubkey or not derived_place_id:
        raw_meta = await redis_client.get(f"checkin:meta:{checkin_id}")
        if raw_meta:
            if isinstance(raw_meta, bytes):
                raw_meta = raw_meta.decode("utf-8")
            meta = json.loads(raw_meta)
            if not derived_pubkey and isinstance(meta.get("pubkey"), str):
                derived_pubkey = meta.get("pubkey")
            if not derived_place_id and isinstance(meta.get("place_id"), str):
                derived_place_id = meta.get("place_id")

    if derived_pubkey and derived_place_id:
        duplicate_event_id = await _find_same_day_signal_event_id(
            db=db,
            pubkey=derived_pubkey,
            place_id=derived_place_id,
        )
        if duplicate_event_id:
            return CheckinStatusOut(
                status="ok",
                reason_code="duplicate_checkin_same_day",
                event_id=duplicate_event_id,
            )

    probe_key = f"checkin:probe:{checkin_id}"
    now_ts = int(time.time())
    raw_probe = await redis_client.get(probe_key)
    if not raw_probe:
        await redis_client.setex(
            probe_key,
            CHECKIN_STATUS_PENDING_WINDOW_SECONDS + 5,
            str(now_ts),
        )
        return CheckinStatusOut(status="pending", reason_code="indexing_delay", event_id=checkin_id)

    if isinstance(raw_probe, bytes):
        raw_probe = raw_probe.decode("utf-8")
    try:
        first_seen_ts = int(raw_probe)
    except ValueError:
        first_seen_ts = now_ts

    if now_ts - first_seen_ts < CHECKIN_STATUS_PENDING_WINDOW_SECONDS:
        return CheckinStatusOut(status="pending", reason_code="indexing_delay", event_id=checkin_id)

    return CheckinStatusOut(status="not_found", reason_code="unknown_checkin", event_id=checkin_id)

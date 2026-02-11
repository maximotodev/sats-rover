from __future__ import annotations

from datetime import datetime, timezone
import hashlib
import json
import logging
import secrets

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.signal import (
    CheckinConfirmIn,
    CheckinConfirmOut,
    CheckinIntentOut,
    PlaceFeedOut,
    SignalFeedItem,
)
from app.services.redis_client import redis_client

logger = logging.getLogger(__name__)
CHECKIN_INTENT_TTL_SECONDS = 120
CHECKIN_PENDING_TTL_SECONDS = 900  # 15 minutes


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


async def confirm_checkin(payload: CheckinConfirmIn, intent_token: str | None) -> CheckinConfirmOut:
    if not intent_token:
        return CheckinConfirmOut(status="rejected", reason_code="missing_intent_token")

    intent_key = f"checkin:intent:{intent_token}"
    raw_intent = await redis_client.getdel(intent_key)
    if not raw_intent:
        return CheckinConfirmOut(status="rejected", reason_code="intent_expired")

    intent = json.loads(raw_intent)
    if intent.get("place_id") != payload.place_id:
        return CheckinConfirmOut(status="rejected", reason_code="intent_place_mismatch")

    pending_key = f"checkin:pending:{payload.event_id}"
    pending_record = {
        "event_id": payload.event_id,
        "place_id": payload.place_id,
        "pubkey": payload.pubkey,
        "payment_evidence": payload.payment_evidence,
        "state": "pending",
        "confirmed_at": datetime.now(timezone.utc).isoformat(),
    }

    await redis_client.setex(
        pending_key,
        CHECKIN_PENDING_TTL_SECONDS,
        json.dumps(pending_record),
    )

    logger.info(
        "checkin_confirm_pending",
        extra={
            "event_id": payload.event_id,
            "place_id": payload.place_id,
            "has_pubkey": payload.pubkey is not None,
        },
    )

    return CheckinConfirmOut(status="pending", reason_code=None)

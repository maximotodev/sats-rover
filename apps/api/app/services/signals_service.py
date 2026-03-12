from __future__ import annotations

from datetime import datetime, timezone
import hashlib
import json
import logging
import re
import secrets
import time
import uuid
from typing import Any, Callable, Mapping

from sqlalchemy import text
from sqlalchemy.exc import DBAPIError
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
_ALLOWED_V2_MISSING_RELATIONS = {"signals_v2_state", "signals_v2_events"}
_SIGNAL_CONTENT_MAX_LEN = 4096
_PAYMENT_EVIDENCE_MAX_LEN = 8 * 1024
_RAW_EVENT_MAX_LEN = 32 * 1024


def _extract_missing_relation_name(exc: Exception) -> str | None:
    if not isinstance(exc, DBAPIError):
        return None
    orig = getattr(exc, "orig", None)
    sqlstate = getattr(orig, "sqlstate", None) or getattr(orig, "pgcode", None)
    if sqlstate != "42P01":
        return None
    message = str(orig or exc)[:4096]
    match = re.search(
        r'relation\s+"([^"]+)"\s+does not exist',
        message,
        flags=re.IGNORECASE,
    )
    if not match:
        return None
    relation = match.group(1).strip()
    if not relation:
        return None
    return relation.split(".")[-1]


def _should_fallback_to_v1(
    exc: Exception,
    allowed_relations: set[str],
) -> tuple[bool, str | None]:
    missing_relation = _extract_missing_relation_name(exc)
    if missing_relation is None:
        return False, None
    return missing_relation in allowed_relations, missing_relation


async def _execute_v2_or_v1(
    *,
    db: AsyncSession,
    query_name: str,
    v2_sql: str,
    v2_params: dict[str, Any],
    v1_sql: str,
    v1_params: dict[str, Any],
    log_context: dict[str, Any],
    fetch: str,
) -> tuple[bool, Any]:
    def _extract(result: Any) -> Any:
        mappings = result.mappings()
        if fetch == "all":
            return mappings.all()
        return mappings.first()

    try:
        result = await db.execute(text(v2_sql), v2_params)
        return True, _extract(result)
    except DBAPIError as exc:
        should_fallback, missing_relation = _should_fallback_to_v1(
            exc,
            _ALLOWED_V2_MISSING_RELATIONS,
        )
        if not should_fallback:
            raise
        logger.warning(
            "signals_v2_fallback_to_v1",
            extra={
                "query_name": query_name,
                "missing_relation": missing_relation,
                **log_context,
            },
        )
        result = await db.execute(text(v1_sql), v1_params)
        return False, _extract(result)


async def _is_event_ingested_v2_only(*, db: AsyncSession, event_id: str) -> bool:
    row = (
        await db.execute(
            text(
                """
                SELECT 1 AS one
                FROM signals_v2_events
                WHERE event_id = :event_id
                LIMIT 1
                """
            ),
            {"event_id": event_id},
        )
    ).mappings().first()
    return row is not None


async def _is_event_ingested_compat(*, db: AsyncSession, event_id: str) -> bool:
    _, row = await _execute_v2_or_v1(
        db=db,
        query_name="event_ingested_probe",
        v2_sql="""
                    SELECT 1 AS one
                    FROM signals_v2_events
                    WHERE event_id = :event_id
                    LIMIT 1
                    """,
        v2_params={"event_id": event_id},
        v1_sql="""
                    SELECT 1 AS one
                    FROM signals
                    WHERE event_id = :event_id
                    LIMIT 1
                    """,
        v1_params={"event_id": event_id},
        log_context={"event_id": event_id},
        fetch="first",
    )
    return row is not None


async def _is_event_ingested(*, db: AsyncSession, event_id: str) -> bool:
    return await _is_event_ingested_compat(db=db, event_id=event_id)


def _log_confirmed_mutation(
    *,
    mutation_source: str,
    event_id: str,
    reason_code: str,
    v2_check_result: bool,
    legacy_check_result: bool,
) -> None:
    logger.info(
        "checkin_confirmed_mutation",
        extra={
            "mutation_source": mutation_source,
            "event_id": event_id,
            "reason_code": reason_code,
            "v2_check_result": v2_check_result,
            "legacy_check_result": legacy_check_result,
        },
    )


def _compact_json_or_none(value: object, *, max_len: int) -> tuple[str | None, bool]:
    if value is None:
        return None, False
    encoded = json.dumps(value, separators=(",", ":"))
    if len(encoded) > max_len:
        return None, True
    return encoded, False


async def _persist_v2_event_metadata(
    *,
    db: AsyncSession,
    event_id: str,
    raw_event_json: str | None,
    payment_evidence_json: str | None,
) -> None:
    if raw_event_json is None and payment_evidence_json is None:
        return
    try:
        conflict_row = (
            await db.execute(
                text(
                    """
                    SELECT
                        (
                            :raw_event IS NOT NULL
                            AND raw_event IS NOT NULL
                            AND CAST(:raw_event AS JSONB) IS DISTINCT FROM raw_event
                        ) AS raw_event_conflict,
                        (
                            :payment_evidence IS NOT NULL
                            AND payment_evidence IS NOT NULL
                            AND CAST(:payment_evidence AS JSONB) IS DISTINCT FROM payment_evidence
                        ) AS payment_evidence_conflict
                    FROM signals_v2_events
                    WHERE event_id = :event_id
                    LIMIT 1
                    """
                ),
                {
                    "event_id": event_id,
                    "raw_event": raw_event_json,
                    "payment_evidence": payment_evidence_json,
                },
            )
        ).mappings().first()
        if not conflict_row:
            return

        raw_event_conflict = bool(conflict_row.get("raw_event_conflict"))
        payment_evidence_conflict = bool(conflict_row.get("payment_evidence_conflict"))
        if raw_event_conflict or payment_evidence_conflict:
            logger.warning(
                "signals_v2_metadata_conflict",
                extra={
                    "event_id": event_id,
                    "raw_event_conflict": raw_event_conflict,
                    "payment_evidence_conflict": payment_evidence_conflict,
                },
            )
            return

        await db.execute(
            text(
                """
                UPDATE signals_v2_events
                SET
                    raw_event = COALESCE(raw_event, CAST(:raw_event AS JSONB)),
                    payment_evidence = COALESCE(payment_evidence, CAST(:payment_evidence AS JSONB))
                WHERE event_id = :event_id
                """
            ),
            {
                "event_id": event_id,
                "raw_event": raw_event_json,
                "payment_evidence": payment_evidence_json,
            },
        )
    except DBAPIError as exc:
        should_fallback, _ = _should_fallback_to_v1(
            exc,
            _ALLOWED_V2_MISSING_RELATIONS,
        )
        if not should_fallback:
            raise


def _build_content_preview(raw_content: object) -> str:
    if not isinstance(raw_content, str) or not raw_content:
        return ""
    try:
        parsed = json.loads(raw_content)
    except json.JSONDecodeError:
        parsed = None
    if isinstance(parsed, dict) and isinstance(parsed.get("note"), str):
        preview = parsed.get("note")
    else:
        preview = raw_content
    preview = " ".join(preview.split())
    return preview[:140]


def _normalize_signal_content(raw: object, *, max_len: int) -> str:
    if not isinstance(raw, str):
        return ""
    return raw[:max_len]


def _utc_day_int(dt: datetime) -> int:
    return int(dt.astimezone(timezone.utc).timestamp()) // 86400


async def get_place_feed(db: AsyncSession, place_id: str, limit: int = 50) -> PlaceFeedOut:
    using_v2_rows, rows = await _execute_v2_or_v1(
        db=db,
        query_name="place_feed_rows",
        v2_sql="""
                    SELECT event_id, pubkey, status, created_at, content
                    FROM signals_v2_state
                    WHERE place_id = :place_id
                    ORDER BY created_at DESC, event_id DESC
                    LIMIT :limit
                    """,
        v2_params={"place_id": place_id, "limit": limit},
        v1_sql="""
                    SELECT event_id, pubkey, status, created_at
                    FROM signals
                    WHERE place_id = :place_id
                    ORDER BY created_at DESC
                    LIMIT :limit
                    """,
        v1_params={"place_id": place_id, "limit": limit},
        log_context={"place_id": place_id},
        fetch="all",
    )

    using_v2_summary, summary = await _execute_v2_or_v1(
        db=db,
        query_name="place_feed_summary",
        v2_sql="""
                    SELECT
                      COUNT(*)::int AS total_signals,
                      COUNT(*) FILTER (WHERE status = 'success')::int AS recent_successes,
                      MAX(created_at) FILTER (WHERE status = 'success') AS last_confirmed_at
                    FROM signals_v2_state
                    WHERE place_id = :place_id
                    """,
        v2_params={"place_id": place_id},
        v1_sql="""
                    SELECT
                      COUNT(*)::int AS total_signals,
                      COUNT(*) FILTER (WHERE status = 'success')::int AS recent_successes,
                      MAX(created_at) FILTER (WHERE status = 'success') AS last_confirmed_at
                    FROM signals
                    WHERE place_id = :place_id
                    """,
        v1_params={"place_id": place_id},
        log_context={"place_id": place_id},
        fetch="first",
    )

    use_v2_mode = using_v2_rows and using_v2_summary
    if using_v2_rows != using_v2_summary:
        logger.warning(
            "signals_v2_mixed_mode_falling_back_to_v1",
            extra={
                "place_id": place_id,
                "using_v2_rows": using_v2_rows,
                "using_v2_summary": using_v2_summary,
            },
        )

    total = int(summary["total_signals"] or 0) if summary else 0
    successes = int(summary["recent_successes"] or 0) if summary else 0
    confidence = 0.0 if total == 0 else round((successes / total) * 100, 2)

    if use_v2_mode:
        def _to_created_at_v2(r: Mapping[str, Any]) -> datetime:
            return datetime.fromtimestamp(int(r["created_at"]), tz=timezone.utc)

        def _to_raw_content_v2(r: Mapping[str, Any]) -> str:
            return _normalize_signal_content(
                r.get("content"),
                max_len=_SIGNAL_CONTENT_MAX_LEN,
            )

        def _to_preview_v2(raw: str) -> str:
            return _build_content_preview(raw)

        to_created_at: Callable[[Mapping[str, Any]], datetime] = _to_created_at_v2
        to_raw_content: Callable[[Mapping[str, Any]], str] = _to_raw_content_v2
        to_preview: Callable[[str], str] = _to_preview_v2
    else:
        def _to_created_at_v1(r: Mapping[str, Any]) -> datetime:
            return r["created_at"]

        def _to_raw_content_v1(r: Mapping[str, Any]) -> str:
            return ""

        def _to_preview_v1(raw: str) -> str:
            return ""

        to_created_at: Callable[[Mapping[str, Any]], datetime] = _to_created_at_v1
        to_raw_content: Callable[[Mapping[str, Any]], str] = _to_raw_content_v1
        to_preview: Callable[[str], str] = _to_preview_v1

    items: list[SignalFeedItem] = []
    for r in rows:
        raw_content = to_raw_content(r)
        items.append(
            SignalFeedItem(
                event_id=r["event_id"],
                pubkey=r["pubkey"],
                status=r["status"],
                created_at=to_created_at(r),
                content=raw_content,
                content_preview=to_preview(raw_content),
            )
        )

    last_confirmed_at = summary["last_confirmed_at"] if summary else None
    if use_v2_mode and last_confirmed_at is not None:
        last_confirmed_at = datetime.fromtimestamp(
            int(last_confirmed_at), tz=timezone.utc
        )

    return PlaceFeedOut(
        place_id=place_id,
        confidence_score=confidence,
        total_signals=total,
        recent_successes=successes,
        last_confirmed_at=last_confirmed_at,
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
    day_utc = _utc_day_int(datetime.now(timezone.utc))
    _, row = await _execute_v2_or_v1(
        db=db,
        query_name="same_day_duplicate_lookup",
        v2_sql="""
                    SELECT event_id
                    FROM signals_v2_events
                    WHERE pubkey = :pubkey
                      AND place_id = :place_id
                      AND day_utc = :day_utc
                    ORDER BY created_at DESC, event_id DESC
                    LIMIT 1
                    """,
        v2_params={"pubkey": pubkey, "place_id": place_id, "day_utc": day_utc},
        v1_sql="""
                    SELECT event_id
                    FROM signals
                    WHERE pubkey = :pubkey
                      AND place_id = :place_id
                      AND signal_date = CURRENT_DATE
                    ORDER BY created_at DESC
                    LIMIT 1
                    """,
        v1_params={"pubkey": pubkey, "place_id": place_id},
        log_context={"place_id": place_id, "pubkey": pubkey},
        fetch="first",
    )
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
    logger.info(
        "confirm_request_received",
        extra={
            "event_id": payload.event_id,
            "pubkey": payload.pubkey,
            "place_id": payload.place_id,
            "status": "received",
            "reason_code": None,
            "checkin_intent_id": intent_token,
        },
    )
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
            logger.info(
                "checkin_confirm_persisted",
                extra={
                    "event_id": payload.event_id,
                    "pubkey": payload.pubkey,
                    "place_id": payload.place_id,
                    "status": "duplicate_checkin_same_day",
                    "reason_code": "duplicate_checkin_same_day",
                    "checkin_intent_id": intent_token,
                },
            )
            return CheckinConfirmOut(
                status="ok",
                reason_code="duplicate_checkin_same_day",
                event_id=existing_event_id,
            )

    payment_evidence_json, payment_too_large = _compact_json_or_none(
        payload.payment_evidence,
        max_len=_PAYMENT_EVIDENCE_MAX_LEN,
    )
    raw_event_json, raw_event_too_large = _compact_json_or_none(
        payload.raw_event,
        max_len=_RAW_EVENT_MAX_LEN,
    )
    if payment_too_large or raw_event_too_large:
        return CheckinConfirmOut(
            status="rejected",
            reason_code="payload_too_large",
            event_id=payload.event_id,
        )

    logger.info(
        "confirm_db_insert_attempt",
        extra={
            "event_id": payload.event_id,
            "pubkey": payload.pubkey,
            "place_id": payload.place_id,
            "status": "attempt",
            "reason_code": "indexing_delay",
            "checkin_intent_id": intent_token,
        },
    )
    try:
        submission_result = await db.execute(
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
                ON CONFLICT (event_id) DO UPDATE
                SET
                    raw_event = COALESCE(checkin_submissions.raw_event, EXCLUDED.raw_event),
                    payment_evidence = COALESCE(checkin_submissions.payment_evidence, EXCLUDED.payment_evidence)
                """
            ),
            {
                "id": str(uuid.uuid4()),
                "event_id": payload.event_id,
                "pubkey": payload.pubkey or "",
                "place_id": payload.place_id,
                "reason_code": "indexing_delay",
                "raw_event": raw_event_json,
                "payment_evidence": payment_evidence_json,
            },
        )
    except Exception:
        logger.error(
            "checkin_confirm_persist_failed",
            extra={
                "event_id": payload.event_id,
                "pubkey": payload.pubkey,
                "place_id": payload.place_id,
                "status": "rejected",
                "reason_code": "submission_persist_failed",
                "checkin_intent_id": intent_token,
            },
        )
        return CheckinConfirmOut(
            status="rejected",
            reason_code="submission_persist_failed",
            event_id=payload.event_id,
        )
    if isinstance(getattr(submission_result, "rowcount", None), int) and submission_result.rowcount <= 0:
        logger.error(
            "checkin_confirm_persist_failed",
            extra={
                "event_id": payload.event_id,
                "pubkey": payload.pubkey,
                "place_id": payload.place_id,
                "status": "rejected",
                "reason_code": "submission_persist_failed",
                "checkin_intent_id": intent_token,
            },
        )
        return CheckinConfirmOut(
            status="rejected",
            reason_code="submission_persist_failed",
            event_id=payload.event_id,
        )
    logger.info(
        "confirm_db_insert_ok",
        extra={
            "event_id": payload.event_id,
            "pubkey": payload.pubkey,
            "place_id": payload.place_id,
            "status": "ok",
            "reason_code": "indexing_delay",
            "checkin_intent_id": intent_token,
        },
    )
    try:
        await db.commit()
    except Exception:
        await db.rollback()
        logger.error(
            "confirm_db_commit_failed",
            extra={
                "event_id": payload.event_id,
                "pubkey": payload.pubkey,
                "place_id": payload.place_id,
                "status": "rejected",
                "reason_code": "submission_commit_failed",
                "checkin_intent_id": intent_token,
            },
        )
        return CheckinConfirmOut(
            status="rejected",
            reason_code="submission_commit_failed",
            event_id=payload.event_id,
        )
    logger.info(
        "confirm_db_commit_ok",
        extra={
            "event_id": payload.event_id,
            "pubkey": payload.pubkey,
            "place_id": payload.place_id,
            "status": "pending",
            "reason_code": "indexing_delay",
            "checkin_intent_id": intent_token,
        },
    )
    try:
        persisted_row = (
            await db.execute(
                text(
                    """
                    SELECT 1 AS one
                    FROM checkin_submissions
                    WHERE event_id = :event_id
                    LIMIT 1
                    """
                ),
                {"event_id": payload.event_id},
            )
        ).mappings().first()
    except Exception:
        logger.error(
            "confirm_db_read_after_write_failed",
            extra={
                "event_id": payload.event_id,
                "pubkey": payload.pubkey,
                "place_id": payload.place_id,
                "status": "rejected",
                "reason_code": "submission_not_durable",
                "checkin_intent_id": intent_token,
            },
        )
        return CheckinConfirmOut(
            status="rejected",
            reason_code="submission_not_durable",
            event_id=payload.event_id,
        )
    if not persisted_row:
        logger.error(
            "confirm_db_read_after_write_failed",
            extra={
                "event_id": payload.event_id,
                "pubkey": payload.pubkey,
                "place_id": payload.place_id,
                "status": "rejected",
                "reason_code": "submission_not_durable",
                "checkin_intent_id": intent_token,
            },
        )
        return CheckinConfirmOut(
            status="rejected",
            reason_code="submission_not_durable",
            event_id=payload.event_id,
        )
    logger.info(
        "confirm_db_read_after_write_ok",
        extra={
            "event_id": payload.event_id,
            "pubkey": payload.pubkey,
            "place_id": payload.place_id,
            "status": "pending",
            "reason_code": "indexing_delay",
            "checkin_intent_id": intent_token,
        },
    )
    logger.info(
        "checkin_confirm_persisted",
        extra={
            "event_id": payload.event_id,
            "pubkey": payload.pubkey,
            "place_id": payload.place_id,
            "status": "pending",
            "reason_code": "indexing_delay",
            "checkin_intent_id": intent_token,
        },
    )

    if await _is_event_ingested_v2_only(db=db, event_id=payload.event_id):
        legacy_check_result = await _is_event_ingested_compat(
            db=db, event_id=payload.event_id
        )
        _log_confirmed_mutation(
            mutation_source="confirm_checkin_v2_ledger_hit",
            event_id=payload.event_id,
            reason_code="confirmed",
            v2_check_result=True,
            legacy_check_result=legacy_check_result,
        )
        await _persist_v2_event_metadata(
            db=db,
            event_id=payload.event_id,
            raw_event_json=raw_event_json,
            payment_evidence_json=payment_evidence_json,
        )
        await db.execute(
            text(
                """
                UPDATE checkin_submissions
                SET status = 'confirmed',
                    confirmed_at = COALESCE(confirmed_at, now()),
                    reason_code=COALESCE(reason_code,'confirmed')
                WHERE event_id = :event_id
                  AND status = 'pending'
                """
            ),
            {"event_id": payload.event_id},
        )
        try:
            await db.commit()
        except Exception:
            await db.rollback()
        logger.info(
            "checkin_confirm_persisted",
            extra={
                "event_id": payload.event_id,
                "pubkey": payload.pubkey,
                "place_id": payload.place_id,
                "status": "confirmed",
                "reason_code": "confirmed",
                "checkin_intent_id": intent_token,
            },
        )
        return CheckinConfirmOut(
            status="ok",
            reason_code="confirmed",
            event_id=payload.event_id,
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

    try:
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
            "confirm_redis_write_ok",
            extra={
                "event_id": payload.event_id,
                "pubkey": payload.pubkey,
                "place_id": payload.place_id,
                "status": "pending",
                "reason_code": "indexing_delay",
                "checkin_intent_id": intent_token,
            },
        )
    except Exception:
        logger.warning(
            "confirm_redis_write_failed",
            extra={
                "event_id": payload.event_id,
                "pubkey": payload.pubkey,
                "place_id": payload.place_id,
                "status": "pending",
                "reason_code": "redis_write_failed",
                "checkin_intent_id": intent_token,
            },
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
    ledger_missing_after_confirm = False
    if await _is_event_ingested_v2_only(db=db, event_id=checkin_id):
        legacy_check_result = await _is_event_ingested_compat(
            db=db, event_id=checkin_id
        )
        _log_confirmed_mutation(
            mutation_source="get_checkin_status_v2_ledger_hit",
            event_id=checkin_id,
            reason_code="confirmed",
            v2_check_result=True,
            legacy_check_result=legacy_check_result,
        )
        await db.execute(
            text(
                """
                UPDATE checkin_submissions
                SET status = 'confirmed',
                    confirmed_at = COALESCE(confirmed_at, now()),
                    reason_code = COALESCE(reason_code, 'confirmed')
                WHERE event_id = :event_id
                  AND status = 'pending'
                """
            ),
            {"event_id": checkin_id},
        )
        return CheckinStatusOut(status="ok", reason_code="confirmed", event_id=checkin_id)

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
            ledger_missing_after_confirm = True
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
        return CheckinStatusOut(
            status="pending",
            reason_code="ledger_missing_after_confirm" if ledger_missing_after_confirm else "indexing_delay",
            event_id=checkin_id,
        )

    if isinstance(raw_probe, bytes):
        raw_probe = raw_probe.decode("utf-8")
    try:
        first_seen_ts = int(raw_probe)
    except ValueError:
        first_seen_ts = now_ts

    if now_ts - first_seen_ts < CHECKIN_STATUS_PENDING_WINDOW_SECONDS:
        return CheckinStatusOut(
            status="pending",
            reason_code="ledger_missing_after_confirm" if ledger_missing_after_confirm else "indexing_delay",
            event_id=checkin_id,
        )

    if ledger_missing_after_confirm:
        return CheckinStatusOut(
            status="failed",
            reason_code="ledger_missing_after_confirm",
            event_id=checkin_id,
        )
    return CheckinStatusOut(status="not_found", reason_code="unknown_checkin", event_id=checkin_id)

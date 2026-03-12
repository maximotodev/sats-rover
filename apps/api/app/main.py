from datetime import datetime, timezone
import json
import re
from typing import Any

from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.exc import DBAPIError

from app.api.v1.places import router as places_router
from app.api.v1.checkins import router as checkins_router
from app.api.v1.signals import router as signals_router
from app.core.settings import settings
from app.db.engine import engine
from app.services.redis_client import redis_client

app = FastAPI(title="SatsRover Engine", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(places_router)
app.include_router(checkins_router)
app.include_router(signals_router)

_HEX64_RE = re.compile(r"^[0-9a-fA-F]{64}$")


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


def _safe_iso(dt: object) -> str | None:
    if isinstance(dt, datetime):
        if dt.tzinfo is None:
            return dt.replace(tzinfo=timezone.utc).isoformat()
        return dt.isoformat()
    return None


def _safe_int(value: object) -> int | None:
    try:
        return int(value)  # type: ignore[arg-type]
    except (TypeError, ValueError):
        return None


def _safe_str(value: object) -> str | None:
    return value if isinstance(value, str) else None


def _decode_redis_json(raw: object) -> tuple[bool, dict | None]:
    if raw is None:
        return False, None
    text_value = raw
    if isinstance(raw, bytes):
        text_value = raw.decode("utf-8", errors="replace")
    if not isinstance(text_value, str):
        return True, None
    try:
        payload = json.loads(text_value)
    except (TypeError, ValueError):
        return True, None
    return True, payload if isinstance(payload, dict) else None


def _normalize_raw_event(raw_event: object) -> dict[str, Any] | None:
    if raw_event is None:
        return None
    if isinstance(raw_event, dict):
        return raw_event
    if isinstance(raw_event, str):
        try:
            parsed = json.loads(raw_event)
        except (TypeError, ValueError):
            return None
        return parsed if isinstance(parsed, dict) else None
    return None


def _first_tag_value(tags: object, key: str) -> str | None:
    if not isinstance(tags, list):
        return None
    for tag in tags:
        if (
            isinstance(tag, list)
            and len(tag) >= 2
            and tag[0] == key
            and isinstance(tag[1], str)
        ):
            return tag[1]
    return None


def _summarize_raw_event_tags(tags: object) -> dict[str, object]:
    if not isinstance(tags, list):
        return {
            "count": 0,
            "has_t_satsrover": False,
            "has_v2": False,
            "has_place": False,
            "has_status": False,
        }
    has_t_satsrover = any(
        isinstance(tag, list) and len(tag) >= 2 and tag[0] == "t" and tag[1] == "satsrover"
        for tag in tags
    )
    has_v2 = any(
        isinstance(tag, list) and len(tag) >= 2 and tag[0] == "v" and tag[1] == "2"
        for tag in tags
    )
    return {
        "count": len(tags),
        "has_t_satsrover": has_t_satsrover,
        "has_v2": has_v2,
        "has_place": _first_tag_value(tags, "place") is not None,
        "has_status": _first_tag_value(tags, "status") is not None,
    }


def _evaluate_raw_event_indexer_eligibility(
    raw_event: object,
    *,
    expected_event_id: str,
) -> dict[str, object]:
    event = _normalize_raw_event(raw_event)
    if event is None:
        return {
            "eligible": False,
            "reasons": ["raw_event_missing_or_invalid_json"],
            "kind_valid": False,
            "place_tag_present": False,
            "status_tag_present": False,
            "v2_tag_present": False,
            "created_at_valid": False,
            "pubkey_valid": False,
            "id_valid": False,
            "id_matches_event_id": False,
        }

    reasons: list[str] = []
    kind = event.get("kind")
    kind_valid = kind == 30331
    if not kind_valid:
        reasons.append("invalid_kind")

    tags = event.get("tags")
    place_tag_present = _first_tag_value(tags, "place") is not None
    status_tag_present = _first_tag_value(tags, "status") is not None
    v2_tag_present = _first_tag_value(tags, "v") == "2"
    if not place_tag_present:
        reasons.append("missing_place_tag")
    if not status_tag_present:
        reasons.append("missing_status_tag")
    if not v2_tag_present:
        reasons.append("missing_v2_tag")

    created_at = event.get("created_at")
    now_ts = int(datetime.now(timezone.utc).timestamp())
    created_at_valid = isinstance(created_at, int) and 0 <= created_at <= now_ts + 600
    if not created_at_valid:
        reasons.append("invalid_created_at")

    pubkey = event.get("pubkey")
    pubkey_valid = isinstance(pubkey, str) and bool(_HEX64_RE.fullmatch(pubkey))
    if not pubkey_valid:
        reasons.append("invalid_pubkey")

    event_id = event.get("id")
    id_valid = isinstance(event_id, str) and bool(_HEX64_RE.fullmatch(event_id))
    if not id_valid:
        reasons.append("invalid_event_id")
    id_matches = bool(id_valid and isinstance(event_id, str) and event_id == expected_event_id)
    if not id_matches:
        reasons.append("event_id_mismatch")

    return {
        "eligible": not reasons,
        "reasons": reasons,
        "kind_valid": kind_valid,
        "place_tag_present": place_tag_present,
        "status_tag_present": status_tag_present,
        "v2_tag_present": v2_tag_present,
        "created_at_valid": created_at_valid,
        "pubkey_valid": pubkey_valid,
        "id_valid": id_valid,
        "id_matches_event_id": id_matches,
    }


async def _execute_v2_optional_first(conn, sql: str, params: dict) -> dict | None:
    try:
        row = (await conn.execute(text(sql), params)).mappings().first()
    except DBAPIError as exc:
        missing_relation = _extract_missing_relation_name(exc)
        if missing_relation not in {"signals_v2_events", "signals_v2_state"}:
            raise
        return None
    return row


@app.get("/debug/counts")
async def debug_counts():
    async with engine.connect() as conn:
        places = (await conn.execute(text("SELECT count(*) FROM places"))).scalar_one()
        try:
            signals = (
                await conn.execute(text("SELECT count(*) FROM signals_v2_events"))
            ).scalar_one()
        except DBAPIError as exc:
            missing_relation = _extract_missing_relation_name(exc)
            if missing_relation != "signals_v2_events":
                raise
            signals = (await conn.execute(text("SELECT count(*) FROM signals"))).scalar_one()
        ingestion_row = (
            await conn.execute(
                text(
                    """
                    SELECT
                        value_json->>'last_places_sync_at' AS json_last_places_sync_at,
                        value AS legacy_value
                    FROM ingestion_state
                    WHERE key = 'places_btcmap'
                    LIMIT 1
                    """
                )
            )
        ).mappings().first()
    last_places_sync_at = None
    if ingestion_row:
        json_last_places_sync_at = ingestion_row.get("json_last_places_sync_at")
        if isinstance(json_last_places_sync_at, str) and json_last_places_sync_at:
            last_places_sync_at = json_last_places_sync_at
        else:
            legacy_value = ingestion_row.get("legacy_value")
            if legacy_value is not None:
                try:
                    epoch_seconds = int(legacy_value)
                    last_places_sync_at = datetime.fromtimestamp(
                        epoch_seconds,
                        tz=timezone.utc,
                    ).isoformat()
                except (TypeError, ValueError, OSError):
                    last_places_sync_at = None
    return {
        "places": places,
        "signals": signals,
        "places_empty": places == 0,
        "last_places_sync_at": last_places_sync_at,
    }


@app.get("/debug/signals")
async def debug_signals():
    async with engine.connect() as conn:
        ledger_rows = (await conn.execute(text("SELECT count(*) FROM signals_v2_events"))).scalar_one()
        state_rows = (await conn.execute(text("SELECT count(*) FROM signals_v2_state"))).scalar_one()
        last_ledger_event_at = (
            await conn.execute(text("SELECT max(created_at) FROM signals_v2_events"))
        ).scalar_one_or_none()
        last_state_event_at = (
            await conn.execute(text("SELECT max(created_at) FROM signals_v2_state"))
        ).scalar_one_or_none()

    state_rebuild_recommended = (
        (ledger_rows > 0 and state_rows == 0)
        or (last_state_event_at is None and last_ledger_event_at is not None)
        or (
            isinstance(last_state_event_at, int)
            and isinstance(last_ledger_event_at, int)
            and last_state_event_at < last_ledger_event_at
        )
    )

    return {
        "ledger_rows": ledger_rows,
        "state_rows": state_rows,
        "last_ledger_event_at": last_ledger_event_at,
        "last_state_event_at": last_state_event_at,
        "state_rebuild_recommended": state_rebuild_recommended,
    }


@app.get("/debug/checkins/{event_id}")
async def debug_checkin(event_id: str):
    async with engine.connect() as conn:
        submission = (
            await conn.execute(
                text(
                    """
                    SELECT status, reason_code, place_id, pubkey, confirmed_at, raw_event
                    FROM checkin_submissions
                    WHERE event_id = :event_id
                    LIMIT 1
                    """
                ),
                {"event_id": event_id},
            )
        ).mappings().first()

        ledger = await _execute_v2_optional_first(
            conn,
            """
            SELECT event_id, pubkey, place_id, status, created_at, day_utc
            FROM signals_v2_events
            WHERE event_id = :event_id
            LIMIT 1
            """,
            {"event_id": event_id},
        )
        legacy = (
            await conn.execute(
                text(
                    """
                    SELECT event_id, pubkey, place_id, status, extract(epoch from created_at)::bigint AS created_at
                    FROM signals
                    WHERE event_id = :event_id
                    LIMIT 1
                    """
                ),
                {"event_id": event_id},
            )
        ).mappings().first()
        state = await _execute_v2_optional_first(
            conn,
            """
            SELECT event_id, pubkey, place_id, status, created_at, day_utc
            FROM signals_v2_state
            WHERE event_id = :event_id
            LIMIT 1
            """,
            {"event_id": event_id},
        )

        submission_place_id = _safe_str(submission.get("place_id")) if submission else None
        submission_pubkey = _safe_str(submission.get("pubkey")) if submission else None
        ledger_place_id = _safe_str(ledger.get("place_id")) if ledger else None
        ledger_pubkey = _safe_str(ledger.get("pubkey")) if ledger else None
        ledger_day_utc = _safe_int(ledger.get("day_utc")) if ledger else None

        pending_exists, pending_payload = _decode_redis_json(
            await redis_client.get(f"checkin:pending:{event_id}")
        )
        meta_exists, meta_payload = _decode_redis_json(
            await redis_client.get(f"checkin:meta:{event_id}")
        )
        probe_raw = await redis_client.get(f"checkin:probe:{event_id}")
        probe_exists = probe_raw is not None
        if isinstance(probe_raw, bytes):
            probe_raw = probe_raw.decode("utf-8", errors="replace")
        probe_first_seen_epoch = _safe_int(probe_raw)

        duplicate_checked = False
        duplicate_winner_event_id = None
        meta_pubkey = _safe_str(meta_payload.get("pubkey")) if meta_payload else None
        meta_place_id = _safe_str(meta_payload.get("place_id")) if meta_payload else None
        duplicate_pubkey = submission_pubkey or meta_pubkey
        duplicate_place_id = submission_place_id or meta_place_id
        duplicate_day_utc = ledger_day_utc if ledger_day_utc is not None else int(datetime.now(timezone.utc).timestamp()) // 86400
        if duplicate_pubkey and duplicate_place_id:
            duplicate_checked = True
            duplicate_row = await _execute_v2_optional_first(
                conn,
                """
                SELECT event_id
                FROM signals_v2_events
                WHERE pubkey = :pubkey
                  AND place_id = :place_id
                  AND day_utc = :day_utc
                ORDER BY created_at DESC, event_id DESC
                LIMIT 1
                """,
                {
                    "pubkey": duplicate_pubkey,
                    "place_id": duplicate_place_id,
                    "day_utc": duplicate_day_utc,
                },
            )
            if duplicate_row:
                winner_value = duplicate_row.get("event_id")
                duplicate_winner_event_id = winner_value if isinstance(winner_value, str) else None

        if state is None and ledger and ledger_pubkey and ledger_place_id and ledger_day_utc is not None:
            state = await _execute_v2_optional_first(
                conn,
                """
                SELECT event_id, pubkey, place_id, status, created_at, day_utc
                FROM signals_v2_state
                WHERE pubkey = :pubkey
                  AND place_id = :place_id
                  AND day_utc = :day_utc
                ORDER BY created_at DESC, event_id DESC
                LIMIT 1
                """,
                {
                    "pubkey": ledger_pubkey,
                    "place_id": ledger_place_id,
                    "day_utc": ledger_day_utc,
                },
            )

    submission_exists = submission is not None
    submission_status = _safe_str(submission.get("status")) if submission else None
    submission_raw_event = submission.get("raw_event") if submission else None
    normalized_raw_event = _normalize_raw_event(submission_raw_event)
    raw_event_eligibility = _evaluate_raw_event_indexer_eligibility(
        normalized_raw_event,
        expected_event_id=event_id,
    )
    raw_event_tag_summary = _summarize_raw_event_tags(
        normalized_raw_event.get("tags") if isinstance(normalized_raw_event, dict) else None
    )
    raw_event_id = _safe_str(normalized_raw_event.get("id")) if normalized_raw_event else None
    raw_event_kind = _safe_int(normalized_raw_event.get("kind")) if normalized_raw_event else None
    raw_event_pubkey = _safe_str(normalized_raw_event.get("pubkey")) if normalized_raw_event else None
    pending_state = _safe_str(pending_payload.get("state")) if pending_payload else None
    pending_reason_code = _safe_str(pending_payload.get("reason_code")) if pending_payload else None
    meta_place_id = _safe_str(meta_payload.get("place_id")) if meta_payload else None
    meta_pubkey = _safe_str(meta_payload.get("pubkey")) if meta_payload else None

    ledger_exists = ledger is not None
    legacy_exists = legacy is not None
    state_exists = state is not None
    durable_trace_exists = submission_exists or ledger_exists
    ephemeral_trace_exists = pending_exists or meta_exists or probe_exists
    state_event_id = _safe_str(state.get("event_id")) if state else None
    ledger_created_at = _safe_int(ledger.get("created_at")) if ledger else None
    state_created_at = _safe_int(state.get("created_at")) if state else None
    same_entity = bool(
        ledger
        and state
        and _safe_str(ledger.get("pubkey")) == _safe_str(state.get("pubkey"))
        and _safe_str(ledger.get("place_id")) == _safe_str(state.get("place_id"))
        and _safe_int(ledger.get("day_utc")) == _safe_int(state.get("day_utc"))
    )

    state_rebuild_recommended = bool(
        ledger_exists
        and (
            not state_exists
            or (
                same_entity
                and
                ledger_created_at is not None
                and state_created_at is not None
                and ledger_created_at > state_created_at
            )
        )
    )

    traces_exist = durable_trace_exists or ephemeral_trace_exists
    confirmation_source = "v2" if ledger_exists else ("legacy" if legacy_exists else None)
    status_semantics_consistent = not (
        submission_status == "confirmed" and not ledger_exists
    )
    duplicate_resolved = (
        duplicate_checked
        and duplicate_winner_event_id is not None
        and duplicate_winner_event_id != event_id
        and not ledger_exists
    )
    duplicate_event_id_prefilter_likely = duplicate_resolved

    diagnosis_code = "missing_everywhere"
    diagnosis_summary = "No submission, redis traces, ledger row, or state row found."
    if ledger_exists and not state_exists:
        diagnosis_code = "ledger_seen_state_pending"
        diagnosis_summary = "Ledger row exists but derived state is missing or lagging."
    elif ledger_exists:
        diagnosis_code = "ledger_confirmed"
        diagnosis_summary = "Canonical ledger contains this event id."
    elif submission_exists and submission_status == "confirmed":
        diagnosis_code = "ledger_missing_after_confirm"
        diagnosis_summary = "Submission is marked confirmed but canonical ledger row is missing."
    elif duplicate_resolved:
        diagnosis_code = "duplicate_same_day_winner_elsewhere"
        diagnosis_summary = "A same-day winner event already exists for this pubkey/place."
    elif submission_exists and normalized_raw_event is None:
        diagnosis_code = "raw_event_missing_from_submission"
        diagnosis_summary = "Submission exists but raw_event is missing or invalid."
    elif submission_exists and not bool(raw_event_eligibility.get("eligible")):
        diagnosis_code = "raw_event_invalid_for_indexer"
        diagnosis_summary = "Submission raw_event is not structurally eligible for signals v2 ingestion."
    elif submission_exists:
        diagnosis_code = "durable_submission_waiting_for_ingest"
        diagnosis_summary = "Durable submission exists; waiting for canonical ledger ingestion."
    elif (
        submission_exists
        and not ledger_exists
        and not state_exists
        and duplicate_winner_event_id is None
        and not pending_exists
        and not meta_exists
    ):
        diagnosis_code = "submission_without_publish"
        diagnosis_summary = "Submission exists but no publish evidence in ledger or state."
    elif traces_exist and not ledger_exists:
        diagnosis_code = "handoff_only"
        diagnosis_summary = "Only API/Redis handoff traces exist; ingestion not observed in ledger."
    elif ledger_exists and not state_exists:
        diagnosis_code = "ledger_seen_state_pending"
        diagnosis_summary = "Ledger row exists but derived state is missing or lagging."

    return {
        "event_id": event_id,
        "checkin_submission": {
            "exists": submission_exists,
            "status": submission_status,
            "reason_code": _safe_str(submission.get("reason_code")) if submission else None,
            "place_id": submission_place_id,
            "pubkey": submission_pubkey,
            "confirmed_at": _safe_iso(submission.get("confirmed_at")) if submission else None,
            "raw_event": {
                "exists": normalized_raw_event is not None,
                "id_matches_event_id": bool(raw_event_eligibility.get("id_matches_event_id")),
                "kind": raw_event_kind,
                "pubkey": raw_event_pubkey,
                "tags_summary": raw_event_tag_summary,
                "eligibility": raw_event_eligibility,
                "id": raw_event_id,
            },
        },
        "redis": {
            "pending": {
                "exists": pending_exists,
                "state": pending_state,
                "reason_code": pending_reason_code,
            },
            "meta": {
                "exists": meta_exists,
                "place_id": meta_place_id,
                "pubkey": meta_pubkey,
            },
            "probe": {
                "exists": probe_exists,
                "first_seen_epoch": probe_first_seen_epoch,
            },
        },
        "ledger": {
            "exists": ledger_exists,
            "event_id": _safe_str(ledger.get("event_id")) if ledger else None,
            "pubkey": ledger_pubkey,
            "place_id": ledger_place_id,
            "status": _safe_str(ledger.get("status")) if ledger else None,
            "created_at": ledger_created_at,
            "day_utc": ledger_day_utc,
        },
        "legacy_ledger": {
            "exists": legacy_exists,
            "event_id": _safe_str(legacy.get("event_id")) if legacy else None,
            "pubkey": _safe_str(legacy.get("pubkey")) if legacy else None,
            "place_id": _safe_str(legacy.get("place_id")) if legacy else None,
            "status": _safe_str(legacy.get("status")) if legacy else None,
            "created_at": _safe_int(legacy.get("created_at")) if legacy else None,
        },
        "state": {
            "exists": state_exists,
            "event_id": state_event_id,
            "pubkey": _safe_str(state.get("pubkey")) if state else None,
            "place_id": _safe_str(state.get("place_id")) if state else None,
            "status": _safe_str(state.get("status")) if state else None,
            "created_at": state_created_at,
            "day_utc": _safe_int(state.get("day_utc")) if state else None,
        },
        "duplicate_same_day": {
            "checked": duplicate_checked,
            "winner_event_id": duplicate_winner_event_id,
            "duplicate_event_id_prefilter_likely": duplicate_event_id_prefilter_likely,
        },
        "durable_trace_exists": durable_trace_exists,
        "ephemeral_trace_exists": ephemeral_trace_exists,
        "v2_ingested": ledger_exists,
        "legacy_ingested": legacy_exists,
        "confirmation_source": confirmation_source,
        "status_semantics_consistent": status_semantics_consistent,
        "diagnosis": {
            "code": diagnosis_code,
            "state_rebuild_recommended": state_rebuild_recommended,
            "summary": diagnosis_summary,
        },
    }

@app.get("/healthz", tags=["health"])
async def healthz(response: Response):
    # Allow aggressive caching in dev; for prod set to short max-age or no-store
    response.headers["Cache-Control"] = "public, max-age=10"
    return {"ok": True, "env": settings.app_env}


@app.get("/readyz", tags=["health"])
async def readyz():
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        pong = await redis_client.ping()
        return {"ok": True, "db": True, "redis": bool(pong)}
    except Exception:
        return {"ok": False}

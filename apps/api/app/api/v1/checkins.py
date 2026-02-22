from __future__ import annotations

import base64
from datetime import datetime, timezone
import hashlib
import json
import re
from typing import Any

from fastapi import APIRouter, Depends, Header, Request, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.checkin import (
    CheckinConfirmIn,
    CheckinConfirmOut,
    CheckinIntentOut,
    CheckinStatusOut,
)
from app.services.checkins_service import (
    confirm_checkin,
    create_checkin_intent,
    get_checkin_status,
)
from app.services.redis_client import redis_client

router = APIRouter(prefix="/v1", tags=["checkins"])
HEX64_RE = re.compile(r"^[0-9a-fA-F]{64}$")
NONCE_RE = re.compile(r"^[A-Za-z0-9:_-]{8,128}$")
AUTH_KIND = 27235
MAX_SKEW_SECONDS = 60


def _http_error(status_code: int, reason_code: str, message: str) -> HTTPException:
    return HTTPException(
        status_code=status_code,
        detail={"reason_code": reason_code, "message": message},
    )


def _sha256_hex(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def _b64url_decode_json(header_value: str) -> dict[str, Any]:
    try:
        padded = header_value + "=" * (-len(header_value) % 4)
        raw = base64.urlsafe_b64decode(padded.encode("utf-8"))
        parsed = json.loads(raw.decode("utf-8"))
    except Exception as exc:
        raise _http_error(401, "invalid_auth_proof", "Invalid auth proof") from exc
    if not isinstance(parsed, dict):
        raise _http_error(401, "invalid_auth_proof", "Invalid auth proof")
    return parsed


def _extract_tag(tags: list[Any], key: str) -> str | None:
    for tag in tags:
        if isinstance(tag, list) and len(tag) >= 2 and tag[0] == key and isinstance(tag[1], str):
            return tag[1]
    return None


def _normalize_pubkey(pubkey: str | None) -> str | None:
    if not pubkey:
        return None
    if not HEX64_RE.fullmatch(pubkey):
        return None
    return pubkey.lower()


def _compute_event_id(event: dict[str, Any]) -> str:
    serialized = json.dumps(
        [
            0,
            event["pubkey"],
            event["created_at"],
            event["kind"],
            event["tags"],
            event.get("content", ""),
        ],
        separators=(",", ":"),
        ensure_ascii=False,
    )
    return hashlib.sha256(serialized.encode("utf-8")).hexdigest()


def _load_public_key_xonly():
    from coincurve import PublicKeyXOnly

    return PublicKeyXOnly


def verify_event_signature(event: dict[str, Any]) -> bool:
    pubkey = event.get("pubkey")
    sig = event.get("sig")
    if not isinstance(pubkey, str) or not HEX64_RE.fullmatch(pubkey):
        return False
    if not isinstance(sig, str) or len(sig) != 128 or not re.fullmatch(r"[0-9a-fA-F]{128}", sig):
        return False

    if event.get("kind") != AUTH_KIND:
        return False
    if not isinstance(event.get("created_at"), int):
        return False
    if not isinstance(event.get("tags"), list):
        return False
    if not isinstance(event.get("content", ""), str):
        return False

    try:
        computed_id = _compute_event_id(event)
    except Exception:
        return False

    provided_id = event.get("id")
    if provided_id is not None:
        if not isinstance(provided_id, str) or not HEX64_RE.fullmatch(provided_id):
            return False
        if provided_id.lower() != computed_id:
            return False

    try:
        PublicKeyXOnly = _load_public_key_xonly()
    except ImportError as exc:
        raise _http_error(503, "auth_verifier_unavailable", "Auth verifier unavailable") from exc

    try:
        verifier = PublicKeyXOnly(bytes.fromhex(pubkey))
        return bool(verifier.verify(bytes.fromhex(sig), bytes.fromhex(computed_id)))
    except Exception:
        return False


def _verify_auth_event(event: dict[str, Any]) -> bool:
    return verify_event_signature(event)


async def _consume_checkins_nonce_once(scope: str, nonce: str, ttl_seconds: int = 120) -> None:
    if not NONCE_RE.fullmatch(nonce or ""):
        raise _http_error(401, "invalid_auth_proof", "Invalid auth proof")
    key = f"nonce:{scope}:{nonce}"
    try:
        created = await redis_client.set(key, "1", ex=ttl_seconds, nx=True)
    except Exception as exc:
        raise _http_error(503, "nonce_store_unavailable", "Nonce store unavailable") from exc
    if not created:
        raise _http_error(409, "replay_nonce", "Nonce already used")


async def _enforce_checkins_auth_proof(
    request: Request,
    *,
    target_pubkey: str,
    raw_body: bytes,
) -> str:
    auth_event = request.headers.get("x-auth-event")
    auth_nonce = request.headers.get("x-auth-nonce")
    if not auth_event or not auth_nonce:
        raise _http_error(401, "missing_auth_proof", "Missing auth proof")

    if not target_pubkey:
        raise _http_error(401, "missing_pubkey", "Missing pubkey")

    normalized_target = _normalize_pubkey(target_pubkey)
    if not normalized_target:
        raise _http_error(422, "invalid_pubkey", "Invalid pubkey")

    event = _b64url_decode_json(auth_event)
    if event.get("kind") != AUTH_KIND:
        raise _http_error(401, "invalid_auth_proof", "Invalid auth proof")

    event_pubkey = event.get("pubkey")
    if not isinstance(event_pubkey, str):
        raise _http_error(401, "invalid_auth_proof", "Invalid auth proof")
    normalized_event_pubkey = _normalize_pubkey(event_pubkey)
    if not normalized_event_pubkey:
        raise _http_error(401, "invalid_auth_proof", "Invalid auth proof")
    if normalized_event_pubkey != normalized_target:
        raise _http_error(401, "auth_pubkey_mismatch", "Auth pubkey does not match target")

    created_at = event.get("created_at")
    if not isinstance(created_at, int):
        raise _http_error(401, "invalid_auth_proof", "Invalid auth proof")
    now_ts = int(datetime.now(timezone.utc).timestamp())
    if abs(now_ts - created_at) > MAX_SKEW_SECONDS:
        raise _http_error(401, "auth_stale", "Auth proof is too old")

    tags = event.get("tags")
    if not isinstance(tags, list):
        raise _http_error(401, "invalid_auth_proof", "Invalid auth proof")

    sr_ok = any(
        isinstance(tag, list)
        and len(tag) >= 3
        and tag[0] == "sr"
        and tag[1] == "auth"
        and tag[2] == "1"
        for tag in tags
    )
    if not sr_ok:
        raise _http_error(401, "invalid_auth_proof", "Invalid auth proof")

    expected_method = request.method.upper()
    expected_path = request.url.path
    expected_body = _sha256_hex(raw_body)

    method_tag = _extract_tag(tags, "method")
    path_tag = _extract_tag(tags, "path")
    nonce_tag = _extract_tag(tags, "nonce")
    body_tag = _extract_tag(tags, "body")
    if (
        method_tag != expected_method
        or path_tag != expected_path
        or nonce_tag != auth_nonce
        or body_tag != expected_body
    ):
        raise _http_error(401, "auth_request_mismatch", "Auth proof does not match request")

    if not _verify_auth_event(event):
        raise _http_error(401, "invalid_auth_proof", "Invalid auth proof")

    await _consume_checkins_nonce_once(
        f"checkins:{expected_method}:{expected_path}:{normalized_target}",
        auth_nonce,
    )
    return normalized_target


@router.post("/checkins/intent", response_model=CheckinIntentOut)
async def checkin_intent(
    place_id: str,
    request: Request,
    x_pubkey: str | None = Header(default=None, alias="X-Pubkey"),
    db: AsyncSession = Depends(get_db),
):
    raw_body = await request.body()
    target_pubkey = x_pubkey or ""
    await _enforce_checkins_auth_proof(
        request,
        target_pubkey=target_pubkey,
        raw_body=raw_body,
    )
    ip = request.client.host if request.client else "unknown"
    ua = request.headers.get("user-agent", "")
    return await create_checkin_intent(db=db, place_id=place_id, requester_ip=ip, requester_ua=ua)


@router.post("/checkins/confirm", response_model=CheckinConfirmOut)
async def checkin_confirm(
    request: Request,
    payload: CheckinConfirmIn,
    x_checkin_id: str | None = Header(default=None, alias="X-Checkin-Id"),
    db: AsyncSession = Depends(get_db),
):
    raw_body = await request.body()
    await _enforce_checkins_auth_proof(
        request,
        target_pubkey=payload.pubkey,
        raw_body=raw_body,
    )
    return await confirm_checkin(db=db, checkin_id=x_checkin_id, payload=payload)


@router.get("/checkins/{checkin_id}", response_model=CheckinStatusOut)
async def checkin_status(checkin_id: str, db: AsyncSession = Depends(get_db)):
    return await get_checkin_status(db=db, checkin_id=checkin_id)

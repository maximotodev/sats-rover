import base64
import hashlib
import json
import time
import unittest
from unittest.mock import AsyncMock, patch

from fastapi import HTTPException

from app.api.v1.checkins import checkin_confirm, checkin_intent
from app.schemas.checkin import CheckinConfirmIn


def _b64url_json(value: dict) -> str:
    raw = json.dumps(value, separators=(",", ":")).encode("utf-8")
    return base64.urlsafe_b64encode(raw).decode("utf-8").rstrip("=")


def _sha256(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


class _DummyClient:
    host = "127.0.0.1"


class _DummyURL:
    def __init__(self, path: str):
        self.path = path


class _DummyRequest:
    def __init__(self, method: str, path: str, body: bytes, headers: dict[str, str]):
        self.client = _DummyClient()
        self.method = method
        self.url = _DummyURL(path)
        self._body = body
        self.headers = headers

    async def body(self) -> bytes:
        return self._body


class CheckinsAuthRouteGuardsTests(unittest.IsolatedAsyncioTestCase):
    async def test_intent_missing_auth_headers_rejected(self):
        req = _DummyRequest("POST", "/v1/checkins/intent", b"", headers={"user-agent": "pytest"})
        with self.assertRaises(HTTPException) as ctx:
            await checkin_intent("sr:demo:1", req, x_pubkey="a" * 64, db=AsyncMock())
        self.assertEqual(ctx.exception.status_code, 401)
        self.assertEqual(ctx.exception.detail["reason_code"], "missing_auth_proof")

    async def test_intent_missing_pubkey_rejected(self):
        req = _DummyRequest("POST", "/v1/checkins/intent", b"", headers={"user-agent": "pytest"})
        event = {
            "kind": 27235,
            "pubkey": "a" * 64,
            "created_at": int(time.time()),
            "tags": [
                ["sr", "auth", "1"],
                ["method", "POST"],
                ["path", "/v1/checkins/intent"],
                ["nonce", "nonce12345"],
                ["body", _sha256(b"")],
            ],
            "content": "",
            "sig": "f" * 128,
        }
        req.headers["x-auth-event"] = _b64url_json(event)
        req.headers["x-auth-nonce"] = "nonce12345"
        with patch("app.api.v1.checkins._verify_auth_event", return_value=True), patch(
            "app.api.v1.checkins._consume_checkins_nonce_once",
            new=AsyncMock(return_value=None),
        ):
            with self.assertRaises(HTTPException) as ctx:
                await checkin_intent("sr:demo:1", req, x_pubkey=None, db=AsyncMock())
        self.assertEqual(ctx.exception.status_code, 401)
        self.assertEqual(ctx.exception.detail["reason_code"], "missing_pubkey")

    async def test_confirm_request_mismatch_rejected(self):
        body = b'{"event_id":"' + (b"a" * 64) + b'","place_id":"sr:demo:1","pubkey":"' + (b"b" * 64) + b'"}'
        event = {
            "kind": 27235,
            "pubkey": "b" * 64,
            "created_at": int(time.time()),
            "tags": [
                ["sr", "auth", "1"],
                ["method", "POST"],
                ["path", "/v1/checkins/intent"],
                ["nonce", "nonce12345"],
                ["body", _sha256(body)],
            ],
            "content": "",
            "sig": "f" * 128,
        }
        req = _DummyRequest(
            "POST",
            "/v1/checkins/confirm",
            body,
            headers={
                "user-agent": "pytest",
                "x-auth-event": _b64url_json(event),
                "x-auth-nonce": "nonce12345",
            },
        )
        payload = CheckinConfirmIn(event_id="a" * 64, place_id="sr:demo:1", pubkey="b" * 64)
        with patch("app.api.v1.checkins._verify_auth_event", return_value=True):
            with self.assertRaises(HTTPException) as ctx:
                await checkin_confirm(req, payload, x_checkin_id="ci_1", db=AsyncMock())
        self.assertEqual(ctx.exception.status_code, 401)
        self.assertEqual(ctx.exception.detail["reason_code"], "auth_request_mismatch")

    async def test_intent_pubkey_mismatch_rejected(self):
        body = b""
        event = {
            "kind": 27235,
            "pubkey": "c" * 64,
            "created_at": int(time.time()),
            "tags": [
                ["sr", "auth", "1"],
                ["method", "POST"],
                ["path", "/v1/checkins/intent"],
                ["nonce", "nonce12345"],
                ["body", _sha256(body)],
            ],
            "content": "",
            "sig": "f" * 128,
        }
        req = _DummyRequest(
            "POST",
            "/v1/checkins/intent",
            body,
            headers={
                "user-agent": "pytest",
                "x-auth-event": _b64url_json(event),
                "x-auth-nonce": "nonce12345",
            },
        )
        with patch("app.api.v1.checkins._verify_auth_event", return_value=True):
            with self.assertRaises(HTTPException) as ctx:
                await checkin_intent("sr:demo:1", req, x_pubkey="d" * 64, db=AsyncMock())
        self.assertEqual(ctx.exception.status_code, 401)
        self.assertEqual(ctx.exception.detail["reason_code"], "auth_pubkey_mismatch")

    async def test_confirm_replay_nonce_rejected(self):
        body = b'{"event_id":"' + (b"a" * 64) + b'","place_id":"sr:demo:1","pubkey":"' + (b"b" * 64) + b'"}'
        event = {
            "kind": 27235,
            "pubkey": "b" * 64,
            "created_at": int(time.time()),
            "tags": [
                ["sr", "auth", "1"],
                ["method", "POST"],
                ["path", "/v1/checkins/confirm"],
                ["nonce", "nonce12345"],
                ["body", _sha256(body)],
            ],
            "content": "",
            "sig": "f" * 128,
        }
        req = _DummyRequest(
            "POST",
            "/v1/checkins/confirm",
            body,
            headers={
                "user-agent": "pytest",
                "x-auth-event": _b64url_json(event),
                "x-auth-nonce": "nonce12345",
            },
        )
        payload = CheckinConfirmIn(event_id="a" * 64, place_id="sr:demo:1", pubkey="b" * 64)
        with patch("app.api.v1.checkins._verify_auth_event", return_value=True), patch(
            "app.api.v1.checkins._consume_checkins_nonce_once",
            side_effect=HTTPException(
                status_code=409,
                detail={"reason_code": "replay_nonce", "message": "Nonce already used"},
            ),
        ):
            with self.assertRaises(HTTPException) as ctx:
                await checkin_confirm(req, payload, x_checkin_id="ci_1", db=AsyncMock())
        self.assertEqual(ctx.exception.status_code, 409)
        self.assertEqual(ctx.exception.detail["reason_code"], "replay_nonce")

    async def test_intent_valid_proof_allows_service(self):
        req = _DummyRequest("POST", "/v1/checkins/intent", b"", headers={"user-agent": "pytest"})
        event = {
            "kind": 27235,
            "pubkey": "a" * 64,
            "created_at": int(time.time()),
            "tags": [
                ["sr", "auth", "1"],
                ["method", "POST"],
                ["path", "/v1/checkins/intent"],
                ["nonce", "nonce12345"],
                ["body", _sha256(b"")],
            ],
            "content": "",
            "sig": "f" * 128,
        }
        req.headers["x-auth-event"] = _b64url_json(event)
        req.headers["x-auth-nonce"] = "nonce12345"
        create_intent = AsyncMock(
            return_value={"checkin_id": "ci_1", "place_id": "sr:demo:1", "state": "issued", "expires_at": "2026-01-01T00:00:00Z"}
        )
        with patch("app.api.v1.checkins._verify_auth_event", return_value=True), patch(
            "app.api.v1.checkins._consume_checkins_nonce_once",
            new=AsyncMock(return_value=None),
        ), patch("app.api.v1.checkins.create_checkin_intent", create_intent):
            await checkin_intent("sr:demo:1", req, x_pubkey="a" * 64, db=AsyncMock())
        create_intent.assert_awaited_once()


if __name__ == "__main__":
    unittest.main()

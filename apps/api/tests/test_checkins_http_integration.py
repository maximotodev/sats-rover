import base64
import hashlib
import json
import time
import unittest
from unittest.mock import patch

from coincurve import PrivateKey
from fastapi import FastAPI
import httpx

from app.api.v1 import checkins as checkins_route


def _sha256_hex(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def _b64url_json(value: dict) -> str:
    raw = json.dumps(value, separators=(",", ":")).encode("utf-8")
    return base64.urlsafe_b64encode(raw).decode("utf-8").rstrip("=")


def _compute_event_id(event: dict) -> str:
    payload = [0, event["pubkey"], event["created_at"], event["kind"], event["tags"], event.get("content", "")]
    raw = json.dumps(payload, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    return hashlib.sha256(raw).hexdigest()


def _build_signed_event(*, method: str, path: str, nonce: str, body: bytes):
    pk = PrivateKey(b"\x22" * 32)
    pubkey_hex = pk.public_key.format(compressed=True)[1:].hex()
    event = {
        "kind": 27235,
        "pubkey": pubkey_hex,
        "created_at": int(time.time()),
        "tags": [
            ["sr", "auth", "1"],
            ["method", method],
            ["path", path],
            ["nonce", nonce],
            ["body", _sha256_hex(body)],
        ],
        "content": "",
    }
    event_id = _compute_event_id(event)
    event["id"] = event_id
    event["sig"] = pk.sign_schnorr(bytes.fromhex(event_id), aux_randomness=b"\x00" * 32).hex()
    return event, pubkey_hex


class CheckinsHttpIntegrationTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.app = FastAPI()
        self.app.include_router(checkins_route.router)
        self.client = httpx.AsyncClient(
            transport=httpx.ASGITransport(app=self.app),
            base_url="http://testserver",
        )

    async def asyncTearDown(self):
        await self.client.aclose()

    async def test_intent_happy_path(self):
        nonce = "nonce12345"
        event, pubkey_hex = _build_signed_event(
            method="POST",
            path="/v1/checkins/intent",
            nonce=nonce,
            body=b"",
        )
        headers = {
            "x-auth-event": _b64url_json(event),
            "x-auth-nonce": nonce,
            "x-pubkey": pubkey_hex,
        }

        async def _consume_nonce_ok(scope: str, nonce_value: str, ttl_seconds: int = 120):
            return None

        async def _create_intent_ok(**kwargs):
            return {"intent_token": "sr_ci_demo", "expires_in_seconds": 120}

        with patch("app.api.v1.checkins._consume_checkins_nonce_once", new=_consume_nonce_ok), patch(
            "app.api.v1.checkins.create_checkin_intent",
            new=_create_intent_ok,
        ):
            resp = await self.client.post("/v1/checkins/intent?place_id=sr:demo:1", headers=headers)

        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["intent_token"], "sr_ci_demo")
        self.assertIn("expires_in_seconds", data)

    async def test_intent_invalid_signature(self):
        nonce = "nonce12345"
        event, pubkey_hex = _build_signed_event(
            method="POST",
            path="/v1/checkins/intent",
            nonce=nonce,
            body=b"",
        )
        event["sig"] = ("0" if event["sig"][0] != "0" else "1") + event["sig"][1:]
        headers = {
            "x-auth-event": _b64url_json(event),
            "x-auth-nonce": nonce,
            "x-pubkey": pubkey_hex,
        }

        async def _create_intent_should_not_run(**kwargs):
            raise AssertionError("create_checkin_intent should not be called for invalid signature")

        with patch("app.api.v1.checkins.create_checkin_intent", new=_create_intent_should_not_run):
            resp = await self.client.post("/v1/checkins/intent?place_id=sr:demo:1", headers=headers)

        self.assertEqual(resp.status_code, 401)
        self.assertEqual(resp.json().get("detail", {}).get("reason_code"), "invalid_auth_proof")

    async def test_status_query_maps_pending_and_ok(self):
        async def _redis_pending(key: str):
            return json.dumps({"state": "pending"}).encode("utf-8")

        async def _redis_ok(key: str):
            return json.dumps({"state": "ok"}).encode("utf-8")

        with patch("app.api.v1.checkins.redis_client.get", new=_redis_pending):
            pending_resp = await self.client.get("/v1/checkins/status?checkin_id=evt_pending")
        self.assertEqual(pending_resp.status_code, 200)
        self.assertEqual(pending_resp.json().get("status"), "pending")
        self.assertIsNone(pending_resp.json().get("reason_code"))

        with patch("app.api.v1.checkins.redis_client.get", new=_redis_ok):
            ok_resp = await self.client.get("/v1/checkins/status?checkin_id=evt_ok")
        self.assertEqual(ok_resp.status_code, 200)
        self.assertEqual(ok_resp.json().get("status"), "ok")
        self.assertIsNone(ok_resp.json().get("reason_code"))


if __name__ == "__main__":
    unittest.main()

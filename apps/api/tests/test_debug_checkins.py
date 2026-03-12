import unittest
from unittest.mock import patch

import httpx

from app.main import app, _evaluate_raw_event_indexer_eligibility


class _MappingsResult:
    def __init__(self, row):
        self._row = row

    def mappings(self):
        return self

    def first(self):
        return self._row


class _FakeConn:
    def __init__(
        self,
        *,
        submission_by_event: dict[str, dict | None] | None = None,
        ledger_by_event: dict[str, dict | None] | None = None,
        legacy_by_event: dict[str, dict | None] | None = None,
        state_by_event: dict[str, dict | None] | None = None,
        duplicate_winner_by_key: dict[tuple[str, str], str | None] | None = None,
        state_by_key: dict[tuple[str, str, int], dict | None] | None = None,
    ):
        self.submission_by_event = submission_by_event or {}
        self.ledger_by_event = ledger_by_event or {}
        self.legacy_by_event = legacy_by_event or {}
        self.state_by_event = state_by_event or {}
        self.duplicate_winner_by_key = duplicate_winner_by_key or {}
        self.state_by_key = state_by_key or {}

    async def execute(self, stmt, params=None):
        sql = str(stmt)
        params = params or {}
        if "FROM checkin_submissions" in sql:
            return _MappingsResult(self.submission_by_event.get(params.get("event_id")))
        if "FROM signals_v2_events" in sql and "WHERE event_id = :event_id" in sql:
            return _MappingsResult(self.ledger_by_event.get(params.get("event_id")))
        if "FROM signals_v2_state" in sql and "WHERE event_id = :event_id" in sql:
            return _MappingsResult(self.state_by_event.get(params.get("event_id")))
        if "FROM signals\n" in sql and "WHERE event_id = :event_id" in sql:
            return _MappingsResult(self.legacy_by_event.get(params.get("event_id")))
        if "FROM signals_v2_events" in sql and "WHERE pubkey = :pubkey" in sql:
            winner = self.duplicate_winner_by_key.get(
                (params.get("pubkey"), params.get("place_id"))
            )
            return _MappingsResult({"event_id": winner} if winner else None)
        if "FROM signals_v2_state" in sql and "WHERE pubkey = :pubkey" in sql:
            key = (params.get("pubkey"), params.get("place_id"), params.get("day_utc"))
            return _MappingsResult(self.state_by_key.get(key))
        raise AssertionError(f"unexpected SQL: {sql}")


class _FakeConnectCtx:
    def __init__(self, conn: _FakeConn):
        self._conn = conn

    async def __aenter__(self):
        return self._conn

    async def __aexit__(self, exc_type, exc, tb):
        return False


class _FakeEngine:
    def __init__(self, conn: _FakeConn):
        self._conn = conn

    def connect(self):
        return _FakeConnectCtx(self._conn)


class _FakeRedis:
    def __init__(self, values: dict[str, object] | None = None):
        self.values = values or {}

    async def get(self, key: str):
        return self.values.get(key)


class DebugCheckinsTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.client = httpx.AsyncClient(
            transport=httpx.ASGITransport(app=app),
            base_url="http://testserver",
        )

    async def asyncTearDown(self):
        await self.client.aclose()

    async def test_handoff_only(self):
        event_id = "a" * 64
        conn = _FakeConn()
        redis = _FakeRedis(
            {
                f"checkin:pending:{event_id}": b'{"state":"pending","reason_code":"indexing_delay"}',
                f"checkin:meta:{event_id}": b'{"place_id":"btcmap:1","pubkey":"' + ("b" * 64).encode() + b'"}',
            }
        )
        with patch("app.main.engine", new=_FakeEngine(conn)), patch(
            "app.main.redis_client", new=redis
        ):
            resp = await self.client.get(f"/debug/checkins/{event_id}")

        self.assertEqual(resp.status_code, 200)
        body = resp.json()
        self.assertEqual(body["diagnosis"]["code"], "handoff_only")
        self.assertFalse(body["durable_trace_exists"])
        self.assertTrue(body["ephemeral_trace_exists"])

    async def test_fully_confirmed(self):
        event_id = "c" * 64
        conn = _FakeConn(
            ledger_by_event={
                event_id: {
                    "event_id": event_id,
                    "pubkey": "d" * 64,
                    "place_id": "btcmap:2",
                    "status": "success",
                    "created_at": 1700000000,
                    "day_utc": 19675,
                }
            },
            state_by_event={
                event_id: {
                    "event_id": event_id,
                    "pubkey": "d" * 64,
                    "place_id": "btcmap:2",
                    "status": "success",
                    "created_at": 1700000000,
                    "day_utc": 19675,
                }
            },
        )
        with patch("app.main.engine", new=_FakeEngine(conn)), patch(
            "app.main.redis_client", new=_FakeRedis()
        ):
            resp = await self.client.get(f"/debug/checkins/{event_id}")

        self.assertEqual(resp.status_code, 200)
        body = resp.json()
        self.assertEqual(body["diagnosis"]["code"], "ledger_confirmed")
        self.assertFalse(body["diagnosis"]["state_rebuild_recommended"])
        self.assertTrue(body["durable_trace_exists"])
        self.assertFalse(body["ephemeral_trace_exists"])

    async def test_duplicate_resolved(self):
        event_id = "e" * 64
        winner_event_id = "f" * 64
        conn = _FakeConn(
            submission_by_event={
                event_id: {
                    "status": "pending",
                    "reason_code": "indexing_delay",
                    "place_id": "btcmap:3",
                    "pubkey": "1" * 64,
                    "confirmed_at": None,
                }
            },
            duplicate_winner_by_key={
                ("1" * 64, "btcmap:3"): winner_event_id,
            },
        )
        with patch("app.main.engine", new=_FakeEngine(conn)), patch(
            "app.main.redis_client", new=_FakeRedis()
        ):
            resp = await self.client.get(f"/debug/checkins/{event_id}")

        self.assertEqual(resp.status_code, 200)
        body = resp.json()
        self.assertEqual(body["diagnosis"]["code"], "duplicate_same_day_winner_elsewhere")
        self.assertEqual(body["duplicate_same_day"]["winner_event_id"], winner_event_id)
        self.assertTrue(body["duplicate_same_day"]["duplicate_event_id_prefilter_likely"])

    async def test_ledger_seen_state_pending(self):
        event_id = "9" * 64
        conn = _FakeConn(
            ledger_by_event={
                event_id: {
                    "event_id": event_id,
                    "pubkey": "8" * 64,
                    "place_id": "btcmap:4",
                    "status": "success",
                    "created_at": 1700001000,
                    "day_utc": 19675,
                }
            }
        )
        with patch("app.main.engine", new=_FakeEngine(conn)), patch(
            "app.main.redis_client", new=_FakeRedis()
        ):
            resp = await self.client.get(f"/debug/checkins/{event_id}")

        self.assertEqual(resp.status_code, 200)
        body = resp.json()
        self.assertEqual(body["diagnosis"]["code"], "ledger_seen_state_pending")
        self.assertTrue(body["diagnosis"]["state_rebuild_recommended"])

    async def test_missing_everywhere(self):
        event_id = "7" * 64
        with patch("app.main.engine", new=_FakeEngine(_FakeConn())), patch(
            "app.main.redis_client", new=_FakeRedis()
        ):
            resp = await self.client.get(f"/debug/checkins/{event_id}")

        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["diagnosis"]["code"], "missing_everywhere")

    async def test_malformed_redis_payload_does_not_crash(self):
        event_id = "6" * 64
        redis = _FakeRedis(
            {
                f"checkin:pending:{event_id}": b"{bad-json",
            }
        )
        with patch("app.main.engine", new=_FakeEngine(_FakeConn())), patch(
            "app.main.redis_client", new=redis
        ):
            resp = await self.client.get(f"/debug/checkins/{event_id}")

        self.assertEqual(resp.status_code, 200)
        body = resp.json()
        self.assertTrue(body["redis"]["pending"]["exists"])
        self.assertIsNone(body["redis"]["pending"]["state"])
        self.assertEqual(body["diagnosis"]["code"], "handoff_only")

    async def test_raw_event_missing_from_submission_diagnosis(self):
        event_id = "2" * 64
        conn = _FakeConn(
            submission_by_event={
                event_id: {
                    "status": "pending",
                    "reason_code": "indexing_delay",
                    "place_id": "btcmap:5",
                    "pubkey": "3" * 64,
                    "confirmed_at": None,
                    "raw_event": None,
                }
            }
        )
        with patch("app.main.engine", new=_FakeEngine(conn)), patch(
            "app.main.redis_client", new=_FakeRedis()
        ):
            resp = await self.client.get(f"/debug/checkins/{event_id}")

        self.assertEqual(resp.status_code, 200)
        body = resp.json()
        self.assertEqual(body["diagnosis"]["code"], "raw_event_missing_from_submission")
        self.assertFalse(body["diagnosis"]["state_rebuild_recommended"])
        self.assertFalse(body["checkin_submission"]["raw_event"]["exists"])

    async def test_raw_event_invalid_for_indexer_diagnosis(self):
        event_id = "4" * 64
        conn = _FakeConn(
            submission_by_event={
                event_id: {
                    "status": "pending",
                    "reason_code": "indexing_delay",
                    "place_id": "btcmap:6",
                    "pubkey": "5" * 64,
                    "confirmed_at": None,
                    "raw_event": {
                        "id": event_id,
                        "pubkey": "5" * 64,
                        "kind": 1,
                        "created_at": 1,
                        "tags": [],
                        "content": "",
                    },
                }
            }
        )
        with patch("app.main.engine", new=_FakeEngine(conn)), patch(
            "app.main.redis_client", new=_FakeRedis()
        ):
            resp = await self.client.get(f"/debug/checkins/{event_id}")

        self.assertEqual(resp.status_code, 200)
        body = resp.json()
        self.assertEqual(body["diagnosis"]["code"], "raw_event_invalid_for_indexer")
        reasons = body["checkin_submission"]["raw_event"]["eligibility"]["reasons"]
        self.assertIn("invalid_kind", reasons)
        self.assertIn("missing_place_tag", reasons)
        self.assertIn("missing_status_tag", reasons)

    async def test_ledger_missing_after_confirm_diagnosis(self):
        event_id = "7" * 64
        conn = _FakeConn(
            submission_by_event={
                event_id: {
                    "status": "confirmed",
                    "reason_code": "confirmed",
                    "place_id": "btcmap:7",
                    "pubkey": "8" * 64,
                    "confirmed_at": None,
                    "raw_event": {
                        "id": event_id,
                        "pubkey": "8" * 64,
                        "kind": 30331,
                        "created_at": 1700000000,
                        "tags": [["place", "btcmap:7"], ["status", "success"]],
                    },
                }
            }
        )
        with patch("app.main.engine", new=_FakeEngine(conn)), patch(
            "app.main.redis_client", new=_FakeRedis()
        ):
            resp = await self.client.get(f"/debug/checkins/{event_id}")

        self.assertEqual(resp.status_code, 200)
        body = resp.json()
        self.assertEqual(body["diagnosis"]["code"], "ledger_missing_after_confirm")
        self.assertFalse(body["diagnosis"]["state_rebuild_recommended"])

    async def test_legacy_only_ingested_is_flagged_inconsistent(self):
        event_id = "9" * 64
        conn = _FakeConn(
            submission_by_event={
                event_id: {
                    "status": "confirmed",
                    "reason_code": "confirmed",
                    "place_id": "btcmap:8",
                    "pubkey": "a" * 64,
                    "confirmed_at": None,
                    "raw_event": {
                        "id": event_id,
                        "pubkey": "a" * 64,
                        "kind": 30331,
                        "created_at": 1700000000,
                        "tags": [["place", "btcmap:8"], ["status", "success"]],
                    },
                }
            },
            legacy_by_event={
                event_id: {
                    "event_id": event_id,
                    "pubkey": "a" * 64,
                    "place_id": "btcmap:8",
                    "status": "success",
                    "created_at": 1700000000,
                }
            },
        )
        with patch("app.main.engine", new=_FakeEngine(conn)), patch(
            "app.main.redis_client", new=_FakeRedis()
        ):
            resp = await self.client.get(f"/debug/checkins/{event_id}")

        self.assertEqual(resp.status_code, 200)
        body = resp.json()
        self.assertFalse(body["v2_ingested"])
        self.assertTrue(body["legacy_ingested"])
        self.assertEqual(body["confirmation_source"], "legacy")
        self.assertFalse(body["status_semantics_consistent"])


class RawEventEligibilityTests(unittest.TestCase):
    def test_invalid_event_shape(self):
        result = _evaluate_raw_event_indexer_eligibility(
            {"kind": 1, "id": "a" * 64, "pubkey": "b" * 64, "created_at": 1, "tags": []},
            expected_event_id="a" * 64,
        )
        self.assertFalse(result["eligible"])
        self.assertIn("invalid_kind", result["reasons"])
        self.assertIn("missing_place_tag", result["reasons"])
        self.assertIn("missing_status_tag", result["reasons"])

    def test_valid_event_shape(self):
        event_id = "c" * 64
        result = _evaluate_raw_event_indexer_eligibility(
            {
                "kind": 30331,
                "id": event_id,
                "pubkey": "d" * 64,
                "created_at": 1700000000,
                "tags": [["v", "2"], ["place", "btcmap:1"], ["status", "success"]],
            },
            expected_event_id=event_id,
        )
        self.assertTrue(result["eligible"])

    def test_missing_v2_tag_is_ineligible(self):
        event_id = "e" * 64
        result = _evaluate_raw_event_indexer_eligibility(
            {
                "kind": 30331,
                "id": event_id,
                "pubkey": "f" * 64,
                "created_at": 1700000000,
                "tags": [["place", "btcmap:1"], ["status", "success"]],
            },
            expected_event_id=event_id,
        )
        self.assertFalse(result["eligible"])
        self.assertIn("missing_v2_tag", result["reasons"])


if __name__ == "__main__":
    unittest.main()

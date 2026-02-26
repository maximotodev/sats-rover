import unittest
from unittest.mock import AsyncMock, patch

from pydantic import ValidationError

from app.schemas.signal import CheckinConfirmIn, PlaceFeedOut
from app.services.places_service import parse_bbox
from app.services.signals_service import confirm_checkin, get_checkin_status


class PlacesAndSignalsTests(unittest.TestCase):
    def test_parse_bbox_normalizes_and_rounds(self):
        bbox = parse_bbox("-89.3004,13.6004,-89.6004,13.3004")
        self.assertEqual(bbox.canonical_str(), "-89.6,13.3,-89.3,13.6")

    def test_parse_bbox_rejects_invalid_ranges(self):
        with self.assertRaises(ValueError):
            parse_bbox("-189,10,-89,20")

    def test_place_feed_items_default_factory(self):
        a = PlaceFeedOut(place_id="btcmap:abc", confidence_score=0)
        b = PlaceFeedOut(place_id="btcmap:def", confidence_score=0)

        a.items.append(
            {
                "event_id": "a" * 64,
                "pubkey": "b" * 64,
                "status": "success",
                "content": "",
                "created_at": "2026-01-01T00:00:00Z",
            }
        )
        self.assertEqual(len(b.items), 0)

    def test_checkin_confirm_validates_hex(self):
        with self.assertRaises(ValidationError):
            CheckinConfirmIn(event_id="not-hex", place_id="btcmap:abc", pubkey="f" * 64)


class _MappingsResult:
    def __init__(self, row):
        self._row = row

    def mappings(self):
        return self

    def first(self):
        return self._row


class CheckinsIdempotencyTests(unittest.IsolatedAsyncioTestCase):
    async def test_confirm_duplicate_same_day_returns_ok_existing_event_id(self):
        db = AsyncMock()
        db.execute = AsyncMock(return_value=_MappingsResult({"event_id": "a" * 64}))
        payload = CheckinConfirmIn(
            event_id="b" * 64,
            place_id="btcmap:abc",
            pubkey="c" * 64,
            payment_evidence=None,
        )

        with patch("app.services.signals_service.redis_client.getdel", new=AsyncMock(return_value='{"place_id":"btcmap:abc"}')), patch(
            "app.services.signals_service.redis_client.setex",
            new=AsyncMock(return_value=True),
        ):
            out = await confirm_checkin(db=db, payload=payload, intent_token="sr_ci_demo")

        self.assertEqual(out.status, "ok")
        self.assertEqual(out.reason_code, "duplicate_checkin_same_day")
        self.assertEqual(out.event_id, "a" * 64)

    async def test_status_returns_pending_then_not_found_after_window(self):
        db = AsyncMock()
        db.execute = AsyncMock(return_value=_MappingsResult(None))

        probe_value: bytes | None = None

        async def _redis_get(key: str):
            nonlocal probe_value
            if key.startswith("checkin:pending:"):
                return None
            if key.startswith("checkin:meta:"):
                return None
            if key.startswith("checkin:probe:"):
                return probe_value
            return None

        async def _redis_setex(key: str, ttl: int, value: str):
            nonlocal probe_value
            if key.startswith("checkin:probe:"):
                probe_value = value.encode("utf-8")
            return True

        get_mock = AsyncMock(side_effect=_redis_get)
        with patch("app.services.signals_service.redis_client.get", new=get_mock), patch(
            "app.services.signals_service.redis_client.setex",
            new=AsyncMock(side_effect=_redis_setex),
        ), patch("app.services.signals_service.time.time", side_effect=[100, 130]):
            pending = await get_checkin_status(db=db, checkin_id="d" * 64)
            not_found = await get_checkin_status(db=db, checkin_id="d" * 64)

        self.assertEqual(pending.status, "pending")
        self.assertEqual(pending.reason_code, "indexing_delay")
        self.assertEqual(not_found.status, "not_found")
        self.assertEqual(not_found.reason_code, "unknown_checkin")

    async def test_confirm_creates_pending_submission_row(self):
        payload = CheckinConfirmIn(
            event_id="e" * 64,
            place_id="btcmap:abc",
            pubkey="f" * 64,
            payment_evidence={"invoice": "lnbc1demo"},
        )
        inserted_params = {}

        async def _db_execute(stmt, params):
            sql = str(stmt)
            if "FROM signals" in sql:
                return _MappingsResult(None)
            if "INSERT INTO checkin_submissions" in sql:
                inserted_params.update(params)
                return _MappingsResult(None)
            return _MappingsResult(None)

        db = AsyncMock()
        db.execute = AsyncMock(side_effect=_db_execute)

        with patch("app.services.signals_service.redis_client.getdel", new=AsyncMock(return_value='{"place_id":"btcmap:abc"}')), patch(
            "app.services.signals_service.redis_client.setex",
            new=AsyncMock(return_value=True),
        ):
            out = await confirm_checkin(db=db, payload=payload, intent_token="sr_ci_demo")

        self.assertEqual(out.status, "pending")
        self.assertEqual(out.reason_code, "indexing_delay")
        self.assertEqual(out.event_id, payload.event_id)
        self.assertEqual(inserted_params.get("event_id"), payload.event_id)
        self.assertEqual(inserted_params.get("pubkey"), payload.pubkey)
        self.assertEqual(inserted_params.get("place_id"), payload.place_id)
        self.assertEqual(inserted_params.get("reason_code"), "indexing_delay")

    async def test_status_returns_pending_from_db_when_redis_empty(self):
        db = AsyncMock()

        async def _db_execute(stmt, params):
            sql = str(stmt)
            if "FROM checkin_submissions" in sql:
                return _MappingsResult(
                    {
                        "event_id": "d" * 64,
                        "status": "pending",
                        "reason_code": "indexing_delay",
                    }
                )
            return _MappingsResult(None)

        db.execute = AsyncMock(side_effect=_db_execute)

        with patch("app.services.signals_service.redis_client.get", new=AsyncMock(return_value=None)):
            status = await get_checkin_status(db=db, checkin_id="d" * 64)

        self.assertEqual(status.status, "pending")
        self.assertEqual(status.reason_code, "indexing_delay")
        self.assertEqual(status.event_id, "d" * 64)

    async def test_confirm_returns_ok_when_signal_already_ingested(self):
        payload = CheckinConfirmIn(
            event_id="1" * 64,
            place_id="btcmap:abc",
            pubkey="2" * 64,
            payment_evidence=None,
        )
        calls = {"inserted": False, "updated": False}

        async def _db_execute(stmt, params):
            sql = str(stmt)
            if "FROM signals" in sql and "pubkey =" in sql:
                return _MappingsResult(None)
            if "INSERT INTO checkin_submissions" in sql:
                calls["inserted"] = True
                return _MappingsResult(None)
            if "SELECT event_id FROM signals WHERE event_id = :event_id" in sql:
                return _MappingsResult({"event_id": payload.event_id})
            if "UPDATE checkin_submissions" in sql:
                calls["updated"] = True
                self.assertEqual(params.get("event_id"), payload.event_id)
                return _MappingsResult(None)
            return _MappingsResult(None)

        db = AsyncMock()
        db.execute = AsyncMock(side_effect=_db_execute)

        with patch("app.services.signals_service.redis_client.getdel", new=AsyncMock(return_value='{"place_id":"btcmap:abc"}')), patch(
            "app.services.signals_service.redis_client.setex",
            new=AsyncMock(return_value=True),
        ):
            out = await confirm_checkin(db=db, payload=payload, intent_token="sr_ci_demo")

        self.assertTrue(calls["inserted"])
        self.assertTrue(calls["updated"])
        self.assertEqual(out.status, "ok")
        self.assertEqual(out.reason_code, "confirmed")
        self.assertEqual(out.event_id, payload.event_id)


if __name__ == "__main__":
    unittest.main()

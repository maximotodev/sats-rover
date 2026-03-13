import json
import unittest
from unittest.mock import AsyncMock, Mock, patch

from pydantic import ValidationError
from sqlalchemy.exc import DBAPIError

from app.schemas.signal import CheckinConfirmIn, PlaceFeedOut
from app.services.places_service import parse_bbox
from app.services.signals_service import (
    _persist_v2_event_metadata,
    confirm_checkin,
    get_checkin_status,
)


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


class _ExecuteResult:
    def __init__(self, rowcount: int):
        self.rowcount = rowcount

    def mappings(self):
        return self

    def first(self):
        return None


class CheckinsIdempotencyTests(unittest.IsolatedAsyncioTestCase):
    def _dbapi_error(self, message: str, *, sqlstate: str | None = None, pgcode: str | None = None):
        class _DummyOrig(Exception):
            def __init__(self, msg: str):
                super().__init__(msg)
                self.sqlstate = sqlstate
                self.pgcode = pgcode

        return DBAPIError("SELECT 1", {}, _DummyOrig(message))

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
                return _ExecuteResult(1)
            if "SELECT 1 AS one" in sql and "FROM checkin_submissions" in sql:
                return _MappingsResult({"one": 1})
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

    async def test_confirm_db_success_redis_failure_still_returns_pending(self):
        payload = CheckinConfirmIn(
            event_id="a" * 64,
            place_id="btcmap:abc",
            pubkey="b" * 64,
            payment_evidence=None,
        )
        warning_log = Mock()

        async def _db_execute(stmt, params):
            sql = str(stmt)
            if "FROM signals_v2_events" in sql and "WHERE event_id" in sql:
                return _MappingsResult(None)
            if "FROM signals" in sql and "pubkey =" in sql:
                return _MappingsResult(None)
            if "INSERT INTO checkin_submissions" in sql:
                return _ExecuteResult(1)
            if "SELECT 1 AS one" in sql and "FROM checkin_submissions" in sql:
                return _MappingsResult({"one": 1})
            return _MappingsResult(None)

        db = AsyncMock()
        db.execute = AsyncMock(side_effect=_db_execute)

        with patch(
            "app.services.signals_service.redis_client.getdel",
            new=AsyncMock(return_value='{"place_id":"btcmap:abc"}'),
        ), patch(
            "app.services.signals_service.redis_client.setex",
            new=AsyncMock(side_effect=RuntimeError("redis unavailable")),
        ), patch("app.services.signals_service.logger.warning", new=warning_log):
            out = await confirm_checkin(db=db, payload=payload, intent_token="sr_ci_demo")

        self.assertEqual(out.status, "pending")
        self.assertEqual(out.reason_code, "indexing_delay")
        warning_log.assert_called_once()
        _, kwargs = warning_log.call_args
        extra = kwargs.get("extra", {})
        self.assertEqual(extra.get("event_id"), payload.event_id)
        self.assertEqual(extra.get("reason_code"), "redis_write_failed")

    async def test_confirm_db_persist_failure_does_not_write_redis_handoff(self):
        payload = CheckinConfirmIn(
            event_id="c" * 64,
            place_id="btcmap:abc",
            pubkey="d" * 64,
            payment_evidence=None,
        )
        redis_setex_mock = AsyncMock(return_value=True)

        async def _db_execute(stmt, params):
            sql = str(stmt)
            if "FROM signals_v2_events" in sql and "WHERE event_id" in sql:
                return _MappingsResult(None)
            if "FROM signals" in sql and "pubkey =" in sql:
                return _MappingsResult(None)
            if "INSERT INTO checkin_submissions" in sql:
                raise RuntimeError("db write failed")
            return _MappingsResult(None)

        db = AsyncMock()
        db.execute = AsyncMock(side_effect=_db_execute)

        with patch(
            "app.services.signals_service.redis_client.getdel",
            new=AsyncMock(return_value='{"place_id":"btcmap:abc"}'),
        ), patch(
            "app.services.signals_service.redis_client.setex",
            new=redis_setex_mock,
        ):
            out = await confirm_checkin(db=db, payload=payload, intent_token="sr_ci_demo")

        self.assertEqual(out.status, "rejected")
        self.assertEqual(out.reason_code, "submission_persist_failed")
        redis_setex_mock.assert_not_awaited()

    async def test_confirm_db_commit_failure_returns_rejected_without_redis_handoff(self):
        payload = CheckinConfirmIn(
            event_id="1" * 64,
            place_id="btcmap:abc",
            pubkey="2" * 64,
            payment_evidence=None,
        )
        redis_setex_mock = AsyncMock(return_value=True)

        async def _db_execute(stmt, params):
            sql = str(stmt)
            if "FROM signals_v2_events" in sql and "WHERE event_id" in sql:
                return _MappingsResult(None)
            if "FROM signals" in sql and "pubkey =" in sql:
                return _MappingsResult(None)
            if "INSERT INTO checkin_submissions" in sql:
                return _ExecuteResult(1)
            return _MappingsResult(None)

        db = AsyncMock()
        db.execute = AsyncMock(side_effect=_db_execute)
        db.commit = AsyncMock(side_effect=RuntimeError("commit failed"))
        db.rollback = AsyncMock(return_value=None)

        with patch(
            "app.services.signals_service.redis_client.getdel",
            new=AsyncMock(return_value='{"place_id":"btcmap:abc"}'),
        ), patch(
            "app.services.signals_service.redis_client.setex",
            new=redis_setex_mock,
        ):
            out = await confirm_checkin(db=db, payload=payload, intent_token="sr_ci_demo")

        self.assertEqual(out.status, "rejected")
        self.assertEqual(out.reason_code, "submission_commit_failed")
        redis_setex_mock.assert_not_awaited()

    async def test_confirm_read_after_write_missing_returns_rejected_without_redis_handoff(self):
        payload = CheckinConfirmIn(
            event_id="3" * 64,
            place_id="btcmap:abc",
            pubkey="4" * 64,
            payment_evidence=None,
        )
        redis_setex_mock = AsyncMock(return_value=True)

        async def _db_execute(stmt, params):
            sql = str(stmt)
            if "FROM signals_v2_events" in sql and "WHERE event_id" in sql:
                return _MappingsResult(None)
            if "FROM signals" in sql and "pubkey =" in sql:
                return _MappingsResult(None)
            if "INSERT INTO checkin_submissions" in sql:
                return _ExecuteResult(1)
            if "SELECT 1 AS one" in sql and "FROM checkin_submissions" in sql:
                return _MappingsResult(None)
            return _MappingsResult(None)

        db = AsyncMock()
        db.execute = AsyncMock(side_effect=_db_execute)
        db.commit = AsyncMock(return_value=None)

        with patch(
            "app.services.signals_service.redis_client.getdel",
            new=AsyncMock(return_value='{"place_id":"btcmap:abc"}'),
        ), patch(
            "app.services.signals_service.redis_client.setex",
            new=redis_setex_mock,
        ):
            out = await confirm_checkin(db=db, payload=payload, intent_token="sr_ci_demo")

        self.assertEqual(out.status, "rejected")
        self.assertEqual(out.reason_code, "submission_not_durable")
        redis_setex_mock.assert_not_awaited()

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

    async def test_status_prefers_durable_submission_over_redis_only_handoff(self):
        db = AsyncMock()

        async def _db_execute(stmt, params):
            sql = str(stmt)
            if "FROM signals_v2_events" in sql and "WHERE event_id" in sql:
                return _MappingsResult(None)
            if "FROM checkin_submissions" in sql:
                return _MappingsResult(
                    {
                        "event_id": "e" * 64,
                        "status": "pending",
                        "reason_code": "indexing_delay",
                    }
                )
            return _MappingsResult(None)

        db.execute = AsyncMock(side_effect=_db_execute)

        with patch(
            "app.services.signals_service.redis_client.get",
            new=AsyncMock(return_value='{"state":"failed","reason_code":"relay_publish_failed","event_id":"' + ("e" * 64) + '"}'),
        ):
            status = await get_checkin_status(db=db, checkin_id="e" * 64)

        self.assertEqual(status.status, "pending")
        self.assertEqual(status.reason_code, "indexing_delay")
        self.assertEqual(status.event_id, "e" * 64)

    async def test_status_submission_confirmed_without_ledger_not_confirmed(self):
        checkin_id = "9" * 64
        db = AsyncMock()

        async def _db_execute(stmt, params):
            sql = str(stmt)
            if "FROM signals_v2_events" in sql and "WHERE event_id" in sql:
                return _MappingsResult(None)
            if "FROM checkin_submissions" in sql:
                return _MappingsResult(
                    {
                        "event_id": checkin_id,
                        "status": "confirmed",
                        "reason_code": "confirmed",
                    }
                )
            return _MappingsResult(None)

        db.execute = AsyncMock(side_effect=_db_execute)

        async def _redis_get(key: str):
            if key.startswith("checkin:pending:"):
                return None
            if key.startswith("checkin:meta:"):
                return None
            if key.startswith("checkin:probe:"):
                return b"0"
            return None

        with patch("app.services.signals_service.redis_client.get", new=AsyncMock(side_effect=_redis_get)), patch(
            "app.services.signals_service.time.time",
            return_value=100,
        ):
            status = await get_checkin_status(db=db, checkin_id=checkin_id)

        self.assertEqual(status.status, "failed")
        self.assertEqual(status.reason_code, "ledger_missing_after_confirm")
        self.assertEqual(status.event_id, checkin_id)

    async def test_status_legacy_only_ingestion_does_not_confirm(self):
        checkin_id = "a" * 64
        db = AsyncMock()

        async def _db_execute(stmt, params):
            sql = str(stmt)
            if "FROM signals_v2_events" in sql and "WHERE event_id" in sql:
                return _MappingsResult(None)
            if "FROM checkin_submissions" in sql:
                return _MappingsResult(
                    {
                        "event_id": checkin_id,
                        "status": "confirmed",
                        "reason_code": "confirmed",
                    }
                )
            if "FROM signals" in sql and "WHERE event_id" in sql:
                return _MappingsResult({"one": 1})
            return _MappingsResult(None)

        db.execute = AsyncMock(side_effect=_db_execute)

        async def _redis_get(key: str):
            if key.startswith("checkin:pending:"):
                return None
            if key.startswith("checkin:meta:"):
                return None
            if key.startswith("checkin:probe:"):
                return b"0"
            return None

        with patch("app.services.signals_service.redis_client.get", new=AsyncMock(side_effect=_redis_get)), patch(
            "app.services.signals_service.time.time",
            return_value=100,
        ):
            status = await get_checkin_status(db=db, checkin_id=checkin_id)

        self.assertNotEqual(status.status, "ok")
        self.assertEqual(status.reason_code, "ledger_missing_after_confirm")

    async def test_status_ledger_hit_confirms_without_submission(self):
        checkin_id = "a" * 64
        calls = {"updated": False}

        async def _db_execute(stmt, params):
            sql = str(stmt)
            if "FROM signals_v2_events" in sql and "WHERE event_id" in sql:
                return _MappingsResult({"one": 1})
            if "UPDATE checkin_submissions" in sql:
                calls["updated"] = True
                self.assertEqual(params.get("event_id"), checkin_id)
                return _MappingsResult(None)
            return _MappingsResult(None)

        db = AsyncMock()
        db.execute = AsyncMock(side_effect=_db_execute)

        with patch("app.services.signals_service.redis_client.get", new=AsyncMock(side_effect=AssertionError("redis not expected"))), patch(
            "app.services.signals_service.redis_client.delete",
            new=AsyncMock(return_value=0),
        ):
            status = await get_checkin_status(db=db, checkin_id=checkin_id)

        self.assertEqual(status.status, "ok")
        self.assertEqual(status.reason_code, "confirmed")
        self.assertEqual(status.event_id, checkin_id)
        self.assertTrue(calls["updated"])

    async def test_status_ledger_hit_confirms_and_updates_pending_submission(self):
        checkin_id = "b" * 64
        update_sql_seen = False

        async def _db_execute(stmt, params):
            nonlocal update_sql_seen
            sql = str(stmt)
            if "FROM signals_v2_events" in sql and "WHERE event_id" in sql:
                return _MappingsResult({"one": 1})
            if "UPDATE checkin_submissions" in sql:
                update_sql_seen = True
                self.assertIn("AND status = 'pending'", sql)
                self.assertEqual(params.get("event_id"), checkin_id)
                return _MappingsResult(None)
            return _MappingsResult(None)

        db = AsyncMock()
        db.execute = AsyncMock(side_effect=_db_execute)

        with patch("app.services.signals_service.redis_client.get", new=AsyncMock(side_effect=AssertionError("redis not expected"))), patch(
            "app.services.signals_service.redis_client.delete",
            new=AsyncMock(return_value=0),
        ):
            status = await get_checkin_status(db=db, checkin_id=checkin_id)

        self.assertEqual(status.status, "ok")
        self.assertEqual(status.reason_code, "confirmed")
        self.assertEqual(status.event_id, checkin_id)
        self.assertTrue(update_sql_seen)

    async def test_status_ledger_hit_confirms_when_state_missing(self):
        checkin_id = "c" * 64

        async def _db_execute(stmt, params):
            sql = str(stmt)
            if "FROM signals_v2_events" in sql and "WHERE event_id" in sql:
                return _MappingsResult({"one": 1})
            if "UPDATE checkin_submissions" in sql:
                return _MappingsResult(None)
            return _MappingsResult(None)

        db = AsyncMock()
        db.execute = AsyncMock(side_effect=_db_execute)

        with patch("app.services.signals_service.redis_client.get", new=AsyncMock(side_effect=AssertionError("redis not expected"))), patch(
            "app.services.signals_service.redis_client.delete",
            new=AsyncMock(return_value=0),
        ):
            status = await get_checkin_status(db=db, checkin_id=checkin_id)

        self.assertEqual(status.status, "ok")
        self.assertEqual(status.reason_code, "confirmed")
        self.assertEqual(status.event_id, checkin_id)

    async def test_status_ledger_hit_cleans_stale_redis_handoff_keys(self):
        checkin_id = "d" * 64

        async def _db_execute(stmt, params):
            sql = str(stmt)
            if "FROM signals_v2_events" in sql and "WHERE event_id" in sql:
                return _MappingsResult({"one": 1})
            if "UPDATE checkin_submissions" in sql:
                return _MappingsResult(None)
            return _MappingsResult(None)

        db = AsyncMock()
        db.execute = AsyncMock(side_effect=_db_execute)
        delete_mock = AsyncMock(return_value=3)

        with patch(
            "app.services.signals_service.redis_client.delete",
            new=delete_mock,
        ):
            status = await get_checkin_status(db=db, checkin_id=checkin_id)

        self.assertEqual(status.status, "ok")
        self.assertEqual(status.reason_code, "confirmed")
        delete_mock.assert_awaited_once_with(
            f"checkin:pending:{checkin_id}",
            f"checkin:meta:{checkin_id}",
            f"checkin:probe:{checkin_id}",
        )

    async def test_status_ledger_hit_redis_cleanup_failure_does_not_block_confirmation(self):
        checkin_id = "e" * 64

        async def _db_execute(stmt, params):
            sql = str(stmt)
            if "FROM signals_v2_events" in sql and "WHERE event_id" in sql:
                return _MappingsResult({"one": 1})
            if "UPDATE checkin_submissions" in sql:
                return _MappingsResult(None)
            return _MappingsResult(None)

        db = AsyncMock()
        db.execute = AsyncMock(side_effect=_db_execute)

        with patch(
            "app.services.signals_service.redis_client.delete",
            new=AsyncMock(side_effect=RuntimeError("redis down")),
        ), patch("app.services.signals_service.logger.warning", new=Mock()) as warning_log:
            status = await get_checkin_status(db=db, checkin_id=checkin_id)

        self.assertEqual(status.status, "ok")
        self.assertEqual(status.reason_code, "confirmed")
        warning_log.assert_called_once()

    async def test_status_v2_missing_relation_does_not_confirm_from_legacy(self):
        checkin_id = "f" * 64
        exc = self._dbapi_error(
            'relation "signals_v2_events" does not exist',
            sqlstate="42P01",
        )

        async def _db_execute(stmt, params):
            sql = str(stmt)
            if "FROM signals_v2_events" in sql and "WHERE event_id" in sql:
                raise exc
            if "FROM signals" in sql and "WHERE event_id" in sql:
                return _MappingsResult({"one": 1})
            if "UPDATE checkin_submissions" in sql:
                return _MappingsResult(None)
            return _MappingsResult(None)

        db = AsyncMock()
        db.execute = AsyncMock(side_effect=_db_execute)

        with self.assertRaises(DBAPIError):
            await get_checkin_status(db=db, checkin_id=checkin_id)

    async def test_status_non_eligible_db_error_raises(self):
        checkin_id = "1" * 64
        exc = self._dbapi_error(
            'relation "signals_v2_events" does not exist',
            sqlstate="23505",
        )

        async def _db_execute(stmt, params):
            sql = str(stmt)
            if "FROM signals_v2_events" in sql and "WHERE event_id" in sql:
                raise exc
            return _MappingsResult(None)

        db = AsyncMock()
        db.execute = AsyncMock(side_effect=_db_execute)

        with self.assertRaises(DBAPIError):
            await get_checkin_status(db=db, checkin_id=checkin_id)

    async def test_status_pending_handoff_no_ledger_row_still_pending(self):
        checkin_id = "f" * 64
        db = AsyncMock()

        async def _db_execute(stmt, params):
            sql = str(stmt)
            if "FROM signals_v2_events" in sql and "WHERE event_id" in sql:
                return _MappingsResult(None)
            if "FROM checkin_submissions" in sql:
                return _MappingsResult(None)
            return _MappingsResult(None)

        db.execute = AsyncMock(side_effect=_db_execute)

        with patch(
            "app.services.signals_service.redis_client.get",
            new=AsyncMock(
                return_value='{"state":"pending","reason_code":"indexing_delay","event_id":"'
                + checkin_id
                + '"}'
            ),
        ):
            status = await get_checkin_status(db=db, checkin_id=checkin_id)

        self.assertEqual(status.status, "pending")
        self.assertEqual(status.reason_code, "indexing_delay")
        self.assertEqual(status.event_id, checkin_id)

    async def test_status_no_ledger_no_traces_not_found_unchanged(self):
        checkin_id = "1" * 64
        db = AsyncMock()

        async def _db_execute(stmt, params):
            sql = str(stmt)
            if "FROM signals_v2_events" in sql and "WHERE event_id" in sql:
                return _MappingsResult(None)
            if "FROM checkin_submissions" in sql:
                return _MappingsResult(None)
            return _MappingsResult(None)

        db.execute = AsyncMock(side_effect=_db_execute)

        async def _redis_get(key: str):
            if key.startswith("checkin:pending:"):
                return None
            if key.startswith("checkin:meta:"):
                return None
            if key.startswith("checkin:probe:"):
                return b"0"
            return None

        with patch("app.services.signals_service.redis_client.get", new=AsyncMock(side_effect=_redis_get)), patch(
            "app.services.signals_service.time.time",
            return_value=100,
        ):
            status = await get_checkin_status(db=db, checkin_id=checkin_id)

        self.assertEqual(status.status, "not_found")
        self.assertEqual(status.reason_code, "unknown_checkin")
        self.assertEqual(status.event_id, checkin_id)

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
            if "FROM signals_v2_events" in sql and "WHERE event_id" in sql:
                return _MappingsResult({"one": 1})
            if "INSERT INTO checkin_submissions" in sql:
                calls["inserted"] = True
                return _MappingsResult(None)
            if "SELECT 1 AS one" in sql and "FROM checkin_submissions" in sql:
                return _MappingsResult({"one": 1})
            if "UPDATE checkin_submissions" in sql:
                calls["updated"] = True
                self.assertEqual(params.get("event_id"), payload.event_id)
                return _MappingsResult(None)
            return _MappingsResult(None)

        db = AsyncMock()
        db.execute = AsyncMock(side_effect=_db_execute)

        delete_mock = AsyncMock(return_value=3)
        with patch("app.services.signals_service.redis_client.getdel", new=AsyncMock(return_value='{"place_id":"btcmap:abc"}')), patch(
            "app.services.signals_service.redis_client.setex",
            new=AsyncMock(return_value=True),
        ), patch("app.services.signals_service.redis_client.delete", new=delete_mock):
            out = await confirm_checkin(db=db, payload=payload, intent_token="sr_ci_demo")

        self.assertTrue(calls["inserted"])
        self.assertTrue(calls["updated"])
        self.assertEqual(out.status, "ok")
        self.assertEqual(out.reason_code, "confirmed")
        self.assertEqual(out.event_id, payload.event_id)
        delete_mock.assert_awaited_once_with(
            f"checkin:pending:{payload.event_id}",
            f"checkin:meta:{payload.event_id}",
            f"checkin:probe:{payload.event_id}",
        )

    async def test_confirm_ledger_hit_redis_cleanup_failure_does_not_block_ok(self):
        payload = CheckinConfirmIn(
            event_id="f" * 64,
            place_id="btcmap:abc",
            pubkey="a" * 64,
            payment_evidence=None,
        )

        async def _db_execute(stmt, params):
            sql = str(stmt)
            if "FROM signals" in sql and "pubkey =" in sql:
                return _MappingsResult(None)
            if "FROM signals_v2_events" in sql and "WHERE event_id" in sql:
                return _MappingsResult({"one": 1})
            if "INSERT INTO checkin_submissions" in sql:
                return _MappingsResult(None)
            if "SELECT 1 AS one" in sql and "FROM checkin_submissions" in sql:
                return _MappingsResult({"one": 1})
            if "UPDATE checkin_submissions" in sql:
                return _MappingsResult(None)
            return _MappingsResult(None)

        db = AsyncMock()
        db.execute = AsyncMock(side_effect=_db_execute)
        warning_log = Mock()

        with patch("app.services.signals_service.redis_client.getdel", new=AsyncMock(return_value='{"place_id":"btcmap:abc"}')), patch(
            "app.services.signals_service.redis_client.setex",
            new=AsyncMock(return_value=True),
        ), patch(
            "app.services.signals_service.redis_client.delete",
            new=AsyncMock(side_effect=RuntimeError("redis down")),
        ), patch("app.services.signals_service.logger.warning", new=warning_log):
            out = await confirm_checkin(db=db, payload=payload, intent_token="sr_ci_demo")

        self.assertEqual(out.status, "ok")
        self.assertEqual(out.reason_code, "confirmed")
        warning_log.assert_called_once()

    async def test_confirm_rejects_when_submission_not_persisted(self):
        payload = CheckinConfirmIn(
            event_id="2" * 64,
            place_id="btcmap:abc",
            pubkey="3" * 64,
            payment_evidence=None,
        )

        async def _db_execute(stmt, params):
            sql = str(stmt)
            if "FROM signals_v2_events" in sql and "WHERE event_id" in sql:
                return _MappingsResult(None)
            if "FROM signals" in sql and "pubkey =" in sql:
                return _MappingsResult(None)
            if "INSERT INTO checkin_submissions" in sql:
                return _ExecuteResult(0)
            return _MappingsResult(None)

        db = AsyncMock()
        db.execute = AsyncMock(side_effect=_db_execute)

        with patch("app.services.signals_service.redis_client.getdel", new=AsyncMock(return_value='{"place_id":"btcmap:abc"}')), patch(
            "app.services.signals_service.redis_client.setex",
            new=AsyncMock(return_value=True),
        ):
            out = await confirm_checkin(db=db, payload=payload, intent_token="sr_ci_demo")

        self.assertEqual(out.status, "rejected")
        self.assertEqual(out.reason_code, "submission_persist_failed")
        self.assertEqual(out.event_id, payload.event_id)

    async def test_confirm_persists_raw_event_and_payment_evidence(self):
        payload = CheckinConfirmIn(
            event_id="3" * 64,
            place_id="btcmap:abc",
            pubkey="4" * 64,
            payment_evidence={"invoice": "lnbc1demo"},
            raw_event={"id": "3" * 64, "kind": 30331},
        )
        inserted_params = {}
        insert_sql = ""

        async def _db_execute(stmt, params):
            nonlocal insert_sql
            sql = str(stmt)
            if "FROM signals" in sql and "pubkey =" in sql:
                return _MappingsResult(None)
            if "INSERT INTO checkin_submissions" in sql:
                insert_sql = sql
                inserted_params.update(params)
                return _MappingsResult(None)
            if "FROM signals_v2_events" in sql and "WHERE event_id" in sql:
                return _MappingsResult(None)
            if "SELECT 1 AS one" in sql and "FROM checkin_submissions" in sql:
                return _MappingsResult({"one": 1})
            return _MappingsResult(None)

        db = AsyncMock()
        db.execute = AsyncMock(side_effect=_db_execute)

        with patch("app.services.signals_service.redis_client.getdel", new=AsyncMock(return_value='{"place_id":"btcmap:abc"}')), patch(
            "app.services.signals_service.redis_client.setex",
            new=AsyncMock(return_value=True),
        ):
            out = await confirm_checkin(db=db, payload=payload, intent_token="sr_ci_demo")

        self.assertEqual(out.status, "pending")
        self.assertEqual(inserted_params.get("raw_event"), '{"id":"' + ("3" * 64) + '","kind":30331}')
        self.assertEqual(inserted_params.get("payment_evidence"), '{"invoice":"lnbc1demo"}')
        self.assertIn("ON CONFLICT (event_id) DO UPDATE", insert_sql)
        self.assertIn("COALESCE(checkin_submissions.raw_event, EXCLUDED.raw_event)", insert_sql)
        self.assertIn(
            "COALESCE(checkin_submissions.payment_evidence, EXCLUDED.payment_evidence)",
            insert_sql,
        )

    async def test_confirm_idempotent_repeated_calls_safe(self):
        payload = CheckinConfirmIn(
            event_id="5" * 64,
            place_id="btcmap:abc",
            pubkey="6" * 64,
            payment_evidence={"invoice": "lnbc1demo"},
            raw_event={"id": "5" * 64, "kind": 30331},
        )
        insert_params_calls = []

        async def _db_execute(stmt, params):
            sql = str(stmt)
            if "FROM signals" in sql and "pubkey =" in sql:
                return _MappingsResult(None)
            if "INSERT INTO checkin_submissions" in sql:
                insert_params_calls.append(dict(params))
                return _MappingsResult(None)
            if "FROM signals_v2_events" in sql and "WHERE event_id" in sql:
                return _MappingsResult(None)
            if "SELECT 1 AS one" in sql and "FROM checkin_submissions" in sql:
                return _MappingsResult({"one": 1})
            return _MappingsResult(None)

        db = AsyncMock()
        db.execute = AsyncMock(side_effect=_db_execute)

        with patch("app.services.signals_service.redis_client.getdel", new=AsyncMock(return_value='{"place_id":"btcmap:abc"}')), patch(
            "app.services.signals_service.redis_client.setex",
            new=AsyncMock(return_value=True),
        ):
            out1 = await confirm_checkin(db=db, payload=payload, intent_token="sr_ci_demo")
        with patch("app.services.signals_service.redis_client.getdel", new=AsyncMock(return_value='{"place_id":"btcmap:abc"}')), patch(
            "app.services.signals_service.redis_client.setex",
            new=AsyncMock(return_value=True),
        ):
            out2 = await confirm_checkin(db=db, payload=payload, intent_token="sr_ci_demo")

        self.assertEqual(out1.status, "pending")
        self.assertEqual(out2.status, "pending")
        self.assertEqual(len(insert_params_calls), 2)
        self.assertEqual(insert_params_calls[0].get("event_id"), payload.event_id)
        self.assertEqual(insert_params_calls[1].get("event_id"), payload.event_id)
        self.assertEqual(insert_params_calls[0].get("raw_event"), insert_params_calls[1].get("raw_event"))
        self.assertEqual(
            insert_params_calls[0].get("payment_evidence"),
            insert_params_calls[1].get("payment_evidence"),
        )

    async def test_confirm_logs_do_not_include_sensitive_payload_bodies(self):
        payload = CheckinConfirmIn(
            event_id="7" * 64,
            place_id="btcmap:abc",
            pubkey="8" * 64,
            payment_evidence={"invoice": "lnbc1secret"},
            raw_event={"id": "7" * 64, "content": "sensitive"},
        )

        async def _db_execute(stmt, params):
            sql = str(stmt)
            if "FROM signals" in sql and "pubkey =" in sql:
                return _MappingsResult(None)
            if "FROM signals_v2_events" in sql and "WHERE event_id" in sql:
                return _MappingsResult(None)
            if "SELECT 1 AS one" in sql and "FROM checkin_submissions" in sql:
                return _MappingsResult({"one": 1})
            return _MappingsResult(None)

        db = AsyncMock()
        db.execute = AsyncMock(side_effect=_db_execute)
        log_mock = Mock()

        with patch("app.services.signals_service.redis_client.getdel", new=AsyncMock(return_value='{"place_id":"btcmap:abc"}')), patch(
            "app.services.signals_service.redis_client.setex",
            new=AsyncMock(return_value=True),
        ), patch("app.services.signals_service.logger.info", new=log_mock):
            out = await confirm_checkin(db=db, payload=payload, intent_token="sr_ci_demo")

        self.assertEqual(out.status, "pending")
        self.assertGreaterEqual(log_mock.call_count, 1)
        for _, kwargs in log_mock.call_args_list:
            extra = kwargs.get("extra", {})
            self.assertNotIn("raw_event", extra)
            self.assertNotIn("payment_evidence", extra)

    async def test_persist_v2_event_metadata_does_not_log_conflict_for_semantically_equal_json_different_key_order(self):
        db = AsyncMock()
        warning_log = Mock()
        update_executed = False

        async def _db_execute(stmt, params):
            sql = str(stmt)
            nonlocal update_executed
            if "FROM signals_v2_events" in sql and "AS raw_event_conflict" in sql:
                stored_raw = {"b": 2, "a": 1}
                stored_pay = {"y": 2, "x": 1}
                incoming_raw = (
                    json.loads(params["raw_event"])
                    if params.get("raw_event") is not None
                    else None
                )
                incoming_pay = (
                    json.loads(params["payment_evidence"])
                    if params.get("payment_evidence") is not None
                    else None
                )
                raw_event_conflict = (
                    incoming_raw != stored_raw
                    if incoming_raw is not None
                    else False
                )
                payment_evidence_conflict = (
                    incoming_pay != stored_pay
                    if incoming_pay is not None
                    else False
                )
                return _MappingsResult(
                    {
                        "raw_event_conflict": raw_event_conflict,
                        "payment_evidence_conflict": payment_evidence_conflict,
                    }
                )
            if "UPDATE signals_v2_events" in sql:
                update_executed = True
                return _MappingsResult(None)
            return _MappingsResult(None)

        db.execute = AsyncMock(side_effect=_db_execute)

        with patch("app.services.signals_service.logger.warning", new=warning_log):
            await _persist_v2_event_metadata(
                db=db,
                event_id="9" * 64,
                raw_event_json='{"a":1,"b":2}',
                payment_evidence_json='{"x":1,"y":2}',
            )

        self.assertTrue(update_executed)
        warning_log.assert_not_called()

    async def test_persist_v2_event_metadata_returns_early_on_conflict(self):
        db = AsyncMock()
        warning_log = Mock()
        update_executed = False

        async def _db_execute(stmt, params):
            sql = str(stmt)
            nonlocal update_executed
            if "FROM signals_v2_events" in sql and "AS raw_event_conflict" in sql:
                return _MappingsResult(
                    {
                        "raw_event_conflict": True,
                        "payment_evidence_conflict": False,
                    }
                )
            if "UPDATE signals_v2_events" in sql:
                update_executed = True
                return _MappingsResult(None)
            return _MappingsResult(None)

        db.execute = AsyncMock(side_effect=_db_execute)

        with patch("app.services.signals_service.logger.warning", new=warning_log):
            await _persist_v2_event_metadata(
                db=db,
                event_id="9" * 64,
                raw_event_json='{"id":"incoming"}',
                payment_evidence_json='{"invoice":"incoming"}',
            )

        self.assertFalse(update_executed)
        warning_log.assert_called_once()
        _, kwargs = warning_log.call_args
        extra = kwargs.get("extra", {})
        self.assertEqual(extra.get("event_id"), "9" * 64)
        self.assertTrue(extra.get("raw_event_conflict"))
        self.assertFalse(extra.get("payment_evidence_conflict"))
        self.assertEqual(
            set(extra.keys()),
            {"event_id", "raw_event_conflict", "payment_evidence_conflict"},
        )


if __name__ == "__main__":
    unittest.main()

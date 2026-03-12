import unittest
from unittest.mock import patch

import httpx
from sqlalchemy.exc import DBAPIError

from app.main import app


class _ScalarResult:
    def __init__(self, value: int):
        self._value = value

    def scalar_one(self):
        return self._value

    def scalar_one_or_none(self):
        return self._value


class _FakeConn:
    def __init__(
        self,
        *,
        value_json_sync_at: str | None,
        legacy_value_sync_at: int | None,
        v2_signals: int,
        v1_signals: int,
        v2_exc: Exception | None = None,
    ):
        self._value_json_sync_at = value_json_sync_at
        self._legacy_value_sync_at = legacy_value_sync_at
        self._v2_signals = v2_signals
        self._v1_signals = v1_signals
        self._v2_exc = v2_exc

    async def execute(self, stmt):
        sql = str(stmt)
        if "FROM places" in sql:
            return _ScalarResult(0)
        if "FROM signals_v2_events" in sql:
            if self._v2_exc is not None:
                raise self._v2_exc
            return _ScalarResult(self._v2_signals)
        if "FROM signals" in sql:
            return _ScalarResult(self._v1_signals)
        if "FROM ingestion_state" in sql:
            assert "value_json->>'last_places_sync_at' AS json_last_places_sync_at" in sql
            assert "value AS legacy_value" in sql
            return _MappingsResult(
                {
                    "json_last_places_sync_at": self._value_json_sync_at,
                    "legacy_value": self._legacy_value_sync_at,
                }
            )
        raise AssertionError(f"unexpected SQL: {sql}")


class _FakeConnectCtx:
    def __init__(
        self,
        *,
        value_json_sync_at: str | None,
        legacy_value_sync_at: int | None,
        v2_signals: int,
        v1_signals: int,
        v2_exc: Exception | None = None,
    ):
        self._value_json_sync_at = value_json_sync_at
        self._legacy_value_sync_at = legacy_value_sync_at
        self._v2_signals = v2_signals
        self._v1_signals = v1_signals
        self._v2_exc = v2_exc

    async def __aenter__(self):
        return _FakeConn(
            value_json_sync_at=self._value_json_sync_at,
            legacy_value_sync_at=self._legacy_value_sync_at,
            v2_signals=self._v2_signals,
            v1_signals=self._v1_signals,
            v2_exc=self._v2_exc,
        )

    async def __aexit__(self, exc_type, exc, tb):
        return False


class _FakeEngine:
    def __init__(
        self,
        *,
        value_json_sync_at: str | None,
        legacy_value_sync_at: int | None,
        v2_signals: int = 9,
        v1_signals: int = 7,
        v2_exc: Exception | None = None,
    ):
        self._value_json_sync_at = value_json_sync_at
        self._legacy_value_sync_at = legacy_value_sync_at
        self._v2_signals = v2_signals
        self._v1_signals = v1_signals
        self._v2_exc = v2_exc

    def connect(self):
        return _FakeConnectCtx(
            value_json_sync_at=self._value_json_sync_at,
            legacy_value_sync_at=self._legacy_value_sync_at,
            v2_signals=self._v2_signals,
            v1_signals=self._v1_signals,
            v2_exc=self._v2_exc,
        )


class _MappingsResult:
    def __init__(self, row):
        self._row = row

    def mappings(self):
        return self

    def first(self):
        return self._row


class DebugCountsTests(unittest.IsolatedAsyncioTestCase):
    def _dbapi_error(self, message: str, *, sqlstate: str | None = None, pgcode: str | None = None):
        class _DummyOrig(Exception):
            def __init__(self, msg: str):
                super().__init__(msg)
                self.sqlstate = sqlstate
                self.pgcode = pgcode

        return DBAPIError("SELECT count(*)", {}, _DummyOrig(message))

    async def asyncSetUp(self):
        self.client = httpx.AsyncClient(
            transport=httpx.ASGITransport(app=app),
            base_url="http://testserver",
        )

    async def asyncTearDown(self):
        await self.client.aclose()

    async def test_debug_counts_includes_places_empty_flag(self):
        with patch(
            "app.main.engine",
            new=_FakeEngine(value_json_sync_at=None, legacy_value_sync_at=None),
        ):
            resp = await self.client.get("/debug/counts")

        self.assertEqual(resp.status_code, 200)
        body = resp.json()
        self.assertEqual(body.get("places"), 0)
        self.assertEqual(body.get("signals"), 9)
        self.assertTrue(body.get("places_empty"))
        self.assertIsNone(body.get("last_places_sync_at"))

    async def test_debug_counts_prefers_value_json_timestamp_when_present(self):
        with patch(
            "app.main.engine",
            new=_FakeEngine(
                value_json_sync_at="2026-03-06T01:02:03+00:00",
                legacy_value_sync_at=1735689600,
            ),
        ):
            resp = await self.client.get("/debug/counts")

        self.assertEqual(resp.status_code, 200)
        body = resp.json()
        self.assertEqual(body.get("places"), 0)
        self.assertEqual(body.get("signals"), 9)
        self.assertTrue(body.get("places_empty"))
        self.assertEqual(body.get("last_places_sync_at"), "2026-03-06T01:02:03+00:00")

    async def test_debug_counts_falls_back_to_legacy_value_when_json_missing(self):
        with patch(
            "app.main.engine",
            new=_FakeEngine(
                value_json_sync_at=None,
                legacy_value_sync_at=1738461722,
            ),
        ):
            resp = await self.client.get("/debug/counts")

        self.assertEqual(resp.status_code, 200)
        body = resp.json()
        self.assertEqual(body.get("places"), 0)
        self.assertEqual(body.get("signals"), 9)
        self.assertTrue(body.get("places_empty"))
        self.assertEqual(body.get("last_places_sync_at"), "2025-02-02T02:02:02+00:00")

    async def test_debug_counts_falls_back_to_legacy_signals_when_v2_table_missing(self):
        exc = self._dbapi_error(
            'relation "signals_v2_events" does not exist',
            sqlstate="42P01",
        )
        with patch(
            "app.main.engine",
            new=_FakeEngine(
                value_json_sync_at=None,
                legacy_value_sync_at=None,
                v2_signals=9,
                v1_signals=7,
                v2_exc=exc,
            ),
        ):
            resp = await self.client.get("/debug/counts")

        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json().get("signals"), 7)

    async def test_debug_counts_raises_on_non_fallback_db_error(self):
        exc = self._dbapi_error(
            'relation "signals_v2_events" does not exist',
            sqlstate="23505",
        )
        with patch(
            "app.main.engine",
            new=_FakeEngine(
                value_json_sync_at=None,
                legacy_value_sync_at=None,
                v2_exc=exc,
            ),
        ):
            with self.assertRaises(DBAPIError):
                await self.client.get("/debug/counts")


if __name__ == "__main__":
    unittest.main()

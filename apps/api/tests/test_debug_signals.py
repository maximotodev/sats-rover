import unittest
from unittest.mock import patch

import httpx

from app.main import app


class _ScalarResult:
    def __init__(self, value):
        self._value = value

    def scalar_one(self):
        return self._value

    def scalar_one_or_none(self):
        return self._value


class _FakeConn:
    def __init__(
        self,
        *,
        ledger_rows: int,
        state_rows: int,
        last_ledger_event_at: int | None,
        last_state_event_at: int | None,
    ):
        self.ledger_rows = ledger_rows
        self.state_rows = state_rows
        self.last_ledger_event_at = last_ledger_event_at
        self.last_state_event_at = last_state_event_at

    async def execute(self, stmt):
        sql = str(stmt)
        if "count(*) FROM signals_v2_events" in sql:
            return _ScalarResult(self.ledger_rows)
        if "count(*) FROM signals_v2_state" in sql:
            return _ScalarResult(self.state_rows)
        if "max(created_at) FROM signals_v2_events" in sql:
            return _ScalarResult(self.last_ledger_event_at)
        if "max(created_at) FROM signals_v2_state" in sql:
            return _ScalarResult(self.last_state_event_at)
        raise AssertionError(f"unexpected SQL: {sql}")


class _FakeConnectCtx:
    def __init__(self, conn: _FakeConn):
        self._conn = conn

    async def __aenter__(self):
        return self._conn

    async def __aexit__(self, exc_type, exc, tb):
        return False


class _FakeEngine:
    def __init__(
        self,
        *,
        ledger_rows: int,
        state_rows: int,
        last_ledger_event_at: int | None,
        last_state_event_at: int | None,
    ):
        self._conn = _FakeConn(
            ledger_rows=ledger_rows,
            state_rows=state_rows,
            last_ledger_event_at=last_ledger_event_at,
            last_state_event_at=last_state_event_at,
        )

    def connect(self):
        return _FakeConnectCtx(self._conn)


class DebugSignalsTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.client = httpx.AsyncClient(
            transport=httpx.ASGITransport(app=app),
            base_url="http://testserver",
        )

    async def asyncTearDown(self):
        await self.client.aclose()

    async def test_debug_signals_empty_ledger_and_state(self):
        with patch(
            "app.main.engine",
            new=_FakeEngine(
                ledger_rows=0,
                state_rows=0,
                last_ledger_event_at=None,
                last_state_event_at=None,
            ),
        ):
            resp = await self.client.get("/debug/signals")

        self.assertEqual(resp.status_code, 200)
        body = resp.json()
        self.assertEqual(body["ledger_rows"], 0)
        self.assertEqual(body["state_rows"], 0)
        self.assertIsNone(body["last_ledger_event_at"])
        self.assertIsNone(body["last_state_event_at"])
        self.assertFalse(body["state_rebuild_recommended"])

    async def test_debug_signals_rebuild_recommended_when_ledger_has_rows_and_state_empty(self):
        with patch(
            "app.main.engine",
            new=_FakeEngine(
                ledger_rows=10,
                state_rows=0,
                last_ledger_event_at=200,
                last_state_event_at=None,
            ),
        ):
            resp = await self.client.get("/debug/signals")

        self.assertEqual(resp.status_code, 200)
        body = resp.json()
        self.assertTrue(body["state_rebuild_recommended"])

    async def test_debug_signals_no_rebuild_when_state_caught_up(self):
        with patch(
            "app.main.engine",
            new=_FakeEngine(
                ledger_rows=10,
                state_rows=3,
                last_ledger_event_at=200,
                last_state_event_at=200,
            ),
        ):
            resp = await self.client.get("/debug/signals")

        self.assertEqual(resp.status_code, 200)
        body = resp.json()
        self.assertFalse(body["state_rebuild_recommended"])

    async def test_debug_signals_rebuild_recommended_when_ledger_newer_than_state(self):
        with patch(
            "app.main.engine",
            new=_FakeEngine(
                ledger_rows=10,
                state_rows=3,
                last_ledger_event_at=300,
                last_state_event_at=200,
            ),
        ):
            resp = await self.client.get("/debug/signals")

        self.assertEqual(resp.status_code, 200)
        body = resp.json()
        self.assertTrue(body["state_rebuild_recommended"])


if __name__ == "__main__":
    unittest.main()

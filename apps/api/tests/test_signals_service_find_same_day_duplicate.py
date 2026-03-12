import unittest

from sqlalchemy.exc import DBAPIError

from app.services.signals_service import _find_same_day_signal_event_id


class _DummyOrig(Exception):
    def __init__(self, message: str, *, sqlstate: str | None = None, pgcode: str | None = None):
        super().__init__(message)
        self._message = message
        self.sqlstate = sqlstate
        self.pgcode = pgcode

    def __str__(self) -> str:
        return self._message


class _MappingsResult:
    def __init__(self, row):
        self._row = row

    def mappings(self):
        return self

    def first(self):
        return self._row


class _StubSession:
    def __init__(
        self,
        *,
        v2_row=None,
        v1_row=None,
        v2_exc: Exception | None = None,
    ):
        self.v2_row = v2_row
        self.v1_row = v1_row
        self.v2_exc = v2_exc

    async def execute(self, stmt, params):
        sql = str(stmt)
        if "FROM signals_v2_events" in sql:
            if self.v2_exc is not None:
                raise self.v2_exc
            return _MappingsResult(self.v2_row)
        if "FROM signals" in sql:
            return _MappingsResult(self.v1_row)
        raise AssertionError(f"unexpected sql: {sql}")


class FindSameDayDuplicateTests(unittest.IsolatedAsyncioTestCase):
    def _dbapi_error(self, message: str, *, sqlstate: str | None = None, pgcode: str | None = None) -> DBAPIError:
        orig = _DummyOrig(message, sqlstate=sqlstate, pgcode=pgcode)
        return DBAPIError("SELECT 1", {}, orig)

    async def test_v2_exists_and_duplicate_present(self):
        db = _StubSession(v2_row={"event_id": "a" * 64})
        event_id = await _find_same_day_signal_event_id(
            db=db,
            pubkey="b" * 64,
            place_id="place-1",
        )
        self.assertEqual(event_id, "a" * 64)

    async def test_v2_exists_and_no_duplicate(self):
        db = _StubSession(v2_row=None)
        event_id = await _find_same_day_signal_event_id(
            db=db,
            pubkey="b" * 64,
            place_id="place-1",
        )
        self.assertIsNone(event_id)

    async def test_v2_missing_falls_back_to_v1_present(self):
        exc = self._dbapi_error(
            'relation "signals_v2_events" does not exist',
            sqlstate="42P01",
        )
        db = _StubSession(v2_exc=exc, v1_row={"event_id": "c" * 64})
        event_id = await _find_same_day_signal_event_id(
            db=db,
            pubkey="b" * 64,
            place_id="place-1",
        )
        self.assertEqual(event_id, "c" * 64)

    async def test_v2_missing_schema_qualified_falls_back_to_v1_present(self):
        exc = self._dbapi_error(
            'relation "public.signals_v2_events" does not exist',
            pgcode="42P01",
        )
        db = _StubSession(v2_exc=exc, v1_row={"event_id": "d" * 64})
        event_id = await _find_same_day_signal_event_id(
            db=db,
            pubkey="b" * 64,
            place_id="place-1",
        )
        self.assertEqual(event_id, "d" * 64)

    async def test_non_eligible_dbapi_error_is_raised(self):
        exc = self._dbapi_error(
            'relation "signals_v2_events" does not exist',
            sqlstate="23505",
        )
        db = _StubSession(v2_exc=exc)
        with self.assertRaises(DBAPIError):
            await _find_same_day_signal_event_id(
                db=db,
                pubkey="b" * 64,
                place_id="place-1",
            )

    async def test_missing_disallowed_relation_is_raised(self):
        exc = self._dbapi_error(
            'relation "signals" does not exist',
            sqlstate="42P01",
        )
        db = _StubSession(v2_exc=exc)
        with self.assertRaises(DBAPIError):
            await _find_same_day_signal_event_id(
                db=db,
                pubkey="b" * 64,
                place_id="place-1",
            )


if __name__ == "__main__":
    unittest.main()

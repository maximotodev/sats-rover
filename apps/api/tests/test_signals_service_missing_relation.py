import unittest
from datetime import datetime, timezone

from sqlalchemy.exc import DBAPIError

from app.services.signals_service import (
    _build_content_preview,
    _extract_missing_relation_name,
    _normalize_signal_content,
    _should_fallback_to_v1,
    _utc_day_int,
)


class _DummyOrig(Exception):
    def __init__(self, message: str, *, sqlstate: str | None = None, pgcode: str | None = None):
        super().__init__(message)
        self._message = message
        self.sqlstate = sqlstate
        self.pgcode = pgcode

    def __str__(self) -> str:
        return self._message


class MissingRelationExtractionTests(unittest.TestCase):
    def _dbapi_error(self, message: str, *, sqlstate: str | None = None, pgcode: str | None = None) -> DBAPIError:
        orig = _DummyOrig(message, sqlstate=sqlstate, pgcode=pgcode)
        return DBAPIError("SELECT 1", {}, orig)

    def test_extract_psycopg_style_relation_name(self):
        exc = self._dbapi_error(
            'relation "signals_v2_state" does not exist',
            sqlstate="42P01",
        )
        self.assertEqual(_extract_missing_relation_name(exc), "signals_v2_state")

    def test_extract_schema_qualified_relation_name(self):
        exc = self._dbapi_error(
            'relation "public.signals_v2_state" does not exist',
            sqlstate="42P01",
        )
        self.assertEqual(_extract_missing_relation_name(exc), "signals_v2_state")

    def test_extract_different_missing_relation_name(self):
        exc = self._dbapi_error(
            'relation "signals" does not exist',
            sqlstate="42P01",
        )
        self.assertEqual(_extract_missing_relation_name(exc), "signals")

    def test_non_42p01_returns_none(self):
        exc = self._dbapi_error(
            'relation "signals_v2_state" does not exist',
            sqlstate="23505",
        )
        self.assertIsNone(_extract_missing_relation_name(exc))

    def test_pgcode_42p01_is_supported(self):
        exc = self._dbapi_error(
            'relation "signals_v2_events" does not exist',
            pgcode="42P01",
        )
        self.assertEqual(_extract_missing_relation_name(exc), "signals_v2_events")

    def test_weird_format_returns_none(self):
        exc = self._dbapi_error("undefined table", sqlstate="42P01")
        self.assertIsNone(_extract_missing_relation_name(exc))

    def test_should_fallback_true_for_allowed_relation(self):
        exc = self._dbapi_error(
            'relation "public.signals_v2_state" does not exist',
            sqlstate="42P01",
        )
        should_fallback, missing = _should_fallback_to_v1(
            exc,
            {"signals_v2_state", "signals_v2_events"},
        )
        self.assertTrue(should_fallback)
        self.assertEqual(missing, "signals_v2_state")

    def test_should_fallback_false_for_disallowed_relation(self):
        exc = self._dbapi_error(
            'relation "signals" does not exist',
            sqlstate="42P01",
        )
        should_fallback, missing = _should_fallback_to_v1(
            exc,
            {"signals_v2_state", "signals_v2_events"},
        )
        self.assertFalse(should_fallback)
        self.assertEqual(missing, "signals")


class SignalContentNormalizationTests(unittest.TestCase):
    def test_normalize_non_str_returns_empty(self):
        self.assertEqual(_normalize_signal_content(None, max_len=4096), "")

    def test_normalize_short_string_unchanged(self):
        self.assertEqual(
            _normalize_signal_content("hello", max_len=4096),
            "hello",
        )

    def test_normalize_long_string_trimmed(self):
        self.assertEqual(
            _normalize_signal_content("x" * 5000, max_len=4096),
            "x" * 4096,
        )

    def test_preview_uses_normalized_content(self):
        normalized = _normalize_signal_content('{"note":"logproof"}', max_len=4096)
        self.assertEqual(_build_content_preview(normalized), "logproof")


class UtcDayIntTests(unittest.TestCase):
    def test_utc_day_int_epoch(self):
        self.assertEqual(_utc_day_int(datetime(1970, 1, 1, 0, 0, 0, tzinfo=timezone.utc)), 0)

    def test_utc_day_int_next_day_boundary(self):
        self.assertEqual(_utc_day_int(datetime(1970, 1, 2, 0, 0, 0, tzinfo=timezone.utc)), 1)

    def test_utc_day_int_fixed_datetime(self):
        dt = datetime(2026, 3, 5, 12, 34, 56, tzinfo=timezone.utc)
        expected = int(dt.timestamp()) // 86400
        self.assertEqual(_utc_day_int(dt), expected)


if __name__ == "__main__":
    unittest.main()

import asyncio
from datetime import datetime, timezone
import pytest
from pathlib import Path
from sqlalchemy.dialects.postgresql import JSONB

from app.models.place import Place
from app.services.ingestion_service import (
    INGESTION_STATE_KEY_PLACES_BTCMAP,
    UPSERT_SQL,
    UPSERT_INGESTION_STATE_SQL,
    _canonical_id,
    _extract_lat_lon,
    _merge_tags,
    _pick_name,
    sync_btcmap,
)


def test_extract_lat_lon_direct_lat_lon():
    lat, lon = _extract_lat_lon({"lat": "13.7", "lon": "-89.2"})
    assert lat == pytest.approx(13.7)
    assert lon == pytest.approx(-89.2)


def test_extract_lat_lon_center_lat_lon():
    lat, lon = _extract_lat_lon({"center": {"lat": 13.71, "lon": -89.21}})
    assert lat == pytest.approx(13.71)
    assert lon == pytest.approx(-89.21)


def test_extract_lat_lon_center_latitude_longitude():
    lat, lon = _extract_lat_lon({"center": {"latitude": "13.72", "longitude": "-89.22"}})
    assert lat == pytest.approx(13.72)
    assert lon == pytest.approx(-89.22)


def test_extract_lat_lon_geometry_point_coordinates():
    lat, lon = _extract_lat_lon({"geometry": {"type": "Point", "coordinates": [-89.23, 13.73]}})
    assert lat == pytest.approx(13.73)
    assert lon == pytest.approx(-89.23)


def test_merge_tags_primitives_only_with_override_order():
    tags = _merge_tags(
        {"name": "A", "k": "v1", "obj": {"x": 1}, "arr": [1, 2], 1: "bad"},
        {"k": "v2", "ok": True, "none": None, "n": 3},
    )
    assert tags == {
        "name": "A",
        "k": "v2",
        "ok": True,
        "none": None,
        "n": 3,
    }


def test_canonical_id_truncation_is_stable_with_hash_suffix():
    raw = "x" * 500
    a = _canonical_id(raw)
    b = _canonical_id(raw)
    assert a == b
    assert a.startswith("btcmap:")
    assert len(a) <= 128


def test_pick_name_falls_back_non_empty():
    name = _pick_name(osm_json={}, tags={}, raw_id="abc123")
    assert isinstance(name, str)
    assert name != ""


def test_upsert_sql_has_hash_gate_and_preserves_signal_fields():
    sql_text = UPSERT_SQL.text
    assert "WHERE places.ingest_hash IS DISTINCT FROM EXCLUDED.ingest_hash" in sql_text
    assert "glow_score = EXCLUDED.glow_score" not in sql_text
    assert "last_activity_at" not in sql_text
    assert "ON CONFLICT (id) DO UPDATE" in sql_text
    assert "COALESCE(checkin_submissions" not in sql_text
    assert "CAST(:tags AS JSONB)" not in sql_text
    assert " :tags," in sql_text
    assert isinstance(UPSERT_SQL._bindparams["tags"].type, JSONB)


def test_place_model_and_migration_define_jsonb_tags():
    assert isinstance(Place.__table__.c.tags.type, JSONB)
    migration = Path(__file__).resolve().parents[1] / "alembic" / "versions" / "a7d1c8e5f2b4_convert_places_tags_to_jsonb.py"
    migration_sql = migration.read_text(encoding="utf-8")
    assert "ALTER COLUMN tags TYPE jsonb USING tags::jsonb" in migration_sql
    assert "ALTER COLUMN tags SET DEFAULT '{}'::jsonb" in migration_sql
    assert "ALTER COLUMN tags SET NOT NULL" in migration_sql
    assert "CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_places_tags_gin" in migration_sql


def test_sync_btcmap_success_persists_ingestion_state_payload(monkeypatch):
    class _FakeResponse:
        def raise_for_status(self):
            return None

        def json(self):
            return [{"id": "node/1", "osm_json": {"lat": 13.7, "lon": -89.2, "tags": {"name": "A"}}}]

    class _FakeClient:
        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, tb):
            return False

        async def get(self, _url):
            return _FakeResponse()

    class _Result:
        def __init__(self, rowcount: int):
            self.rowcount = rowcount

    class _FakeDB:
        def __init__(self):
            self.calls = []

        async def execute(self, stmt, params):
            self.calls.append((stmt, params))
            if stmt is UPSERT_SQL:
                return _Result(1)
            if stmt is UPSERT_INGESTION_STATE_SQL:
                return _Result(1)
            return _Result(0)

        async def commit(self):
            return None

    monkeypatch.setattr("app.services.ingestion_service.httpx.AsyncClient", lambda *args, **kwargs: _FakeClient())
    db = _FakeDB()

    upserted = asyncio.run(sync_btcmap(db))
    assert upserted == 1

    state_calls = [c for c in db.calls if c[0] is UPSERT_INGESTION_STATE_SQL]
    assert len(state_calls) == 1
    _, params = state_calls[0]
    assert params["key"] == INGESTION_STATE_KEY_PLACES_BTCMAP
    assert isinstance(params["value"], int)
    payload = params["value_json"]
    assert isinstance(payload, dict)
    assert isinstance(payload.get("last_places_sync_at"), str)
    expected_epoch = int(datetime.fromisoformat(payload["last_places_sync_at"]).timestamp())
    assert params["value"] == expected_epoch
    assert payload.get("fetched_count") == 1
    assert payload.get("parsed_count") == 1
    assert payload.get("upserted_count") == 1
    assert payload.get("unchanged_skipped_count") == 0
    assert isinstance(payload.get("duration_ms"), int)

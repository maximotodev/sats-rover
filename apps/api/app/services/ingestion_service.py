# apps/api/app/services/ingestion_service.py
from __future__ import annotations

import hashlib
import json
import logging
import time
from datetime import datetime, timezone
from typing import Any

import httpx
from sqlalchemy import bindparam, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

BTCMAP_URL = "https://static.btcmap.org/api/v2/elements.json"

BATCH_SIZE = 1000
MAX_ID_LEN = 128
MAX_NAME_LEN = 256
DEFAULT_GLOW = 0.5
PROGRESS_EVERY_BATCHES = 5
INGESTION_STATE_KEY_PLACES_BTCMAP = "places_btcmap"

UPSERT_SQL = text("""
    INSERT INTO places (id, name, source, tags, location, glow_score, ingest_hash)
    VALUES (
        :id,
        :name,
        :source,
        :tags,
        ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography,
        :glow,
        :ingest_hash
    )
    ON CONFLICT (id) DO UPDATE SET
        name = CASE
            WHEN EXCLUDED.name = '' THEN places.name
            WHEN EXCLUDED.name LIKE 'Unnamed Place (%)'
              AND places.name IS NOT NULL
              AND btrim(places.name) <> ''
              AND places.name NOT LIKE 'Unnamed Place (%)'
            THEN places.name
            ELSE EXCLUDED.name
        END,
        source = EXCLUDED.source,
        tags = EXCLUDED.tags,
        location = EXCLUDED.location,
        ingest_hash = EXCLUDED.ingest_hash,
        updated_at = now()
    WHERE places.ingest_hash IS DISTINCT FROM EXCLUDED.ingest_hash;
""").bindparams(bindparam("tags", type_=JSONB))

UPSERT_INGESTION_STATE_SQL = text("""
    INSERT INTO ingestion_state (key, value, value_json, updated_at)
    VALUES (:key, :value, :value_json, now())
    ON CONFLICT (key) DO UPDATE
    SET
        value = EXCLUDED.value,
        value_json = EXCLUDED.value_json,
        updated_at = now();
""").bindparams(bindparam("value_json", type_=JSONB))


def _safe_float(v: Any) -> float | None:
    try:
        f = float(v)
        return None if f != f else f  # NaN guard
    except Exception:
        return None


def _as_dict(v: Any) -> dict[str, Any]:
    return v if isinstance(v, dict) else {}


def _merge_tags(*candidates: Any) -> dict[str, Any]:
    """
    Merge dict-like tags. Later dicts override earlier ones.
    Only keep JSON-serializable primitives / None (avoid nested lists/dicts bloat).
    """
    out: dict[str, Any] = {}
    for c in candidates:
        d = _as_dict(c)
        for k, val in d.items():
            if not isinstance(k, str):
                continue
            if isinstance(val, (str, int, float, bool)) or val is None:
                out[k] = val
    return out


def _extract_lat_lon(osm_json: dict[str, Any]) -> tuple[float | None, float | None]:
    """
    Try multiple BTC Map / OSM shapes.
    Returns (lat, lon).
    """
    # 1) direct keys
    lat = _safe_float(osm_json.get("lat"))
    lon = _safe_float(osm_json.get("lon"))
    if lat is not None and lon is not None:
        return lat, lon

    # 2) center: {"lat": ..., "lon": ...} OR {"latitude":..., "longitude":...}
    center = _as_dict(osm_json.get("center"))
    if center:
        lat = _safe_float(center.get("lat") or center.get("latitude"))
        lon = _safe_float(center.get("lon") or center.get("lng") or center.get("longitude"))
        if lat is not None and lon is not None:
            return lat, lon

    # 3) coordinates: [lon, lat]
    coords = osm_json.get("coordinates")
    if isinstance(coords, (list, tuple)) and len(coords) >= 2:
        lon = _safe_float(coords[0])
        lat = _safe_float(coords[1])
        if lat is not None and lon is not None:
            return lat, lon

    # 4) GeoJSON-ish geometry: {"type":"Point","coordinates":[lon,lat]}
    geom = _as_dict(osm_json.get("geometry"))
    if geom and geom.get("type") == "Point":
        gc = geom.get("coordinates")
        if isinstance(gc, (list, tuple)) and len(gc) >= 2:
            lon = _safe_float(gc[0])
            lat = _safe_float(gc[1])
            if lat is not None and lon is not None:
                return lat, lon

    return None, None


def _canonical_id(raw_id: Any) -> str:
    base = f"btcmap:{str(raw_id).replace('/', ':')}"
    if len(base) <= MAX_ID_LEN:
        return base
    digest = hashlib.sha256(base.encode("utf-8")).hexdigest()[:24]
    return f"btcmap:{digest}"


def _safe_name(v: Any) -> str:
    if not isinstance(v, str):
        return ""
    s = v.strip()
    return s[:MAX_NAME_LEN] if s else ""


def _pick_name(osm_json: dict[str, Any], tags: dict[str, Any], raw_id: Any) -> str:
    """
    Prefer human-friendly fields. Fall back to tags. If still missing, mark as unnamed.
    """
    candidates = [
        osm_json.get("name"),
        tags.get("name"),
        tags.get("brand"),
        tags.get("operator"),
    ]
    for c in candidates:
        s = _safe_name(c)
        if s:
            return s

    # Avoid useless "Bitcoin Merchant" everywhere; make missing data obvious
    return f"Unnamed Place ({raw_id})"[:MAX_NAME_LEN]


def _build_ingest_hash(
    *,
    name: str,
    lat: float,
    lon: float,
    tags: dict[str, Any],
    source: str,
) -> str:
    canonical_tags = json.dumps(tags, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
    payload = f"{name}|{lat:.7f}|{lon:.7f}|{source}|{canonical_tags}"
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def _build_places_sync_state_payload(
    *,
    fetched_count: int,
    parsed_count: int,
    upserted_count: int,
    unchanged_skipped_count: int,
    duration_ms: int,
) -> dict[str, Any]:
    return {
        "last_places_sync_at": datetime.now(timezone.utc).isoformat(),
        "fetched_count": fetched_count,
        "parsed_count": parsed_count,
        "upserted_count": upserted_count,
        "unchanged_skipped_count": unchanged_skipped_count,
        "duration_ms": duration_ms,
    }


async def _persist_places_sync_state(
    db: AsyncSession,
    payload: dict[str, Any],
) -> None:
    last_places_sync_at = payload.get("last_places_sync_at")
    epoch_seconds = int(datetime.now(timezone.utc).timestamp())
    if isinstance(last_places_sync_at, str):
        try:
            epoch_seconds = int(
                datetime.fromisoformat(last_places_sync_at).timestamp(),
            )
        except ValueError:
            epoch_seconds = int(datetime.now(timezone.utc).timestamp())
    await db.execute(
        UPSERT_INGESTION_STATE_SQL,
        {
            "key": INGESTION_STATE_KEY_PLACES_BTCMAP,
            "value": epoch_seconds,
            "value_json": payload,
        },
    )
    await db.commit()


async def sync_btcmap(db: AsyncSession) -> int:
    started_at = time.perf_counter()
    logger.info("btcmap_sync_start", extra={"target": BTCMAP_URL})

    async with httpx.AsyncClient(timeout=120.0, follow_redirects=True) as client:
        r = await client.get(BTCMAP_URL)
        r.raise_for_status()
        elements = r.json()

    if not isinstance(elements, list):
        logger.error("btcmap_sync_unexpected_payload", extra={"payload_type": str(type(elements))})
        return 0

    fetched_count = len(elements)
    logger.info("btcmap_sync_fetched", extra={"fetched_count": fetched_count})

    parsed_count = 0
    upserted_count = 0
    unchanged_skipped_count = 0
    batch_count = 0
    batch_params: list[dict[str, Any]] = []

    skipped_no_id = 0
    skipped_no_coords = 0
    skipped_invalid_coords = 0
    skipped_not_dict = 0

    for el in elements:
        if not isinstance(el, dict):
            skipped_not_dict += 1
            continue

        osm_json = _as_dict(el.get("osm_json"))
        raw_id = el.get("id") or osm_json.get("id")
        if raw_id is None:
            skipped_no_id += 1
            continue

        lat, lon = _extract_lat_lon(osm_json)
        if lat is None or lon is None:
            skipped_no_coords += 1
            continue

        if not (-90 <= lat <= 90 and -180 <= lon <= 180):
            skipped_invalid_coords += 1
            continue

        # ✅ Merge tags from both places (top-level + nested)
        tags = _merge_tags(osm_json.get("tags"), el.get("tags"))

        name = _pick_name(osm_json, tags, raw_id)
        ingest_hash = _build_ingest_hash(
            name=name,
            lat=lat,
            lon=lon,
            tags=tags,
            source="btcmap",
        )

        batch_params.append(
            {
                "id": _canonical_id(raw_id),
                "name": name,
                "source": "btcmap",
                "tags": tags,
                "lon": lon,
                "lat": lat,
                "glow": DEFAULT_GLOW,
                "ingest_hash": ingest_hash,
            }
        )
        parsed_count += 1

        if len(batch_params) >= BATCH_SIZE:
            result = await db.execute(UPSERT_SQL, batch_params)
            await db.commit()
            affected = int(result.rowcount or 0)
            upserted_count += affected
            unchanged_skipped_count += max(0, len(batch_params) - affected)
            batch_count += 1
            if batch_count % PROGRESS_EVERY_BATCHES == 0:
                logger.info(
                    "btcmap_sync_progress",
                    extra={
                        "fetched_count": fetched_count,
                        "parsed_count": parsed_count,
                        "upserted_count": upserted_count,
                        "unchanged_skipped_count": unchanged_skipped_count,
                        "skipped_not_dict": skipped_not_dict,
                        "skipped_no_id": skipped_no_id,
                        "skipped_no_coords": skipped_no_coords,
                        "skipped_invalid_coords": skipped_invalid_coords,
                        "batches_completed": batch_count,
                    },
                )
            batch_params = []

    if batch_params:
        result = await db.execute(UPSERT_SQL, batch_params)
        await db.commit()
        affected = int(result.rowcount or 0)
        upserted_count += affected
        unchanged_skipped_count += max(0, len(batch_params) - affected)
        batch_count += 1

    duration_ms = int((time.perf_counter() - started_at) * 1000)
    await _persist_places_sync_state(
        db,
        _build_places_sync_state_payload(
            fetched_count=fetched_count,
            parsed_count=parsed_count,
            upserted_count=upserted_count,
            unchanged_skipped_count=unchanged_skipped_count,
            duration_ms=duration_ms,
        ),
    )
    logger.info(
        "btcmap_sync_complete",
        extra={
            "fetched_count": fetched_count,
            "parsed_count": parsed_count,
            "upserted_count": upserted_count,
            "unchanged_skipped_count": unchanged_skipped_count,
            "skipped_not_dict": skipped_not_dict,
            "skipped_no_id": skipped_no_id,
            "skipped_no_coords": skipped_no_coords,
            "skipped_invalid_coords": skipped_invalid_coords,
            "batches_completed": batch_count,
            "duration_ms": duration_ms,
        },
    )
    return upserted_count

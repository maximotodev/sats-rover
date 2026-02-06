# apps/api/app/services/ingestion_service.py
from __future__ import annotations

import hashlib
import json
import logging
from typing import Any

import httpx
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

BTCMAP_URL = "https://static.btcmap.org/api/v2/elements.json"

BATCH_SIZE = 1000
MAX_ID_LEN = 128
MAX_NAME_LEN = 256
DEFAULT_GLOW = 0.5

UPSERT_SQL = text("""
    INSERT INTO places (id, name, source, tags, location, glow_score)
    VALUES (
        :id,
        :name,
        :source,
        CAST(:tags AS JSON),
        ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography,
        :glow
    )
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        source = EXCLUDED.source,
        tags = EXCLUDED.tags,
        location = EXCLUDED.location,
        glow_score = EXCLUDED.glow_score,
        updated_at = now();
""")


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


async def sync_btcmap(db: AsyncSession) -> int:
    logger.info("BTC Map sync start. Target: %s", BTCMAP_URL)

    async with httpx.AsyncClient(timeout=120.0, follow_redirects=True) as client:
        r = await client.get(BTCMAP_URL)
        r.raise_for_status()
        elements = r.json()

    if not isinstance(elements, list):
        logger.error("Unexpected payload type: %s", type(elements))
        return 0

    logger.info("Retrieved %s potential elements. Parsing...", len(elements))

    total = 0
    batch_params: list[dict[str, Any]] = []

    skipped_no_id = 0
    skipped_no_coords = 0
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
            skipped_no_coords += 1
            continue

        # ✅ Merge tags from both places (top-level + nested)
        tags = _merge_tags(osm_json.get("tags"), el.get("tags"))

        name = _pick_name(osm_json, tags, raw_id)

        batch_params.append(
            {
                "id": _canonical_id(raw_id),
                "name": name,
                "source": "btcmap",
                "tags": json.dumps(tags, ensure_ascii=False),
                "lon": lon,
                "lat": lat,
                "glow": DEFAULT_GLOW,
            }
        )

        if len(batch_params) >= BATCH_SIZE:
            await db.execute(UPSERT_SQL, batch_params)
            await db.commit()
            total += len(batch_params)
            logger.info("Progress: %s upserted", total)
            batch_params = []

    if batch_params:
        await db.execute(UPSERT_SQL, batch_params)
        await db.commit()
        total += len(batch_params)

    logger.info(
        "Sync complete. Upserted=%s skipped_not_dict=%s skipped_no_id=%s skipped_no_coords=%s",
        total,
        skipped_not_dict,
        skipped_no_id,
        skipped_no_coords,
    )
    return total

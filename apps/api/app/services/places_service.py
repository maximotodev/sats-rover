# apps/api/app/services/places_service.py
from __future__ import annotations

import os
import logging
import hashlib
import json
from dataclasses import dataclass
from typing import Any

from geoalchemy2.functions import ST_X, ST_Y
from geoalchemy2 import Geometry
from sqlalchemy import select, func, cast, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.settings import settings
from app.models.place import Place
from app.schemas.place import PlaceOut
from app.services.redis_client import redis_client

logger = logging.getLogger(__name__)
CACHE_DEBUG = os.getenv("PLACES_CACHE_DEBUG", "0") == "1"
# MUST MATCH CLIENT / NEXT PROXY
BBOX_DECIMALS = 3  # ~110m

@dataclass(frozen=True)
class BBox:
    west: float
    south: float
    east: float
    north: float

    def canonical_str(self) -> str:
        # canonical order west,south,east,north
        return f"{self.west},{self.south},{self.east},{self.north}"


def _round(n: float) -> float:
    m = 10**BBOX_DECIMALS
    return round(n * m) / m


def parse_bbox(bbox: str) -> BBox:
    parts = [p.strip() for p in bbox.split(",")]
    if len(parts) != 4:
        raise ValueError("bbox must be 'west,south,east,north'")

    try:
        a, b, c, d = (float(p) for p in parts)
    except Exception:
        raise ValueError("bbox must contain valid numbers")

    # Range checks (still do these pre-normalization)
    if not (-180 <= a <= 180 and -180 <= c <= 180 and -90 <= b <= 90 and -90 <= d <= 90):
        # We still allow mixed order from proxy normalization,
        # but places endpoint contract is canonical, so keep strict here.
        # If you want to accept legacy order at FastAPI too, add a heuristic here.
        pass

    # Normalize min/max so west<east and south<north
    west = min(a, c)
    east = max(a, c)
    south = min(b, d)
    north = max(b, d)

    # Validate ranges after normalization
    if not (-180 <= west <= 180 and -180 <= east <= 180):
        raise ValueError("bbox longitude out of range")
    if not (-90 <= south <= 90 and -90 <= north <= 90):
        raise ValueError("bbox latitude out of range")
    if west >= east or south >= north:
        raise ValueError("bbox is invalid (west<east and south<north required)")

    # Round to match client/proxy (stable cache keys)
    west = _round(west)
    south = _round(south)
    east = _round(east)
    north = _round(north)

    return BBox(west=west, south=south, east=east, north=north)


def bbox_cache_key(b: BBox) -> str:
    # Key is derived from the canonical, already-rounded bbox string
    raw = b.canonical_str()
    digest = hashlib.sha256(raw.encode("utf-8")).hexdigest()[:16]
    return f"places:bbox:{digest}"


async def list_places_by_bbox(db: AsyncSession, bbox: str, limit: int = 600) -> list[PlaceOut]:
    b = parse_bbox(bbox_str)
    key = bbox_cache_key(b)

    cached = await redis_client.get(key)
    if cached:
        if CACHE_DEBUG:
            logger.info("places cache HIT bbox=%s key=%s", b.canonical_str(), key)
        try:
            payload = json.loads(cached)
            return [PlaceOut(**x) for x in payload]
        except Exception:
            # fall through
            if CACHE_DEBUG:
                logger.warning("places cache CORRUPT bbox=%s key=%s", b.canonical_str(), key)

    if CACHE_DEBUG:
        logger.info("places cache MISS bbox=%s key=%s", b.canonical_str(), key)

    envelope = func.ST_MakeEnvelope(b.west, b.south, b.east, b.north, 4326)

    # geography -> geometry for spatial ops
    geom = cast(Place.location, Geometry(geometry_type="POINT", srid=4326))

    query = (
        select(
            Place.id.label("id"),
            Place.name.label("name"),
            Place.source.label("source"),
            Place.tags.label("tags"),
            Place.glow_score.label("glow_score"),
            ST_Y(geom).label("lat"),
            ST_X(geom).label("lon"),
        )
        .where(func.ST_Intersects(geom, envelope))
        .order_by(Place.glow_score.desc())
        .limit(500)
    )

    result = await db.execute(query)
    rows = result.mappings().all()
    out = [PlaceOut.model_validate(r) for r in rows]

    await redis_client.setex(
        key,
        settings.places_cache_ttl_seconds,
        json.dumps([o.model_dump() for o in out]),
    )
    return out

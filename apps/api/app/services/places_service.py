# apps/api/app/services/places_service.py
from __future__ import annotations

import hashlib
import json
import logging
import os
from dataclasses import dataclass

from geoalchemy2 import Geometry
from geoalchemy2.functions import ST_X, ST_Y
from sqlalchemy import cast, func, select
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
        return f"{self.west},{self.south},{self.east},{self.north}"


def _round(n: float) -> float:
    m = 10**BBOX_DECIMALS
    return round(n * m) / m


def parse_bbox(bbox: str) -> BBox:
    parts = [p.strip() for p in bbox.split(",")]
    if len(parts) != 4:
        raise ValueError("bbox must be 'west,south,east,north'")

    try:
        west_raw, south_raw, east_raw, north_raw = (float(p) for p in parts)
    except ValueError as exc:
        raise ValueError("bbox must contain valid numbers") from exc

    if not (-180 <= west_raw <= 180 and -180 <= east_raw <= 180):
        raise ValueError("bbox longitude out of range (-180..180)")
    if not (-90 <= south_raw <= 90 and -90 <= north_raw <= 90):
        raise ValueError("bbox latitude out of range (-90..90)")

    west = min(west_raw, east_raw)
    east = max(west_raw, east_raw)
    south = min(south_raw, north_raw)
    north = max(south_raw, north_raw)

    if west >= east or south >= north:
        raise ValueError("bbox is invalid (west<east and south<north required)")

    return BBox(
        west=_round(west),
        south=_round(south),
        east=_round(east),
        north=_round(north),
    )


def bbox_cache_key(bbox: BBox) -> str:
    digest = hashlib.sha256(bbox.canonical_str().encode("utf-8")).hexdigest()[:16]
    return f"places:bbox:{digest}"


async def list_places_by_bbox(db: AsyncSession, bbox: BBox, limit: int = 600) -> list[PlaceOut]:
    key = bbox_cache_key(bbox)

    cached = await redis_client.get(key)
    if cached:
        if CACHE_DEBUG:
            logger.info("places cache HIT bbox=%s key=%s", bbox.canonical_str(), key)
        try:
            payload = json.loads(cached)
            return [PlaceOut(**x) for x in payload]
        except Exception:
            if CACHE_DEBUG:
                logger.warning("places cache CORRUPT bbox=%s key=%s", bbox.canonical_str(), key)

    if CACHE_DEBUG:
        logger.info("places cache MISS bbox=%s key=%s", bbox.canonical_str(), key)

    envelope = func.ST_MakeEnvelope(bbox.west, bbox.south, bbox.east, bbox.north, 4326)
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
        .limit(limit)
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


async def get_places_by_bbox(db: AsyncSession, bbox_raw: str, limit: int = 600) -> list[PlaceOut]:
    bbox = parse_bbox(bbox_raw)
    return await list_places_by_bbox(db, bbox, limit=limit)

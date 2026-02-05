from __future__ import annotations

import traceback
from dataclasses import dataclass

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.place import PlaceOut
from app.services.places_service import list_places_by_bbox

router = APIRouter(prefix="/v1", tags=["places"])

DEFAULT_LIMIT = 600
MAX_LIMIT = 1200


@dataclass(frozen=True)
class BBox:
    west: float
    south: float
    east: float
    north: float

    def normalized(self) -> "BBox":
        w, e = sorted((self.west, self.east))
        s, n = sorted((self.south, self.north))
        return BBox(west=w, south=s, east=e, north=n)


def parse_bbox(raw: str) -> BBox:
    parts = [p.strip() for p in raw.split(",")]
    if len(parts) != 4:
        raise ValueError("bbox must be 4 comma-separated numbers: west,south,east,north")
    try:
        west, south, east, north = (float(x) for x in parts)
    except ValueError:
        raise ValueError("bbox contains invalid numbers")

    if not (-180.0 <= west <= 180.0 and -180.0 <= east <= 180.0):
        raise ValueError("bbox longitude out of range (-180..180)")
    if not (-90.0 <= south <= 90.0 and -90.0 <= north <= 90.0):
        raise ValueError("bbox latitude out of range (-90..90)")

    return BBox(west=west, south=south, east=east, north=north).normalized()


@router.get("/places", response_model=list[PlaceOut])
async def get_places(
    bbox: str = Query(..., description="west,south,east,north"),
    limit: int = Query(DEFAULT_LIMIT, ge=1, le=MAX_LIMIT),
    db: AsyncSession = Depends(get_db),
):
    try:
        parsed = parse_bbox(bbox)
        canonical = f"{parsed.west},{parsed.south},{parsed.east},{parsed.north}"
        return await list_places_by_bbox(db, canonical, limit=limit)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        print("ERROR in /v1/places:", repr(e))
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to fetch places")

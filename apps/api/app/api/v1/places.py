from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.place import PlaceOut
from app.services.places_service import get_places_by_bbox

router = APIRouter(prefix="/v1", tags=["places"])
logger = logging.getLogger(__name__)

DEFAULT_LIMIT = 600
MAX_LIMIT = 1200


@router.get("/places", response_model=list[PlaceOut])
async def get_places(
    bbox: str = Query(..., description="west,south,east,north"),
    limit: int = Query(DEFAULT_LIMIT, ge=1, le=MAX_LIMIT),
    db: AsyncSession = Depends(get_db),
):
    try:
        return await get_places_by_bbox(db, bbox_raw=bbox, limit=limit)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception:
        logger.exception("Failed to fetch places", extra={"bbox": bbox, "limit": limit})
        raise HTTPException(status_code=500, detail="Failed to fetch places")

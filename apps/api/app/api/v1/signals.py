# apps/api/app/api/v1/signals.py
from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.signal import PlaceFeedOut
from app.services.signals_service import get_place_feed

router = APIRouter(prefix="/v1", tags=["signals"])


@router.get("/places/{place_id}/feed", response_model=PlaceFeedOut)
async def place_feed(
    place_id: str,
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    return await get_place_feed(db, place_id, limit=limit)

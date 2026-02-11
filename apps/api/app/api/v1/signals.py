from __future__ import annotations

from fastapi import APIRouter, Depends, Header, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.signal import CheckinConfirmIn, CheckinConfirmOut, CheckinIntentOut, PlaceFeedOut
from app.services.signals_service import confirm_checkin, create_checkin_intent, get_place_feed

router = APIRouter(prefix="/v1", tags=["signals"])


@router.get("/places/{place_id}/feed", response_model=PlaceFeedOut)
async def place_feed(
    place_id: str,
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    return await get_place_feed(db, place_id, limit=limit)


@router.post("/checkins/intent", response_model=CheckinIntentOut)
async def checkin_intent(place_id: str, request: Request):
    requester = request.client.host if request.client else "unknown"
    return await create_checkin_intent(place_id=place_id, requester_id=requester)


@router.post("/checkins/confirm", response_model=CheckinConfirmOut)
async def checkin_confirm(
    payload: CheckinConfirmIn,
    x_checkin_intent: str | None = Header(default=None, alias="X-Checkin-Intent"),
):
    return await confirm_checkin(payload, x_checkin_intent)

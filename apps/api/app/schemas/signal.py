from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel, Field


HEX64 = r"^[0-9a-f]{64}$"


class SignalFeedItem(BaseModel):
    event_id: str = Field(pattern=HEX64)
    pubkey: str = Field(pattern=HEX64)
    status: str
    content: str = ""
    created_at: datetime


class PlaceFeedOut(BaseModel):
    place_id: str
    confidence_score: float = Field(ge=0, le=100)
    total_signals: int = 0
    recent_successes: int = 0
    last_confirmed_at: datetime | None = None
    items: list[SignalFeedItem] = Field(default_factory=list)


class CheckinIntentOut(BaseModel):
    intent_token: str
    expires_in_seconds: int = 120


class CheckinConfirmIn(BaseModel):
    event_id: str = Field(pattern=HEX64)
    place_id: str
    pubkey: str | None = Field(default=None, pattern=HEX64)
    payment_evidence: dict | None = None


class CheckinConfirmOut(BaseModel):
    status: str
    reason_code: str | None = None

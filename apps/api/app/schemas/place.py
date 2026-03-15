from __future__ import annotations

from pydantic import BaseModel, Field


class PlaceClaimSummaryOut(BaseModel):
    claimed: bool
    claimant_pubkey: str | None = None
    claim_event_id: str | None = None
    claim_created_at: int | None = None


class PlaceOut(BaseModel):
    id: str
    name: str
    source: str
    lat: float
    lon: float
    glow_score: float = Field(ge=0)
    tags: dict
    claim: PlaceClaimSummaryOut = Field(
        default_factory=lambda: PlaceClaimSummaryOut(claimed=False)
    )

    model_config = {"from_attributes": True}

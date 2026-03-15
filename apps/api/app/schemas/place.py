from __future__ import annotations

from pydantic import BaseModel, Field


class PlaceClaimSummaryOut(BaseModel):
    claimed: bool
    claimant_pubkey: str | None = None
    claim_event_id: str | None = None
    claim_created_at: int | None = None


class PlaceProfileOut(BaseModel):
    confidence_score: float = Field(ge=0, le=100)
    confidence_label: str
    freshness_label: str
    recent_signals: int = Field(ge=0)
    recent_successes: int = Field(ge=0)
    last_signal_at: int | None = None
    last_confirmed_at: int | None = None
    recently_active: bool = False
    active_this_week: bool = False
    higher_confidence: bool = False
    repeated_success_signals: bool = False
    trust_signals: list[str] = Field(default_factory=list)


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
    profile: PlaceProfileOut = Field(
        default_factory=lambda: PlaceProfileOut(
            confidence_score=0,
            confidence_label="Low confidence",
            freshness_label="Quiet recently",
        )
    )

    model_config = {"from_attributes": True}

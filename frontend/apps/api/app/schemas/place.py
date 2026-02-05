from __future__ import annotations

from pydantic import BaseModel, Field


class PlaceOut(BaseModel):
    id: str
    name: str
    source: str
    lat: float
    lon: float
    glow_score: float = Field(ge=0)
    tags: dict

    model_config = {"from_attributes": True}

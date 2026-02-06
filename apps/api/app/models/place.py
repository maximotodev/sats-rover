from __future__ import annotations

from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import Column, String, Float, DateTime, JSON, func
from sqlalchemy.orm import Mapped, mapped_column
from geoalchemy2 import Geography

from app.db.base import Base


class Place(Base):
    __tablename__ = "places"

    id: Mapped[str] = mapped_column(String(128), primary_key=True)
    name: Mapped[str] = mapped_column(String(256), nullable=False)
    source: Mapped[str] = mapped_column(String(32), nullable=False)
    tags = Column(JSONB, nullable=False, server_default="{}")


    # geography(Point,4326) enables distance queries in meters and bbox via ST_MakeEnvelope + ST_Intersects with casting.
    location: Mapped[object] = mapped_column(Geography(geometry_type="POINT", srid=4326), nullable=False)

    glow_score: Mapped[float] = mapped_column(Float, nullable=False, server_default="0")
    last_activity_at: Mapped[object | None] = mapped_column(DateTime(timezone=True), nullable=True)

    created_at: Mapped[object] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[object] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

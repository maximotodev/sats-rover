# apps/api/app/services/places_service.py
from __future__ import annotations

import hashlib
import json
import logging
import os
import time
from dataclasses import dataclass
from typing import Any, Mapping

from geoalchemy2 import Geometry
from geoalchemy2.functions import ST_X, ST_Y
from sqlalchemy import and_, case, cast, column, func, select, table
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.settings import settings
from app.models.place import Place
from app.schemas.place import PlaceClaimSummaryOut, PlaceOut, PlaceProfileOut
from app.services.redis_client import redis_client

logger = logging.getLogger(__name__)
CACHE_DEBUG = os.getenv("PLACES_CACHE_DEBUG", "0") == "1"
# MUST MATCH CLIENT / NEXT PROXY
BBOX_DECIMALS = 3  # ~110m
ACTIVE_THIS_WEEK_SEC = 7 * 24 * 60 * 60
RECENTLY_ACTIVE_SEC = 3 * 24 * 60 * 60
HIGH_CONFIDENCE_THRESHOLD = 70.0
REPEATED_SUCCESS_THRESHOLD = 2


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


def build_place_claim_summary(row: Mapping[str, Any]) -> PlaceClaimSummaryOut:
    claim_event_id = row.get("claim_event_id")
    claimant_pubkey = row.get("claimant_pubkey")
    claim_created_at = row.get("claim_created_at")
    if not isinstance(claim_event_id, str) or not claim_event_id:
        return PlaceClaimSummaryOut(claimed=False)

    return PlaceClaimSummaryOut(
        claimed=True,
        claimant_pubkey=claimant_pubkey if isinstance(claimant_pubkey, str) else None,
        claim_event_id=claim_event_id,
        claim_created_at=int(claim_created_at) if isinstance(claim_created_at, int) else None,
    )


def build_place_out(row: Mapping[str, Any]) -> PlaceOut:
    claim = build_place_claim_summary(row)
    return PlaceOut.model_validate(
        {
            "id": row.get("id"),
            "name": row.get("name"),
            "source": row.get("source"),
            "tags": row.get("tags"),
            "glow_score": row.get("glow_score"),
            "lat": row.get("lat"),
            "lon": row.get("lon"),
            "claim": claim,
            "profile": build_place_profile_summary(row, claim),
        }
    )


def build_place_profile_summary(
    row: Mapping[str, Any],
    claim: PlaceClaimSummaryOut,
    *,
    now_sec: int | None = None,
) -> PlaceProfileOut:
    now_sec = int(time.time()) if now_sec is None else now_sec
    last_signal_at = int(row["last_signal_at"]) if isinstance(row.get("last_signal_at"), int) else None
    last_confirmed_at = (
        int(row["last_confirmed_at"]) if isinstance(row.get("last_confirmed_at"), int) else None
    )
    recent_signals = int(row["recent_signals"]) if isinstance(row.get("recent_signals"), int) else 0
    recent_successes = (
        int(row["recent_successes"]) if isinstance(row.get("recent_successes"), int) else 0
    )
    total_signals = int(row["total_signals"]) if isinstance(row.get("total_signals"), int) else 0
    total_successes = int(row["total_successes"]) if isinstance(row.get("total_successes"), int) else 0

    confidence_score = 0.0 if total_signals == 0 else round((total_successes / total_signals) * 100, 2)
    higher_confidence = confidence_score >= HIGH_CONFIDENCE_THRESHOLD and total_signals >= 3
    active_this_week = recent_signals > 0
    recently_active = bool(last_confirmed_at and last_confirmed_at >= now_sec - RECENTLY_ACTIVE_SEC)
    repeated_success_signals = recent_successes >= REPEATED_SUCCESS_THRESHOLD

    if higher_confidence:
        confidence_label = "Higher confidence"
    elif confidence_score > 0:
        confidence_label = "Building confidence"
    else:
        confidence_label = "Low confidence"

    if recently_active:
        freshness_label = "Recently active"
    elif active_this_week:
        freshness_label = "Active this week"
    else:
        freshness_label = "Quiet recently"

    trust_signals: list[str] = []
    if claim.claimed:
        trust_signals.append("Merchant claim published")
    if repeated_success_signals:
        trust_signals.append("Multiple recent successful signals")
    elif recently_active:
        trust_signals.append("Recent canonical activity")
    elif active_this_week:
        trust_signals.append("Recent signal activity")
    else:
        trust_signals.append("Low recent confirmation activity")

    return PlaceProfileOut(
        confidence_score=confidence_score,
        confidence_label=confidence_label,
        freshness_label=freshness_label,
        recent_signals=recent_signals,
        recent_successes=recent_successes,
        last_signal_at=last_signal_at,
        last_confirmed_at=last_confirmed_at,
        recently_active=recently_active,
        active_this_week=active_this_week,
        higher_confidence=higher_confidence,
        repeated_success_signals=repeated_success_signals,
        trust_signals=trust_signals[:3],
    )


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
    claims = table(
        "app_state_claims",
        column("pubkey"),
        column("place_id"),
        column("role"),
        column("created_at"),
        column("event_id"),
    )
    latest_claim_pubkey = (
        select(claims.c.pubkey)
        .where(claims.c.place_id == Place.id)
        .where(claims.c.role == "owner")
        .order_by(claims.c.created_at.desc(), claims.c.event_id.desc())
        .limit(1)
        .scalar_subquery()
    )
    latest_claim_event_id = (
        select(claims.c.event_id)
        .where(claims.c.place_id == Place.id)
        .where(claims.c.role == "owner")
        .order_by(claims.c.created_at.desc(), claims.c.event_id.desc())
        .limit(1)
        .scalar_subquery()
    )
    latest_claim_created_at = (
        select(claims.c.created_at)
        .where(claims.c.place_id == Place.id)
        .where(claims.c.role == "owner")
        .order_by(claims.c.created_at.desc(), claims.c.event_id.desc())
        .limit(1)
        .scalar_subquery()
    )
    signals_v2_state = table(
        "signals_v2_state",
        column("place_id"),
        column("status"),
        column("created_at"),
    )
    active_this_week_cutoff = int(time.time()) - ACTIVE_THIS_WEEK_SEC
    signal_summary = (
        select(
            signals_v2_state.c.place_id.label("summary_place_id"),
            func.count().label("total_signals"),
            func.count()
            .filter(signals_v2_state.c.status == "success")
            .label("total_successes"),
            func.count()
            .filter(signals_v2_state.c.created_at >= active_this_week_cutoff)
            .label("recent_signals"),
            func.count()
            .filter(
                and_(
                    signals_v2_state.c.created_at >= active_this_week_cutoff,
                    signals_v2_state.c.status == "success",
                )
            )
            .label("recent_successes"),
            func.max(signals_v2_state.c.created_at).label("last_signal_at"),
            func.max(
                case(
                    (signals_v2_state.c.status == "success", signals_v2_state.c.created_at),
                    else_=None,
                )
            ).label("last_confirmed_at"),
        )
        .group_by(signals_v2_state.c.place_id)
        .subquery()
    )

    query = (
        select(
            Place.id.label("id"),
            Place.name.label("name"),
            Place.source.label("source"),
            Place.tags.label("tags"),
            Place.glow_score.label("glow_score"),
            ST_Y(geom).label("lat"),
            ST_X(geom).label("lon"),
            latest_claim_pubkey.label("claimant_pubkey"),
            latest_claim_event_id.label("claim_event_id"),
            latest_claim_created_at.label("claim_created_at"),
            signal_summary.c.total_signals.label("total_signals"),
            signal_summary.c.total_successes.label("total_successes"),
            signal_summary.c.recent_signals.label("recent_signals"),
            signal_summary.c.recent_successes.label("recent_successes"),
            signal_summary.c.last_signal_at.label("last_signal_at"),
            signal_summary.c.last_confirmed_at.label("last_confirmed_at"),
        )
        .outerjoin(signal_summary, signal_summary.c.summary_place_id == Place.id)
        .where(func.ST_Intersects(geom, envelope))
        .order_by(Place.glow_score.desc())
        .limit(limit)
    )

    result = await db.execute(query)
    rows = result.mappings().all()
    out = [build_place_out(r) for r in rows]

    await redis_client.setex(
        key,
        settings.places_cache_ttl_seconds,
        json.dumps([o.model_dump() for o in out]),
    )
    return out


async def get_places_by_bbox(db: AsyncSession, bbox_raw: str, limit: int = 600) -> list[PlaceOut]:
    bbox = parse_bbox(bbox_raw)
    return await list_places_by_bbox(db, bbox, limit=limit)

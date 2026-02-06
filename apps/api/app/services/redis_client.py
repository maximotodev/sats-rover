from __future__ import annotations

import redis.asyncio as redis
from app.core.settings import settings

redis_client = redis.from_url(
    settings.redis_url,
    encoding="utf-8",
    decode_responses=True,
)

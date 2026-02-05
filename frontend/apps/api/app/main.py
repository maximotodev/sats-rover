from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api.v1.places import router as places_router
from app.core.settings import settings
from app.db.engine import engine
from app.services.redis_client import redis_client

app = FastAPI(title="SatsRover Engine", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(places_router)


@app.get("/healthz", tags=["health"])
async def healthz(response: Response):
    # Allow aggressive caching in dev; for prod set to short max-age or no-store
    response.headers["Cache-Control"] = "public, max-age=10"
    return {"ok": True, "env": settings.app_env}


@app.get("/readyz", tags=["health"])
async def readyz():
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        pong = await redis_client.ping()
        return {"ok": True, "db": True, "redis": bool(pong)}
    except Exception:
        return {"ok": False}

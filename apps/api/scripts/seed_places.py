import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

import os

DATABASE_URL = os.environ["DATABASE_URL"]

SEED = [
    ("sr:demo:1", "Demo Cafe", "sr", -89.42, 13.49, 0.8),
    ("sr:demo:2", "Demo Hotel", "sr", -89.415, 13.495, 0.4),
]

async def main():
    engine = create_async_engine(DATABASE_URL)
    async with engine.begin() as conn:
        for pid, name, source, lon, lat, glow in SEED:
            await conn.execute(
                text("""
                INSERT INTO places (id, name, source, tags, location, glow_score)
                VALUES (:id, :name, :source, '{}'::json, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography, :glow)
                ON CONFLICT (id) DO UPDATE SET
                  name = EXCLUDED.name,
                  glow_score = EXCLUDED.glow_score,
                  location = EXCLUDED.location,
                  updated_at = now();
                """),
                {"id": pid, "name": name, "source": source, "lon": lon, "lat": lat, "glow": glow},
            )
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())

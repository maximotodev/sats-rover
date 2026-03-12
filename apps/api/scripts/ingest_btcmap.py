# apps/api/scripts/ingest_btcmap.py
from __future__ import annotations

import asyncio
import logging
import sys
from pathlib import Path

if __package__ is None or __package__ == "":
    sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.db.session import AsyncSessionLocal
from app.services.ingestion_service import sync_btcmap

logging.basicConfig(level=logging.INFO)

async def main() -> None:
    async with AsyncSessionLocal() as db:
        await sync_btcmap(db)

if __name__ == "__main__":
    asyncio.run(main())

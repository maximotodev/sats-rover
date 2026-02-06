import asyncio
import os
import sys
import time
from urllib.parse import urlparse

import asyncpg


def _parse_pg_dsn(sqlalchemy_url: str) -> str:
    # sqlalchemy url: postgresql+asyncpg://user:pass@host:5432/db
    dsn = sqlalchemy_url.replace("postgresql+asyncpg://", "postgresql://")
    return dsn


async def main() -> None:
    url = os.environ.get("DATABASE_URL")
    if not url:
        print("DATABASE_URL is not set", file=sys.stderr)
        sys.exit(1)

    dsn = _parse_pg_dsn(url)

    deadline = time.time() + 60  # seconds
    last_err: Exception | None = None

    while time.time() < deadline:
        try:
            conn = await asyncpg.connect(dsn, timeout=5)
            await conn.execute("SELECT 1;")
            await conn.close()
            print("DB is ready")
            return
        except Exception as e:
            last_err = e
            print(f"Waiting for DB... ({type(e).__name__})")
            await asyncio.sleep(2)

    print(f"DB not ready after timeout: {last_err}", file=sys.stderr)
    sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())

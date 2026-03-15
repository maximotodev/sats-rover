# Local Development

This guide bootstraps the current SatsRover v2 stack locally.

## Prerequisites

- Docker + Docker Compose
- Python 3.12+
- Node 20+
- pnpm 9+

## 1. Start infrastructure

```bash
docker compose up -d
```

Services started:

- Postgres + PostGIS: `localhost:5432`
- Redis: `localhost:6379`

## 2. Environment variables

Copy and customize:

```bash
cp .env.example .env
```

Set the following in your shell or process manager:

```bash
export DATABASE_URL="postgresql+asyncpg://satsrover:satsrover@localhost:5432/satsrover"
export REDIS_URL="redis://localhost:6379/0"
export CORS_ORIGINS="http://localhost:3000"
export PLACES_CACHE_TTL_SECONDS="15"
export ROVER_ENGINE_URL="http://localhost:8000"
export INDEXER_DATABASE_URL="postgresql://satsrover:satsrover@localhost:5432/satsrover"
```

## 3. API: migrations, seed, run

```bash
cd apps/api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
python scripts/seed_places.py
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 4. Web: install and run

From the repo root in a new terminal:

```bash
pnpm install
pnpm --filter @satsrover/web dev
```

Web app runs at `http://localhost:3000`.

## 5. Indexer: run live ingestion

From the repo root in another terminal:

```bash
export INDEXER_DATABASE_URL="postgresql://satsrover:satsrover@localhost:5432/satsrover"
pnpm --filter @satsrover/indexer start
```

## 6. Truth-model checks

Current runtime boundaries:

- `signals_v2_events` is the canonical immutable ledger for check-in confirmation/history
- `signals_v2_state` is a rebuildable projection
- `checkin_submissions` is durable trace only
- Redis keys such as `checkin:pending:{event_id}` are ephemeral handoff/polling only

If `signals_v2_state` is stale or corrupt, rebuild from the canonical ledger:

```bash
pnpm run rebuild:signals-v2-state
```

Operator freshness surface:

```bash
curl -s http://localhost:8000/debug/signals | jq
```

If `state_rebuild_recommended` is `true`, run the rebuild command above.

Verification query example:

```bash
psql -h localhost -U satsrover -d satsrover -c "SELECT count(*) AS ledger_rows FROM signals_v2_events; SELECT count(*) AS state_rows FROM signals_v2_state;"
```

## 7. Places sync job

One-shot local ingest:

```bash
pnpm run ingest:btcmap
```

One-shot Docker job:

```bash
docker compose run --rm places-sync
```

Quick verification after a run:

```bash
curl -s http://localhost:8000/debug/counts | jq
curl -s "http://localhost:8000/v1/places?bbox=-89.6,13.3,-89.3,13.6&limit=20" | jq 'length'
```

## 8. Optional: bulk import historical events

```bash
cat /path/to/events.ndjson | pnpm --filter @satsrover/indexer exec tsx src/bulk_import.ts
```

## 9. Smoke checks

```bash
curl -s http://localhost:8000/healthz
curl -s "http://localhost:8000/v1/places?bbox=-89.6,13.3,-89.3,13.6&limit=100"
curl -s "http://localhost:8000/v1/places/sr:demo:1/feed"
```

## Notes

- `/v1/...` remains the live API route prefix even though the truth model is now documented as v2.
- Backend reads, not live relay fanout, drive user-visible place, claim, and confirmation state.

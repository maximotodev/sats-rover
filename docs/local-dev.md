# Local Development

This guide bootstraps the full SatsRover MVP stack locally, aligned with `docs/architecture.md` (indexed reads + decentralized writes).

## Prerequisites
- Docker + Docker Compose
- Python 3.12+
- Node 20+
- pnpm 9+

## 1) Start infrastructure

```bash
docker compose up -d
```

Services started:
- Postgres + PostGIS: `localhost:5432`
- Redis: `localhost:6379`

## 2) Environment variables

Copy and customize:

```bash
cp .env.example .env
```

Set the following in your shell (or your process manager):

```bash
export DATABASE_URL="postgresql+asyncpg://satsrover:satsrover@localhost:5432/satsrover"
export REDIS_URL="redis://localhost:6379/0"
export CORS_ORIGINS="http://localhost:3000"
export PLACES_CACHE_TTL_SECONDS="15"
export ROVER_ENGINE_URL="http://localhost:8000"
# indexer uses pg driver URL (without +asyncpg)
export INDEXER_DATABASE_URL="postgresql://satsrover:satsrover@localhost:5432/satsrover"
```

## 3) API: migrations + seed + run

```bash
cd apps/api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
python scripts/seed_places.py
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 4) Web: install + run

From repo root in a new terminal:

```bash
pnpm install
pnpm --filter @satsrover/web dev
```

Web app runs at `http://localhost:3000`.

## 5) Indexer: run live ingestion

From repo root in another terminal:

```bash
export INDEXER_DATABASE_URL="postgresql://satsrover:satsrover@localhost:5432/satsrover"
pnpm --filter @satsrover/indexer start
```

`signals_v2_events` is the canonical ledger; `signals_v2_state` is a rebuildable projection.
If projection state is stale/corrupt, rebuild from ledger:

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

## 6) Places sync job (BTCMap)

One-shot local ingest:

```bash
pnpm run ingest:btcmap
```

One-shot Docker job:

```bash
docker compose run --rm places-sync
```

Recommended schedule (job-style, no always-on loop): run every 6h or daily.

Quick verification after a run:

```bash
curl -s http://localhost:8000/debug/counts | jq
curl -s "http://localhost:8000/v1/places?bbox=-89.6,13.3,-89.3,13.6&limit=20" | jq 'length'
```

## 7) Optional: bulk import historical events

```bash
cat /path/to/events.ndjson | pnpm --filter @satsrover/indexer exec tsx src/bulk_import.ts
```

## 8) Smoke checks

```bash
curl -s http://localhost:8000/healthz
curl -s "http://localhost:8000/v1/places?bbox=-89.6,13.3,-89.3,13.6&limit=100"
curl -s "http://localhost:8000/v1/places/sr:demo:1/feed"
```

## Notes
- API cache TTL defaults to 15s to better align with signal visibility SLOs.
- Check-in confirmation stores pending records in Redis for reconciliation (`checkin:pending:{event_id}`).

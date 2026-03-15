# SatsRover

SatsRover is a Bitcoin merchant discovery app built on a Nostr publish path with backend-indexed reads. The repo is now post-core-migration for v2 check-in truth semantics: canonical confirmation comes from indexed backend read surfaces, not from optimistic client state or relay publish success alone.

## Current Status

- Stable v2 check-in truth boundaries are implemented.
- Merchant claim Phase 1 is implemented as an informational-first claim flow.
- Place Profile v2 read models and local discovery filters are implemented.
- The repo still contains some legacy compatibility residue. Treat the docs in `docs/` as the source of truth for current architecture.

## Monorepo Structure

- `apps/web`: Next.js web client, Nostr publish flows, MerchantDrawer, map discovery UI.
- `apps/api`: FastAPI read/write API, place and feed read surfaces, check-in confirm/status flows.
- `apps/indexer`: Nostr indexer and reducers for canonical signal ingest and claim ingest.
- `packages/protocol`: legacy runtime-adjacent residue; do not treat it as the canonical v2 protocol reference.
- `docs`: current architecture, protocol, roadmap, ADRs, and contributor guidance.

## Architecture Summary

SatsRover follows a strict write/read split:

- Client writes: users sign and publish Nostr events from the web client.
- Backend reads: UI truth comes from API + indexer-backed read models.
- Canonical truth:
  - `signals_v2_events` is the canonical immutable confirmation/history surface for check-ins.
- Derived state:
  - `signals_v2_state` is a rebuildable projection derived from the canonical ledger.
  - place profile and discovery fields are derived read models layered on top of canonical data.
- Durable trace:
  - `checkin_submissions` persists confirm handoff and diagnostics, but it is not canonical confirmation truth.
- Ephemeral state:
  - Redis is used for cache, handoff, and polling only.
- Claims:
  - a merchant claim becomes user-visible only when canonical backend/indexer read state surfaces it.
- UI:
  - optimistic publish state is presentation only and must never be treated as truth.

## Documentation Map

- [Architecture](docs/architecture.md): current implemented system design and truth boundaries.
- [Protocol Reference](docs/protocol/satsrover-v2.json): current v2 event shapes and protocol expectations.
- [Roadmap](docs/roadmap.md): completed, active, next, and deferred workstreams.
- [ADRs](docs/adr/README.md): durable architecture decisions.
- [Contributor Guide](docs/contributor-guide.md): repo navigation and safe extension rules.
- [Local Development](docs/local-dev.md): local environment bootstrap and smoke checks.

## Local Development

Use the full local guide in [docs/local-dev.md](docs/local-dev.md). The shortest path is:

1. `docker compose up -d`
2. API: create `apps/api/.venv`, install dependencies, run `alembic upgrade head`, then `uvicorn app.main:app --reload --port 8000`
3. Web: `pnpm install` then `pnpm --filter @satsrover/web dev`
4. Indexer: `pnpm --filter @satsrover/indexer start`

Useful root scripts:

- `pnpm ingest:btcmap`
- `pnpm rebuild:signals-v2-state`
- `pnpm typecheck`

## Current Product Surfaces

- Map-based place discovery from `/v1/places` via the web `/api/merchants` proxy.
- MerchantDrawer check-in publish, backend confirm, and canonical confirmation polling.
- Merchant claim publication with canonical read-state rendering.
- Place Profile v2 summaries for freshness, confidence, and trust signals.
- Local-only discovery filters driven by existing derived read-model fields.

## Guidance For New Work

Follow the existing truth boundaries:

- do not treat relay publish success as canonical confirmation
- do not treat Redis as authoritative state
- do not infer claim or place-profile truth from optimistic UI
- extend existing read surfaces before inventing parallel fetch paths

If you change architecture, update the ADRs and `docs/architecture.md`. If you change protocol meaning, update `docs/protocol/satsrover-v2.json`. If you change priorities or migration state, update `docs/roadmap.md`.

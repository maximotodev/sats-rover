# Contributor Guide

This guide is for contributors joining SatsRover after the v2 truth-model migration.

## Start Here

Read these in order:

1. [`README.md`](../README.md)
2. [`docs/architecture.md`](architecture.md)
3. [`docs/protocol/satsrover-v2.json`](protocol/satsrover-v2.json)
4. [`docs/roadmap.md`](roadmap.md)
5. [`docs/adr/README.md`](adr/README.md)

## Repo Map

- `apps/web`
  - UI state, map discovery, MerchantDrawer
  - Nostr publish hooks and browser telemetry
  - local-only optimistic state and discovery filters
- `apps/api`
  - read APIs for places and feeds
  - check-in confirm/status flows
  - cache and polling integration
- `apps/indexer`
  - Nostr ingestion
  - canonical ledger writes
  - claim ingest
  - state reducers
- `docs`
  - current architectural truth and contributor context

## Safe Extension Rules

### Check-ins

- publish success is not canonical confirmation
- exact `event_id` correlation matters
- `signals_v2_events` is the canonical confirmation surface
- `checkin_submissions` is durable trace only
- Redis pending/meta/probe keys are ephemeral only

### Claims

- `Claimed` means a claim exists in canonical backend/indexer read state
- current implementation does not prove verified ownership
- do not show claim truth from local publish success alone

### Place profiles and discovery

- place profile fields are derived read-model summaries
- discovery filters must use canonical/derived payload fields, not optimistic assumptions
- prefer extending `/v1/places` and the web merchant proxy over adding parallel fetch paths

## Where To Implement New Work

### Change UI presentation only

- usually `apps/web/src/components/map/*`
- keep truth semantics unchanged

### Change browser publish behavior or telemetry

- `apps/web/src/hooks/use-nostr.ts`
- `apps/web/src/flows/*`
- do not blur publish success with canonical confirmation

### Change canonical read data shown in the UI

- API schemas and services under `apps/api/app`
- web merchant proxy under `apps/web/src/app/api/merchants/route.ts`
- web types under `apps/web/src/lib/types.ts`

### Change canonical ingest/reducer behavior

- `apps/indexer/src`
- update protocol docs and ADRs if semantics change

## Residue To Treat Carefully

- `/v1/...` route names are live API paths, not stale docs
- `signals` and some fallback code remain as compatibility residue
- `packages/protocol` is stale relative to the implemented v2 runtime and should not be used for new protocol work without an explicit cleanup task
- historical alembic migrations may describe older schema intent; do not treat migration comments as current architecture docs

## Documentation Workflow

- architecture truth changes: update `docs/architecture.md` and an ADR
- protocol changes: update `docs/protocol/satsrover-v2.json`
- roadmap/priorities change: update `docs/roadmap.md`
- repo navigation/context changes: update `README.md`

Keep docs concrete and implementation-grounded. If something is deferred or ambiguous, say so explicitly.

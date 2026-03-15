# SatsRover v2 Architecture

This document describes the current implemented architecture of SatsRover. It is intended for contributors extending the repo after the core v2 migration.

## System Overview

SatsRover is a merchant discovery and check-in system with:

- decentralized client publish over Nostr
- backend-indexed canonical reads
- derived place and discovery read models for UI

The system is intentionally not a social network, events platform, or wallet app. Bitcoin and Nostr are used to support merchant discovery, check-in evidence, and informational merchant presence.

## Component Map

### `apps/web`

- publishes signed check-in and claim events
- proxies browser reads through `/api/merchants` and check-in proxy routes
- renders map discovery, MerchantDrawer, check-in UX, claim UX, and place-profile summaries
- may show optimistic/pending state, but does not own truth

### `apps/api`

- serves `/v1/places`, place feeds, check-in confirm, and check-in status/debug surfaces
- reads canonical and derived state from Postgres
- uses Redis for cache, intent handoff, and short-lived polling state
- exposes the backend-driven read surfaces the UI relies on

### `apps/indexer`

- subscribes to Nostr relays
- validates and ingests check-in events into the canonical ledger
- reduces canonical events into `signals_v2_state`
- ingests merchant claims into canonical claim read state

### `packages`

- `packages/protocol` currently contains legacy runtime-adjacent residue and does not match the current live v2 protocol. Do not use it as the source of truth for new work.

## Truth Model

### Canonical truth

- `signals_v2_events`
  - canonical immutable confirmation/history surface for v2 check-ins
  - exact `event_id` presence here is canonical confirmation truth

### Derived/materialized state

- `signals_v2_state`
  - rebuildable derived state from `signals_v2_events`
  - used for read summaries, recent activity, and place-level projections
- place profile summaries
  - derived in API read paths from claim state plus `signals_v2_state`
- local discovery filter results
  - derived in the web client from the already-loaded merchant payload

### Durable trace, not canonical truth

- `checkin_submissions`
  - durable confirm handoff and operator/debug trace
  - useful for idempotency, raw event metadata, and diagnostics
  - must not be treated as canonical confirmation on its own

### Ephemeral state

- Redis
  - viewport cache
  - check-in intent tokens
  - short-lived pending/meta/probe status keys
  - never authoritative for canonical confirmation or claim truth

### Compatibility residue

- legacy `signals` table and related v1 fallback paths still exist in parts of API/indexer code for compatibility and diagnostics
- `/v1/...` route names remain current API paths even though the runtime truth model is v2
- this residue must not be treated as the canonical v2 model

## End-to-End Flows

### Check-in publish -> confirm -> canonical confirmation

1. Web signs and publishes a kind `30331` signal event with canonical `place` and `status` tags.
2. Relay publish success is telemetry only. It is not canonical confirmation.
3. Web sends `/v1/checkins/confirm` with the exact signed `event_id` and associated metadata.
4. API persists `checkin_submissions` as durable trace.
5. Indexer ingests the Nostr event into `signals_v2_events`.
6. Once the exact `event_id` is present in `signals_v2_events`, canonical confirmation exists.
7. `signals_v2_state` is updated from the canonical ledger.
8. MerchantDrawer and feeds observe backend/indexer read state, not local publish assumptions.

### Claim publish -> ingest -> canonical read state

1. Web signs and publishes a kind `30078` claim event using:
   - `t=satsrover-claim`
   - `v=2`
   - `d=claim:<place_id>`
   - `place=<place_id>`
   - `role=owner`
2. Local publish success is not canonical claim truth.
3. Indexer validates the claim lane and upserts the latest claim into `app_state_claims`.
4. API reads latest claim state per place and exposes a compact claim summary through `/v1/places`.
5. MerchantDrawer shows `Claimed` or `Unclaimed` only from canonical backend/indexer read data.

The current implementation models “a claim event exists,” not verified ownership.

### Place profile/read-model flow

1. API loads places from PostGIS-backed `places`.
2. API joins:
   - latest claim summary from `app_state_claims`
   - recent activity and success aggregates from `signals_v2_state`
3. API derives compact read-model fields such as:
   - freshness labels
   - confidence labels
   - recent/repeated success counters
   - compact trust-signal explanations
4. Web `/api/merchants` sanitizes and forwards those fields to the map UI.
5. MerchantDrawer renders those derived fields as informational summaries.

### Discovery/filter flow

1. `MapView` fetches the current viewport’s merchant payload from `/api/merchants`.
2. The fetched merchant list is stored as the source collection.
3. Local-only filters derive a filtered projection from the current loaded set.
4. Markers, nearby count, and Smart Explore all use the filtered projection.
5. No canonical data is mutated by the filtering flow.

## Current Read Surfaces

### `/v1/places`

Current place payload includes:

- base place metadata
- `claim`
  - `claimed`
  - `claimant_pubkey`
  - `claim_event_id`
  - `claim_created_at`
- `profile`
  - confidence/freshness labels
  - recent signal counts
  - last signal / last confirmed timestamps
  - booleans used by discovery filters
  - compact trust-signal explanations

### `/v1/places/{place_id}/feed`

- recent signal feed and feed summary
- canonical or compatibility-backed read path depending on schema availability

### Web `/api/merchants`

- sanitized place payload for browser use
- source for map rendering, MerchantDrawer data, and discovery filters

## Product State Represented In The Repo

Implemented:

- v2 canonical check-in confirmation semantics
- claim Phase 1 informational flow
- Place Profile v2 derived read model
- local discovery filters using derived profile fields

Not implemented:

- merchant verification or ownership proof adjudication
- moderation or disputes
- trust-weight redesign
- social/chat/events features
- server-side discovery filtering or search redesign

## Contributor Rules For Safe Extensions

When adding new features:

- keep writes and reads separate
- do not promote optimistic UI to truth
- do not infer confirmation from relay publish success
- do not treat `checkin_submissions` as canonical confirmation
- do not treat Redis as authoritative state
- preserve exact `event_id` and `place_id` correlation
- prefer extending existing `/v1/places` and `/api/merchants` read surfaces before adding parallel endpoints
- if a change alters architecture or truth boundaries, add or update an ADR and this file

## Deferred Scope

Intentionally deferred from the current repo state:

- ownership verification and claim policy
- multi-claim adjudication
- distributed merchant profile overrides via canonical ingest
- moderation/dispute systems
- ranking or trust-model redesign
- broader discovery/search backend work

## Legacy And Migration Notes

Historical migrations and compatibility code still reference earlier tables or protocol assumptions. Treat them as implementation history, not current architecture:

- migration files are historical records and may mention older claim/storage approaches
- some API/indexer paths still contain v1 compatibility logic for missing tables or legacy reads
- `packages/protocol` is stale relative to the live v2 implementation

When cleaning residue in the future, prefer:

- documenting legacy status first
- removing only after imports and runtime dependency edges are proven absent

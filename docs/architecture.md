# SatsRover Architecture (Primal-Inspired Reliability Design)

This document defines a **production-oriented system design** for SatsRover, optimized for reliability, low-latency UX, and anti-fragile Nostr + Lightning flows.

> Guiding idea copied from Primal’s model: **clients publish to a decentralized network, but reads come from a deterministic indexed backend**.

---

## 1) Product SLOs (what the architecture must guarantee)

### User-facing SLO targets
- **P95 map viewport load:** `< 700ms` (warm cache), `< 2s` (cold cache).
- **P95 place drawer load:** `< 500ms` for place summary + confidence.
- **Signal visibility latency:** `< 5s` from publish to API read-path visibility.
- **Availability target:** `99.9%` for `/v1/places` and `/v1/places/:id/feed`.

### Why this matters
If discovery or proof is flaky, users interpret the product as untrustworthy (“I paid, but nothing happened”). Reliability is the first growth feature.

---

## 2) Architecture principles

1. **Indexed reads, decentralized writes**
   - Client can publish signed events to relays.
   - Read experience must come from backend cache/index.
2. **Canonical IDs over fuzzy joins**
   - Every place must resolve to one canonical `place_id`.
3. **Deterministic ingest pipeline**
   - ETL jobs are replayable and idempotent.
4. **Evidence-weighted trust**
   - Signals are stored with provenance and confidence inputs.
5. **Graceful degradation**
   - If relays/Overpass fail, API still serves stale-but-valid cached results.

---

## 3) Service topology (target)

```
┌───────────────────────────────┐
│          Web App (Next)       │
│  - map UX, onboarding, wallet │
│  - publishes signed events    │
└──────────────┬────────────────┘
               │
               v
┌──────────────────────────────────────────────┐
│            Rover API (FastAPI)              │
│  - auth + rate limiting                      │
│  - /v1/places, /v1/places/:id, /feed        │
│  - /checkins/intent + /confirm              │
│  - cache orchestration + feature flags       │
└──────────────┬─────────────────────┬─────────┘
               │                     │
               v                     v
      ┌────────────────┐     ┌─────────────────┐
      │ Postgres+GIS   │     │ Redis           │
      │ canonical data │     │ hot cache + RL  │
      └───────┬────────┘     └────────┬────────┘
              ^                        ^
              │                        │
      ┌───────┴────────────────────────┴───────┐
      │          Rover Indexer Worker          │
      │ - Nostr relay ingestion                 │
      │ - Overpass/BTCMap ingestion             │
      │ - normalization + dedupe + scoring      │
      └─────────────────────────────────────────┘
```

### Current repository mapping
- `apps/web` → Web App.
- `apps/api` → Rover API.
- `apps/indexer` → Indexer worker.

---

## 4) Data model (canonical, derived, and cache)

## 4.1 Canonical entities

### `places`
- `id` (PK, string): canonical ID (`osm:node:123`, `btcmap:abc`, `manual:uuid`).
- `name` (text).
- `source_primary` (enum): `osm|btcmap|manual`.
- `source_refs` (jsonb): all known upstream IDs.
- `tags` (jsonb).
- `location` (geometry POINT, SRID 4326).
- `status` (enum): `active|stale|closed|unverified`.
- `updated_at` (timestamp).

Indexes:
- `GIST(location)` for viewport queries.
- `BTREE(status, updated_at)` for stale sweeps.

### `signals_v2_events` (canonical ledger)
- Immutable canonical ingestion/confirmation surface for user-visible v2 confirmation.
- One row per ingested event id (`event_id` PK), including parsed signal fields (`pubkey`, `place_id`, `status`, `created_at`, `day_utc`) and canonical event/history payload fields.
- `event_id` existence in this table is canonical truth for v2 confirmation.

### `checkin_submissions` (durable trace, not canonical confirmation truth)
- Durable API submission trace keyed by `event_id`.
- Used for request durability/idempotency and operator diagnostics.
- Must not be treated as canonical confirmation by itself.

## 4.2 Derived entities

### `signals_v2_state` (derived/materialized state)
- Deterministic reduced state derived from `signals_v2_events`.
- Used for feed/state reads and summary projections.
- Rebuildable from the canonical ledger.

## 4.3 Cache keys (Redis)

- `places:bbox:{hash}` → serialized viewport response (TTL 60–180s).
- `place:feed:{place_id}` → recent feed payload (TTL 15–60s).
- `place:summary:{place_id}` → confidence + metadata (TTL 60–300s).
- `rl:checkin:{pubkey}:{place_id}` → burst control window.
- `checkin:pending:{event_id}`, `checkin:meta:{event_id}`, `checkin:probe:{event_id}` → ephemeral handoff/polling only (non-durable, non-canonical).

### Legacy compatibility residue
- `signals` (legacy table) may still exist for compatibility boundaries.
- It is not canonical for user-visible v2 confirmation semantics.

---

## 5) Primal-style read/write split

### Write path (decentralized)
1. Client signs/publishes Nostr signal event.
2. Client posts `/v1/checkins/confirm` with the same signed `event_id` + metadata.
3. API persists `checkin_submissions` as durable trace (not canonical confirmation).
4. Canonical confirmation exists only when that exact `event_id` is present in `signals_v2_events`.
5. `signals_v2_state` is materialized from canonical events.
6. Redis remains ephemeral handoff/polling state and does not define truth.

### Read path (deterministic)
1. Client loads places/feed from API only.
2. API serves from Redis hot cache.
3. On miss, API queries Postgres and repopulates cache.
4. UI never blocks on live relay fetch.

---

## 6) API contract (v1)

### `GET /v1/places?bbox={minLon,minLat,maxLon,maxLat}&limit=600`
Returns canonical places for viewport.

### `GET /v1/places/{place_id}`
Returns canonical place detail + source provenance.

### `GET /v1/places/{place_id}/feed?cursor=...`
Returns recent signals, confidence, and summary counters.

### `POST /v1/checkins/intent`
Creates short-lived intent token (anti-replay and rate-limit gate).

### `POST /v1/checkins/confirm`
Accepts signed event + intent token + optional payment evidence.

Response includes:
- `status`: `pending|ok|rejected|failed` (route-dependent mapping)
- `reason_code` for failures.

User-visible canonical confirmation source: `signals_v2_events` ledger presence by `event_id`.

---

## 7) Critical protocol decisions

## 7.1 Canonical place tag
Use one tag namespace everywhere:
- publish: `['place', '<canonical_place_id>']`
- query: `#place=[<canonical_place_id>]`

Do not mix `#r` or alternative IDs for primary lookups.

## 7.2 Canonical place ID strategy
Normalize all source IDs at ingestion:
- OSM node/way/relation → `osm:{type}:{id}`
- BTCMap entry → `btcmap:{id}`
- community submission → `manual:{uuid}`

Keep source crosswalk in `source_refs`.

## 7.3 Security posture
- Prefer NIP-07 / NIP-46 for key custody.
- Persistent local key storage must be encrypted (WebCrypto + passphrase/device key).
- Treat localStorage plaintext secrets as disallowed in production mode.

---

## 8) Trust and scoring model (v1)

Confidence score (0–100) = weighted sum of:
- `recency_weight` (recent activity counts more).
- `success_ratio_weight` (`success / total`).
- `unique_pubkey_weight` (anti-single-user gaming).
- `source_quality_weight` (`btcmap verified` > `manual`).
- `penalty_weight` for suspicious bursts or repeated failures.

Store score components to make moderation and tuning explainable.

---

## 9) Reliability and failure modes

### Failure: Overpass downtime
- Mitigation: scheduled ingestion + cached snapshots + BTCMap fallback.
- Outcome: map stays available with slightly stale data.

### Failure: relay lag/partial propagation
- Mitigation: multi-relay ingestion + delayed reconciliation pass.
- Outcome: signals appear with `pending` state before full confirmation.

### Failure: cache outage (Redis)
- Mitigation: direct Postgres fallback, reduced QPS via stricter limits.
- Outcome: degraded latency, no data loss.

### Failure: spam wave
- Mitigation: per-IP/pubkey/place limits + daily uniqueness + optional payment evidence.
- Outcome: bounded blast radius and controlled confidence pollution.

---

## 10) Infra and deployment tradeoffs

## Option A: single-region MVP (recommended first)
- One API deployment, one Postgres, one Redis, one worker pool.
- Cheapest, simplest to operate.
- Good until sustained global traffic causes latency spikes.

## Option B: multi-region read replicas
- Regional API + cache nodes, central write primary.
- Better p95 globally.
- More complexity: replication lag and invalidation strategy.

## Option C: serverless-only
- Low ops overhead.
- Weak fit for sustained ingest streams and PostGIS-heavy workloads.

Recommendation:
- Start with **Option A**, instrument aggressively, graduate to read replicas once p95 and QPS demand it.

---

## 11) Observability plan

### Metrics
- API: request rate, p50/p95/p99 latency, 5xx rate.
- Cache: hit ratio, miss ratio, eviction rate.
- Indexer: events/sec, lag to head relay timestamp.
- Data quality: percentage of places with canonical source_refs, orphan signal rate.

### Tracing + logs
- Correlate `checkin_intent_id` across API and indexer.
- Structured logs with `place_id`, `pubkey_hash`, `reason_code`.
- Operator/debug surfaces may normalize stale Redis pending-like traces once canonical ledger truth exists, to avoid contradictory diagnostics; this is presentation behavior only and does not make Redis authoritative.

### Alerts
- `/v1/places` 5xx > 1% for 5 minutes.
- Index lag > 60 seconds for 10 minutes.
- Cache hit ratio < 70% sustained.

---

## 12) Migration state (current truth model)

The repo is post-core-migration for v2 truth boundaries:
- `signals_v2_events` is canonical immutable truth for user-visible confirmation/history.
- `signals_v2_state` is derived/materialized state from canonical events.
- `checkin_submissions` is a durable submission trace only.
- Redis is ephemeral handoff/polling state only.

Remaining migration work is normalization and cleanup around these already-implemented boundaries, not truth-model redesign.

---

## 13) Architecture decision records (ADRs)

- **ADR-001:** Reads served from backend index, not client relay fanout.
- **ADR-002:** `place` is canonical Nostr tag for place identity.
- **ADR-003:** Canonical place IDs are namespaced and source-normalized.
- **ADR-004:** Redis used for hot path caching and rate limiting.
- **ADR-005:** Check-in lifecycle is intent → durable submission trace → canonical ledger visibility.

---

## 14) TL;DR

- Use Primal’s reliability pattern: decentralized publish, centralized indexed reads.
- Make canonical place identity non-negotiable.
- Design for failure: stale cache beats empty screen.
- Canonical confirmation truth for v2 is `signals_v2_events` by exact `event_id`; derived state and ephemeral traces assist reads/diagnostics but do not override ledger truth.

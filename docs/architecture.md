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

### `signals`
- `event_id` (PK, string).
- `pubkey` (string).
- `place_id` (FK -> places.id).
- `status` (enum): `success|failed|did_not_try`.
- `signal_at` (timestamp).
- `signal_date` (date).
- `relay_set` (jsonb): relays observed from indexer.
- `raw_tags` (jsonb).

Constraints:
- unique (`pubkey`, `place_id`, `signal_date`) for anti-spam daily uniqueness.
- optional unique (`event_id`) as canonical dedupe.

### `payment_evidence` (optional but recommended)
- `id` (PK).
- `signal_event_id` (FK -> signals.event_id).
- `proof_type` (`none|nwc|preimage|external_ref`).
- `proof_ref` (text/jsonb).
- `verified` (bool).

## 4.2 Derived entities

### `place_stats_daily`
- `place_id`, `date`.
- `signals_total`, `signals_success`, `unique_pubkeys`.
- `score_components` (jsonb).

### `place_confidence`
- `place_id`.
- `confidence_score` (`0..100`).
- `last_confirmed_at`.
- `computation_version`.

## 4.3 Cache keys (Redis)

- `places:bbox:{hash}` → serialized viewport response (TTL 60–180s).
- `place:feed:{place_id}` → recent feed payload (TTL 15–60s).
- `place:summary:{place_id}` → confidence + metadata (TTL 60–300s).
- `rl:checkin:{pubkey}:{place_id}` → burst control window.

---

## 5) Primal-style read/write split

### Write path (decentralized)
1. Client signs/publishes Nostr signal event.
2. Client posts `/v1/checkins/confirm` with event id + metadata.
3. Indexer ingests from relay streams and confirms canonical persistence.
4. API returns eventual consistency state (`pending|confirmed|rejected`).

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
- `status`: `pending|confirmed|rejected`
- `reason_code` for failures.

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

### Alerts
- `/v1/places` 5xx > 1% for 5 minutes.
- Index lag > 60 seconds for 10 minutes.
- Cache hit ratio < 70% sustained.

---

## 12) Migration plan (incremental, low risk)

### Phase 0 (1–3 days): reliability patch
- Enforce canonical `place` tag end-to-end.
- Cache viewport reads (`/v1/places`) with short TTL.
- Add fallback source path when primary upstream fails.

### Phase 1 (1–2 weeks): index-backed reads
- Add `/v1/places/{id}` and `/v1/places/{id}/feed`.
- Shift UI drawer reads from relays to API.
- Keep relay reads as hidden fallback only.

### Phase 2 (1 week): check-in intent/confirm
- Implement intent token + confirm endpoint.
- Persist pending/confirmed lifecycle in DB.

### Phase 3 (1–2 weeks): trust hardening
- Add payment evidence table and scoring weights.
- Add anti-spam controls and reviewer reputation inputs.

### Phase 4 (ongoing): growth and optimization
- Merchant claim flow.
- Invite loops and quality feedback pathways.
- Read replica rollout if SLO pressure requires.

---

## 13) Architecture decision records (ADRs)

- **ADR-001:** Reads served from backend index, not client relay fanout.
- **ADR-002:** `place` is canonical Nostr tag for place identity.
- **ADR-003:** Canonical place IDs are namespaced and source-normalized.
- **ADR-004:** Redis used for hot path caching and rate limiting.
- **ADR-005:** Check-in lifecycle is intent → confirm → indexed visibility.

---

## 14) TL;DR

- Use Primal’s reliability pattern: decentralized publish, centralized indexed reads.
- Make canonical place identity non-negotiable.
- Design for failure: stale cache beats empty screen.
- Move from “relay-dependent UX” to “API-guaranteed UX” while preserving open protocols.

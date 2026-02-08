# SatsRover System Architecture & Tradeoffs

This document describes the **current** SatsRover architecture and proposes **evolutionary upgrades** focused on reliability, data quality, and user trust. It also captures **data structures**, **service boundaries**, and the **tradeoffs** behind each decision.

## Goals

1. **Reliability first**: discovery and check-in flows should work even when relays or upstream APIs degrade.
2. **Low-latency UX**: map and feed queries should return quickly and consistently.
3. **Trust by design**: store verifiable, canonical identifiers and track provenance.
4. **Incremental migration**: keep the Next.js app functional while adding backend capabilities.

---

## Current architecture (as shipped)

```
apps/web     → Next.js frontend (Nostr client + wallet connect)
apps/api     → FastAPI read API + Postgres/PostGIS
apps/indexer → TS worker (ingests Nostr signals)
```

### Current data flow

```
Client (Next.js)
  - GET /app/api/merchants (BFF)
  - Nostr publish signals via NDK
        |
        v
FastAPI (apps/api)
  - /v1/places?bbox=... (PostGIS)
        |
        v
Postgres/PostGIS
        ^
        |
Indexer (apps/indexer)
  - Nostr relay ingestion
```

**Strengths**
- Single repo for UI + API + indexing.
- Clear trust boundary (client signs events; backend verifies/stores).

**Weaknesses**
- Dependency on external discovery sources for places (Overpass/BTCMap) can cause empty maps without caching or redundancy.
- Mixed real-time Nostr reads in the client can lead to incomplete or delayed social proof.

---

## Target architecture (reliability-optimized)

### Core principle

**Clients should publish signed events, but reads should be served from a reliable, cached index**.

### Services

1. **Web App (Next.js)**
   - UI, onboarding, and publishing.
   - Minimal direct relay reads; default to Rover API.
2. **Rover API (FastAPI)**
   - Rate limits, caching, and stable read endpoints.
   - Place queries, feed aggregation, and signal validation.
3. **Rover Indexer (worker)**
   - Ingests from relays and external sources.
   - Normalizes data and writes to Postgres.
4. **Data stores**
   - Postgres + PostGIS for canonical records and geo queries.
   - Redis (optional) for hot caches and rate limiting.

### Target data flow

```
Client (Next.js)
  - GET /v1/places?bbox=...
  - GET /v1/places/:id/feed
  - POST /v1/checkins/intent
  - POST /v1/checkins/confirm
        |
        v
Rover API (FastAPI)
  - Cache + rate limit (Redis)
        |
        v
Postgres (PostGIS)  ← Indexer (Overpass/BTCMap + Nostr relay ingestion)
```

---

## Data structures (canonical vs. derived)

### Place (canonical)
**Purpose:** stable identity across sources and queries.

Suggested fields:
- `id` (string): canonical place ID, e.g. `osm:node:123` or `btcmap:place:xyz`.
- `name` (string)
- `source` (enum: `osm`, `btcmap`, `manual`)
- `tags` (jsonb): raw source tags for debugging and filtering.
- `location` (geometry: `POINT`) for fast geospatial queries.
- `glow_score` (numeric): derived confidence score.

### Signal / Check-in (derived + signed)
**Purpose:** proof-of-presence and reputation signal.

Suggested fields:
- `event_id` (string): Nostr event id.
- `pubkey` (string)
- `place_id` (string → places.id)
- `status` (enum: `success`, `failed`, `did_not_try`)
- `created_at` (timestamp)
- `signal_date` (date): for deduping per-day activity.

### Feed aggregation (derived)
**Purpose:** fast UX for place details.

Suggested fields:
- `place_id`
- `recent_signals` (list)
- `unique_visitors` (count)
- `score` (computed)
- `last_confirmed_at` (timestamp)

---

## API design (minimal contract)

- `GET /v1/places?bbox=...&limit=...` → list of places in viewport.
- `GET /v1/places/{id}` → canonical place details.
- `GET /v1/places/{id}/feed` → aggregated signals + confidence.
- `POST /v1/checkins/intent` → create short-lived intent token.
- `POST /v1/checkins/confirm` → submit signed event + optional payment proof.

---

## Infrastructure tradeoffs

### 1) Client relay reads vs. backend indexing
**Option A: Client-only relay reads**
- ✅ lower backend cost
- ❌ unreliable; inconsistent relay propagation

**Option B: Backend index + cache (recommended)**
- ✅ consistent UX and fast reads
- ✅ can apply anti-spam, dedupe, and scoring
- ❌ requires ops and data storage

### 2) Overpass direct calls vs. cached ingestion
**Option A: direct Overpass queries**
- ✅ simplest implementation
- ❌ single point of failure, inconsistent latency

**Option B: periodic ingestion + PostGIS**
- ✅ reliable map availability
- ✅ fast geo queries
- ❌ requires worker + storage

### 3) Local secret storage vs. delegated signing
**Option A: localStorage nsec/nwc**
- ✅ fast onboarding
- ❌ high risk (XSS/extensions)

**Option B: NIP-07 / NIP-46 or encrypted local storage**
- ✅ safer key custody
- ✅ better UX for returning users
- ❌ more integration work

---

## Reliability improvements (phase zero)

1. **Canonical tags for place identity**
   - Use a single tag (`place`) across all publishing and reading.
2. **Place discovery redundancy**
   - Cache bbox responses in Redis or Postgres.
   - Fall back to BTCMap dumps when Overpass fails.
3. **Relay health checks**
   - Prefer relays with recent event success and latency metrics.

---

## Migration plan (incremental)

1. **Keep Next.js API as thin BFF**
   - Forward to Rover API for `/places`.
2. **Add indexer ingestion for places + signals**
   - Regular ETL from Overpass/BTCMap.
3. **Switch UI reads**
   - Default to Rover API for feeds and maps.
   - Keep relay reads as fallback.
4. **Introduce intent/confirm flow**
   - Backend issues intent token and verifies signal + payment proof.

---

## Open questions for product + infra

1. Will SatsRover **issue invoices** or only **pay existing invoices**?
2. Should check-ins require **proof-of-payment** or allow free signals?
3. Is the primary platform **mobile web**, **desktop**, or **PWA** first?
4. What is the minimum acceptable **latency** for map loads?

---

## TL;DR

- Index reads in the backend, publish events from the client.
- Treat Overpass and relays as **inputs**, not sources of truth.
- Canonical place IDs + cache-backed feeds = stable UX.
- Use delegated or encrypted signing to avoid local secret risk.

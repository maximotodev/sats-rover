# ADR-0002: Backend read models drive merchant and discovery UI

- Status: Accepted
- Date: 2026-03-15

## Context

SatsRover’s product surface depends on timely place visibility, canonical check-in summaries, merchant claims, and lightweight trust/freshness cues. Allowing the client to assemble truth directly from relay responses or optimistic local state would make the UI inconsistent and fragile.

The current repo already converged on backend/indexer-driven reads:

- claims become visible only after canonical read state surfaces them
- place profile fields are derived from backend state
- discovery filters operate on the existing merchant payload

## Decision

Merchant and discovery UI is driven by backend/indexer read models:

- web clients publish events
- API and indexer define canonical and derived read state
- MerchantDrawer and map discovery consume `/v1/places` via the web proxy
- local filter state is allowed, but only as a projection over already-loaded canonical/derived payloads

## Consequences

- do not add UI states that imply canonical truth from optimistic publish results
- prefer extending existing place payloads over inventing parallel read paths
- discovery/filter features should consume derived profile fields rather than changing truth semantics
- future trust or moderation work should build on these read models rather than bypass them

# ADR-0001: Canonical v2 truth boundaries

- Status: Accepted
- Date: 2026-03-15

## Context

Earlier repository history mixed durable submission traces, pending Redis state, and legacy compatibility paths with user-visible confirmation behavior. That made it too easy for clients and maintainers to confuse “publish happened” or “confirm was accepted” with canonical confirmation.

The current v2 runtime already implements a stricter boundary:

- exact `event_id` ledger presence defines canonical confirmation
- derived and ephemeral state support reads and diagnostics, but do not override canonical truth

## Decision

SatsRover uses these boundaries:

- `signals_v2_events` is the canonical immutable confirmation/history surface for check-ins
- `signals_v2_state` is a rebuildable derived/materialized projection
- `checkin_submissions` is durable trace only
- Redis is ephemeral handoff/cache/polling only
- optimistic UI is presentation only

## Consequences

- client publish success must not be treated as canonical confirmation
- backend confirm acceptance is a durable handoff, not canonical truth by itself
- contributor work must preserve exact `event_id` correlation across publish, confirm, and ledger observation
- operator/debug tooling may reference trace and Redis state, but must not redefine truth

# Architecture Decision Records

SatsRover uses lightweight ADRs to record decisions that materially shape the system.

## How ADRs Work Here

- one ADR per meaningful architecture decision
- ADRs are append-only once accepted
- if a decision changes, add a new ADR that supersedes the old one
- `docs/architecture.md` describes current truth
- ADRs explain why the system is shaped that way

## Status Values

- `Accepted`: implemented and current
- `Superseded`: replaced by a later ADR
- `Proposed`: not yet adopted

## Current ADRs

- [ADR-0001 Canonical v2 truth boundaries](ADR-0001-canonical-v2-truth-boundaries.md)
- [ADR-0002 Backend read models drive merchant and discovery UI](ADR-0002-backend-read-models-drive-merchant-and-discovery-ui.md)

## When To Add An ADR

Add an ADR when you change:

- canonical truth boundaries
- read/write architecture
- protocol meaning
- long-lived backend/frontend responsibility splits

Do not add ADRs for routine bugfixes, narrow UI polish, or implementation details that do not change architectural shape.

# SatsRover Web

This package contains the Next.js client for map discovery, MerchantDrawer, browser publish flows, and local-only discovery filters.

## Current Responsibilities

- map and merchant discovery UI
- check-in publish UX and canonical confirmation polling
- merchant claim publish UX
- Place Profile v2 presentation
- local filtering over the current merchant payload

## Important Boundaries

- relay publish success is not canonical confirmation
- claim UI must come from canonical backend/indexer read state
- local filter state must not mutate canonical merchant data

For architecture and contributor context, start at the repo root docs:

- [`README.md`](../../README.md)
- [`docs/architecture.md`](../../docs/architecture.md)
- [`docs/contributor-guide.md`](../../docs/contributor-guide.md)

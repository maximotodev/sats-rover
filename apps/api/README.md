# SatsRover API

This package contains the FastAPI service that serves canonical and derived read surfaces plus check-in confirm/status flows.

## Current Responsibilities

- `/v1/places` and related place/feed reads
- check-in confirm and status routes
- Redis-backed cache and polling integration
- schemas and services for claim and place-profile read models

## Important Boundaries

- `signals_v2_events` is canonical check-in confirmation/history
- `checkin_submissions` is durable trace only
- Redis is ephemeral only

For architecture and contributor context, start at the repo root docs:

- [`README.md`](../../README.md)
- [`docs/architecture.md`](../../docs/architecture.md)
- [`docs/local-dev.md`](../../docs/local-dev.md)

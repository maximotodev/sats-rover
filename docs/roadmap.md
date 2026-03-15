# SatsRover Roadmap

This roadmap tracks current implementation status and the most likely next workstreams. It is not a vision document.

## Completed

- Core v2 truth migration for check-ins
  - `signals_v2_events` is canonical immutable confirmation/history
  - `signals_v2_state` is derived/materialized state
  - `checkin_submissions` is durable trace only
  - Redis is ephemeral handoff/polling only
- MerchantDrawer stabilization around canonical confirmation semantics
- Merchant claim Phase 1
  - claim publish path
  - indexer claim ingest
  - canonical claim read-state rendering
- Place Profile v2 read model
  - claim summary
  - freshness/activity
  - compact confidence/trust signals
- Local discovery filters
  - Claimed
  - Recently active
  - Higher confidence
  - Repeated success

## Active

- Documentation and repository hygiene
  - align repo docs with current v2 implementation
  - classify stale v1/runtime-adjacent residue
  - establish ADR, roadmap, and contributor guidance workflow

## Next Recommended

- Claim policy follow-up
  - decide whether multiple claims per place stay informational-only or need explicit policy-layer adjudication
- Protocol/read-model cleanup
  - decide the future of `packages/protocol` and other legacy protocol residue
- Discovery quality follow-up
  - evaluate whether current local-only filters should later gain backend support without changing truth semantics
- Observability hardening
  - keep improving operator/debug surfaces around canonical ledger, derived state, and compatibility residue

## Deferred

- ownership verification
- moderation and disputes
- claim revocation/transfer workflows
- trust-score redesign
- server-side discovery/search redesign
- social/chat/events features
- wallet/payment-product expansion beyond current check-in support
- distributed place profile override ingest

## Open Questions

- When should claim publication move from informational-only to policy-backed ownership semantics, if ever?
- Should `satsrover-profile` remain documented-but-unused, or become a live ingest/read feature later?
- When is it worth removing legacy `signals` compatibility paths versus keeping them for operational safety?

## Update Rules

- Change architecture truth: update `docs/architecture.md` and the relevant ADR.
- Change protocol meaning: update `docs/protocol/satsrover-v2.json` and link the relevant ADR.
- Change priorities or phase status: update this file.
- Change contributor entrypoints or repo navigation: update `README.md`.

# 0. PLAN SNAPSHOT

| Item | Value |
| --- | --- |
| Top P0 priorities | 1. Establish a single normative protocol authority and quarantine stale runtime protocol residue. 2. Move canonical schema ownership to Alembic only. 3. Inventory and quarantine dangerous compatibility residue (`signals`, `merchant_claims`, legacy place-id normalization, mixed-mode fallbacks). 4. Classify important routes by response class and document current contract drift. |
| Top P1 priorities | 1. Document reducer semantics for `signals_v2_events`, `signals_v2_state`, and `app_state_claims`. 2. Map every important route to Observation / Derived / Operator-local. 3. Define provenance and completeness vocabulary for derived responses. 4. Document relay observation semantics and backend/operator-local boundaries. |
| Highest-risk ambiguity | Runtime code in [apps/indexer/src/index.ts](/home/maximoto/dev/sats-rover/apps/indexer/src/index.ts) both defines protocol-adjacent validation rules and silently creates canonical tables that Alembic does not own. |
| Files most likely to change in later implementation | [apps/indexer/src/index.ts](/home/maximoto/dev/sats-rover/apps/indexer/src/index.ts), [apps/indexer/src/importer.ts](/home/maximoto/dev/sats-rover/apps/indexer/src/importer.ts), [apps/api/alembic/versions/2ef152b01cec_create_signals_table.py](/home/maximoto/dev/sats-rover/apps/api/alembic/versions/2ef152b01cec_create_signals_table.py), [apps/api/alembic/versions/c3e9b2f4a1d0_add_ingestion_state_table.py](/home/maximoto/dev/sats-rover/apps/api/alembic/versions/c3e9b2f4a1d0_add_ingestion_state_table.py), [apps/api/alembic/versions/f1a7c9d2e4b6_ingestion_state_legacy_value_compat.py](/home/maximoto/dev/sats-rover/apps/api/alembic/versions/f1a7c9d2e4b6_ingestion_state_legacy_value_compat.py), [apps/api/app/api/v1/checkins.py](/home/maximoto/dev/sats-rover/apps/api/app/api/v1/checkins.py), [apps/api/app/services/signals_service.py](/home/maximoto/dev/sats-rover/apps/api/app/services/signals_service.py), [packages/protocol/src/index.ts](/home/maximoto/dev/sats-rover/packages/protocol/src/index.ts) |
| What this pass does not change | No runtime behavior, no broad refactors, no ADR file creation, no README / architecture / roadmap rewrite, no protocol expansion, no schema mutation, no frontend redesign |

# 1. EXECUTIVE SUMMARY

SatsRover already documents a v2 architecture in which canonical Nostr inputs feed deterministic reducers and backend read models, but the repo still contains material drift between docs, runtime code, migrations, and route contracts. The most important drift is not cosmetic: protocol authority is split between [docs/protocol/satsrover-v2.json](/home/maximoto/dev/sats-rover/docs/protocol/satsrover-v2.json), indexer validation code in [apps/indexer/src/index.ts](/home/maximoto/dev/sats-rover/apps/indexer/src/index.ts), and stale exported constants in [packages/protocol/src/index.ts](/home/maximoto/dev/sats-rover/packages/protocol/src/index.ts); canonical schema ownership is also split between Alembic and runtime `CREATE TABLE IF NOT EXISTS` bootstrapping in the indexer.

P0 matters now because the repo can currently preserve product direction in docs while still encoding hidden meaning in runtime fallbacks and bootstrap behavior. That is unacceptable for a Bitcoin-Nostr-native app where canonical inputs, deterministic reducers, and replayability must remain legible. P1 matters next because the backend currently returns useful data, but it does not yet expose explicit provenance/completeness semantics, and several important routes mix canonical checks with operator-local workflow state in ways that will become harder to unwind later.

This plan will produce a branchable path to: make protocol authority explicit, move canonical schema ownership under migrations, inventory and quarantine dangerous compatibility residue, formalize reducer semantics, classify important routes by response class, and define provenance/completeness semantics for derived reads. It intentionally defers bonding/economic anti-spam mechanics, claim policy maturity, deep client verification, and broad UI redesign.

# 2. FACTS OBSERVED IN THE REPO

## Confirmed repo facts

- [confirmed] [docs/protocol/satsrover-v2.json](/home/maximoto/dev/sats-rover/docs/protocol/satsrover-v2.json) documents v2 protocol semantics with `30331` for signals and `30078` for app-state claims/profiles, `place` and `status` tags, and reducer outputs into `signals_v2_events`, `signals_v2_state`, and `app_state_claims`.
- [confirmed] [packages/protocol/src/index.ts](/home/maximoto/dev/sats-rover/packages/protocol/src/index.ts) exports `VERSION: "1"`, `CLAIM: 30333`, `REVOKE: 30334`, and tag names `p` / `s`; this does not match the v2 protocol document.
- [confirmed] [README.md](/home/maximoto/dev/sats-rover/README.md), [docs/architecture.md](/home/maximoto/dev/sats-rover/docs/architecture.md), [docs/roadmap.md](/home/maximoto/dev/sats-rover/docs/roadmap.md), and [docs/contributor-guide.md](/home/maximoto/dev/sats-rover/docs/contributor-guide.md) all describe `signals_v2_events` as canonical check-in confirmation/history, `signals_v2_state` as derived state, and `checkin_submissions` / Redis as non-canonical workflow state.
- [confirmed] [apps/indexer/src/index.ts](/home/maximoto/dev/sats-rover/apps/indexer/src/index.ts) validates and reduces live relay events, subscribes to `30331` with `#t=satsrover`, `#v=2`, and to `30078` with `#t=satsrover-claim`, `#v=2`, then writes to `signals_v2_events`, `signals_v2_state`, `app_state_claims`, and `ingestion_state`.
- [confirmed] [apps/indexer/src/index.ts](/home/maximoto/dev/sats-rover/apps/indexer/src/index.ts) contains `ensureIngestionStateTable`, `ensureClaimsTable`, and `ensureSignalsV2Tables`, each issuing `CREATE TABLE IF NOT EXISTS` for schema that the docs treat as runtime load-bearing.
- [confirmed] Alembic revisions in [apps/api/alembic/versions](/home/maximoto/dev/sats-rover/apps/api/alembic/versions) create `places`, `signals`, `merchant_claims`, `checkin_submissions`, and `ingestion_state`, and add indexes / columns, but there is no Alembic revision that creates `signals_v2_events`, `signals_v2_state`, or `app_state_claims`.
- [confirmed] [apps/api/alembic/versions/2ef152b01cec_create_signals_table.py](/home/maximoto/dev/sats-rover/apps/api/alembic/versions/2ef152b01cec_create_signals_table.py) creates legacy `signals` and `merchant_claims`, while current docs and current API/indexer code use `signals_v2_events`, `signals_v2_state`, and `app_state_claims`.
- [confirmed] [apps/api/alembic/versions/c3e9b2f4a1d0_add_ingestion_state_table.py](/home/maximoto/dev/sats-rover/apps/api/alembic/versions/c3e9b2f4a1d0_add_ingestion_state_table.py) and [apps/api/alembic/versions/f1a7c9d2e4b6_ingestion_state_legacy_value_compat.py](/home/maximoto/dev/sats-rover/apps/api/alembic/versions/f1a7c9d2e4b6_ingestion_state_legacy_value_compat.py) mutate `ingestion_state` toward `value_json` and `value` text columns, while [apps/indexer/src/index.ts](/home/maximoto/dev/sats-rover/apps/indexer/src/index.ts) bootstraps `ingestion_state` with `value BIGINT NOT NULL`.
- [confirmed] [apps/api/app/services/signals_service.py](/home/maximoto/dev/sats-rover/apps/api/app/services/signals_service.py) still contains `_execute_v2_or_v1` compatibility logic and falls back from `signals_v2_events` / `signals_v2_state` to legacy `signals` when relations are missing.
- [confirmed] [apps/api/app/main.py](/home/maximoto/dev/sats-rover/apps/api/app/main.py) debug routes also fall back from `signals_v2_events` to `signals` in `/debug/counts`, and expose mixed canonical / legacy / Redis diagnostics in `/debug/checkins/{event_id}`.
- [confirmed] [apps/indexer/src/importer.ts](/home/maximoto/dev/sats-rover/apps/indexer/src/importer.ts) still writes to legacy `signals`, normalizes legacy digits-only `place` tags to canonical ids, and updates `checkin_submissions` as confirmed only after observing the v2 ledger.
- [confirmed] [apps/indexer/src/signals_v2_state.ts](/home/maximoto/dev/sats-rover/apps/indexer/src/signals_v2_state.ts) defines deterministic reducer semantics for `signals_v2_state`: key `(pubkey, place_id, day_utc)`, keep newest by `created_at`, tie-break by `event_id`.
- [confirmed] [apps/api/app/services/places_service.py](/home/maximoto/dev/sats-rover/apps/api/app/services/places_service.py) derives place-profile fields directly from `signals_v2_state` and `app_state_claims`, but its response schema [apps/api/app/schemas/place.py](/home/maximoto/dev/sats-rover/apps/api/app/schemas/place.py) contains no explicit provenance/completeness fields.
- [confirmed] [apps/api/app/services/signals_service.py](/home/maximoto/dev/sats-rover/apps/api/app/services/signals_service.py) uses canonical ledger checks for confirmation, but also returns pending/duplicate/not-found workflow semantics derived from `checkin_submissions` and Redis.
- [confirmed] [apps/api/app/api/v1/checkins.py](/home/maximoto/dev/sats-rover/apps/api/app/api/v1/checkins.py) exposes `/v1/checkins/intent`, `/v1/checkins/confirm`, `/v1/checkins/status`, and `/v1/checkins/{checkin_id}`.
- [confirmed] [apps/api/app/api/v1/checkins.py](/home/maximoto/dev/sats-rover/apps/api/app/api/v1/checkins.py) route handlers for status accept only `checkin_id`, but [apps/web/src/app/api/checkins/status/route.ts](/home/maximoto/dev/sats-rover/apps/web/src/app/api/checkins/status/route.ts) forwards `pubkey` and `place_id` query parameters to the API anyway.
- [confirmed] [apps/web/src/app/api/places/[placeId]/feed/route.ts](/home/maximoto/dev/sats-rover/apps/web/src/app/api/places/[placeId]/feed/route.ts) converts upstream feed errors into HTTP 200 with `{ error: ... }`, which removes any upstream distinction between not-observed, unavailable, and partially observed.
- [confirmed] [apps/web/src/app/api/feed/global/route.ts](/home/maximoto/dev/sats-rover/apps/web/src/app/api/feed/global/route.ts) composes a global feed by reading `/v1/places` and then many `/v1/places/{place_id}/feed` calls, but its output also lacks explicit provenance/completeness semantics.
- [confirmed] [apps/web/src/components/map/MerchantDrawer.tsx](/home/maximoto/dev/sats-rover/apps/web/src/components/map/MerchantDrawer.tsx) treats backend `ok` as confirmed state and renders claim/profile summaries from backend-derived payloads rather than from local publish success.
- [confirmed] Existing ADRs [docs/adr/ADR-0001-canonical-v2-truth-boundaries.md](/home/maximoto/dev/sats-rover/docs/adr/ADR-0001-canonical-v2-truth-boundaries.md) and [docs/adr/ADR-0002-backend-read-models-drive-merchant-and-discovery-ui.md](/home/maximoto/dev/sats-rover/docs/adr/ADR-0002-backend-read-models-drive-merchant-and-discovery-ui.md) describe truth boundaries and backend-driven UI, but they do not yet cover schema ownership, protocol authority, response classes, or relay completeness semantics.

## High-confidence inferences

- [inference] The de facto normative protocol source is currently [docs/protocol/satsrover-v2.json](/home/maximoto/dev/sats-rover/docs/protocol/satsrover-v2.json), but runtime validation truth is partially duplicated in [apps/indexer/src/index.ts](/home/maximoto/dev/sats-rover/apps/indexer/src/index.ts) and [apps/indexer/src/live_signal_policy.ts](/home/maximoto/dev/sats-rover/apps/indexer/src/live_signal_policy.ts). This is a stable inference because the docs explicitly mark [packages/protocol/src/index.ts](/home/maximoto/dev/sats-rover/packages/protocol/src/index.ts) as stale and runtime uses hard-coded v2 constants elsewhere.
- [inference] `app_state_claims`, `signals_v2_events`, and `signals_v2_state` are canonical or derived load-bearing schema despite not being migration-owned, because the API and web read paths assume they exist and tests target them directly.
- [inference] The legacy `signals` table remains hot-path compatibility residue rather than dead code, because both API services and [apps/indexer/src/importer.ts](/home/maximoto/dev/sats-rover/apps/indexer/src/importer.ts) still reference it and tests explicitly cover missing-relation fallback behavior.
- [inference] Route semantics are not yet class-disciplined: `/v1/checkins/status` is operator-local workflow state that performs canonical observation internally, while `/v1/places/{place_id}/feed` is a derived route that may silently fall back to legacy reads.

## Recommendations

- [recommendation] Treat [docs/protocol/satsrover-v2.json](/home/maximoto/dev/sats-rover/docs/protocol/satsrover-v2.json) as the single normative protocol authority in P0, then either generate or explicitly derive any runtime constants from that authority in a later branch.
- [recommendation] Move ownership of `signals_v2_events`, `signals_v2_state`, `app_state_claims`, and final `ingestion_state` shape under Alembic in P0, then convert indexer startup from bootstrap creation to startup assertions only.
- [recommendation] Classify and quarantine legacy compatibility residue rather than deleting it blindly: `signals`, `merchant_claims`, [apps/indexer/src/importer.ts](/home/maximoto/dev/sats-rover/apps/indexer/src/importer.ts), and v1 fallback logic all need an explicit disposition.
- [recommendation] In P1, make every important route explicitly one of Observation, Derived, or Operator-local, and add provenance/completeness semantics to derived payloads before expanding product behavior.

# 3. KEY ARCHITECTURAL RISKS

## Confirmed repo facts

| Title | Severity | Exact evidence / path | Why it matters for a Bitcoin-Nostr-native app | Stage |
| --- | --- | --- | --- | --- |
| Protocol authority drift | Critical | [docs/protocol/satsrover-v2.json](/home/maximoto/dev/sats-rover/docs/protocol/satsrover-v2.json), [apps/indexer/src/index.ts](/home/maximoto/dev/sats-rover/apps/indexer/src/index.ts), [packages/protocol/src/index.ts](/home/maximoto/dev/sats-rover/packages/protocol/src/index.ts) | Canonical Nostr inputs must be replayable and portable. Split authorities create hidden protocol truth and raise replay / compatibility risk. | P0 |
| Schema ownership split between migrations and runtime bootstrapping | Critical | [apps/indexer/src/index.ts](/home/maximoto/dev/sats-rover/apps/indexer/src/index.ts), [apps/api/alembic/versions](/home/maximoto/dev/sats-rover/apps/api/alembic/versions) | Canonical ledger and reducer tables cannot be silently created by application startup if the system is supposed to be legible, reproducible, and migration-owned. | P0 |
| Legacy compatibility residue still in hot paths | High | [apps/api/app/services/signals_service.py](/home/maximoto/dev/sats-rover/apps/api/app/services/signals_service.py), [apps/indexer/src/importer.ts](/home/maximoto/dev/sats-rover/apps/indexer/src/importer.ts), [apps/api/app/main.py](/home/maximoto/dev/sats-rover/apps/api/app/main.py) | Hidden fallback semantics can cause the backend to answer from legacy state without making that distinction explicit to clients or operators. | P0 |
| Route-class ambiguity for workflow and truth surfaces | High | [apps/api/app/api/v1/checkins.py](/home/maximoto/dev/sats-rover/apps/api/app/api/v1/checkins.py), [apps/api/app/services/signals_service.py](/home/maximoto/dev/sats-rover/apps/api/app/services/signals_service.py), [apps/web/src/app/api/checkins/status/route.ts](/home/maximoto/dev/sats-rover/apps/web/src/app/api/checkins/status/route.ts) | Apps that mix canonical observation with operator-local workflow state without explicit classification invite “backend says so” semantics. | P1 |
| Missing provenance/completeness semantics on derived reads | High | [apps/api/app/schemas/place.py](/home/maximoto/dev/sats-rover/apps/api/app/schemas/place.py), [apps/api/app/schemas/signal.py](/home/maximoto/dev/sats-rover/apps/api/app/schemas/signal.py), [apps/web/src/app/api/places/[placeId]/feed/route.ts](/home/maximoto/dev/sats-rover/apps/web/src/app/api/places/[placeId]/feed/route.ts) | Absence is not self-explanatory in relay/indexer systems; clients need to distinguish not-yet-observed from unavailable, fallback-derived, or superseded. | P1 |
| Claim state naming drift (`merchant_claims` vs `app_state_claims`) | Medium | [apps/api/alembic/versions/2ef152b01cec_create_signals_table.py](/home/maximoto/dev/sats-rover/apps/api/alembic/versions/2ef152b01cec_create_signals_table.py), [apps/indexer/src/index.ts](/home/maximoto/dev/sats-rover/apps/indexer/src/index.ts), [apps/api/app/services/places_service.py](/home/maximoto/dev/sats-rover/apps/api/app/services/places_service.py) | Naming drift makes claim semantics harder to audit and increases migration risk for ownership and replay. | P0 |
| Ingestion-state column drift | Medium | [apps/api/alembic/versions/c3e9b2f4a1d0_add_ingestion_state_table.py](/home/maximoto/dev/sats-rover/apps/api/alembic/versions/c3e9b2f4a1d0_add_ingestion_state_table.py), [apps/api/alembic/versions/f1a7c9d2e4b6_ingestion_state_legacy_value_compat.py](/home/maximoto/dev/sats-rover/apps/api/alembic/versions/f1a7c9d2e4b6_ingestion_state_legacy_value_compat.py), [apps/indexer/src/index.ts](/home/maximoto/dev/sats-rover/apps/indexer/src/index.ts) | Watermarks drive relay replay windows. Ambiguous shape here undermines replay completeness and ops confidence. | P0 |

## High-confidence inferences

- [inference] If `signals_v2_events` or `signals_v2_state` are absent in production, current code may continue serving partially functional responses via legacy fallbacks without making that downgrade explicit to the UI.
- [inference] If protocol constants are cleaned up without first inventorying every runtime use site, implementation branches will overlap heavily across the indexer, API, and web proxy layers.

## Recommendations

- [recommendation] Land P0 as ambiguity removal only: protocol authority, schema ownership, and residue classification before behavioral cleanup.
- [recommendation] Land P1 as semantic explicitness: reducer docs, route classes, and provenance/completeness vocabulary before any larger product or policy work.

# 4. ADR SET

## Confirmed repo facts

- [confirmed] Existing ADRs cover canonical v2 truth boundaries and backend read models, but not the additional decisions needed for P0/P1.

## High-confidence inferences

- [inference] New ADRs are needed before implementation branches because otherwise runtime cleanup work will re-litigate core boundaries file-by-file.

## Recommendations

| ADR | Purpose | Decision | Consequences | Files / modules likely affected | Implementation stage |
| --- | --- | --- | --- | --- | --- |
| ADR-001: Canonical inputs and reducer-defined state | Freeze the distinction between canonical Nostr inputs, reducer outputs, and operator-local workflow state | Canonical inputs are valid observed Nostr events; current product state is defined only by explicit reducer semantics; workflow traces never override reducer state | Forces all product truth to be replayable and reducer-defined; blocks backend mystique | [docs/protocol/satsrover-v2.json](/home/maximoto/dev/sats-rover/docs/protocol/satsrover-v2.json), [apps/indexer/src/index.ts](/home/maximoto/dev/sats-rover/apps/indexer/src/index.ts), [apps/indexer/src/signals_v2_state.ts](/home/maximoto/dev/sats-rover/apps/indexer/src/signals_v2_state.ts), [apps/api/app/services/signals_service.py](/home/maximoto/dev/sats-rover/apps/api/app/services/signals_service.py) | P0 |
| ADR-002: Single normative protocol authority | Eliminate split protocol truth | The normative protocol authority is one repo artifact; runtime constants and validators must be traceable to it and stale exports must be quarantined or generated | Removes hidden protocol drift and reduces replay / portability risk | [docs/protocol/satsrover-v2.json](/home/maximoto/dev/sats-rover/docs/protocol/satsrover-v2.json), [packages/protocol/src/index.ts](/home/maximoto/dev/sats-rover/packages/protocol/src/index.ts), [apps/indexer/src/index.ts](/home/maximoto/dev/sats-rover/apps/indexer/src/index.ts), [apps/indexer/src/live_signal_policy.ts](/home/maximoto/dev/sats-rover/apps/indexer/src/live_signal_policy.ts) | P0 |
| ADR-003: Schema ownership by migrations | End runtime schema bootstrapping of canonical and derived tables | Alembic owns canonical, derived, and operator-local durable schema; runtime startup may assert presence and version but not create load-bearing tables | Makes schema changes reviewable, reproducible, and replayable | [apps/api/alembic/versions](/home/maximoto/dev/sats-rover/apps/api/alembic/versions), [apps/indexer/src/index.ts](/home/maximoto/dev/sats-rover/apps/indexer/src/index.ts), [apps/api/app/main.py](/home/maximoto/dev/sats-rover/apps/api/app/main.py) | P0 |
| ADR-004: API response-class discipline | Give every important route one semantics class | Each important route must be exactly Observation, Derived, or Operator-local; mixed routes must be split or explicitly documented and scoped | Makes backend read meaning legible and reduces accidental truth inflation | [apps/api/app/api/v1/checkins.py](/home/maximoto/dev/sats-rover/apps/api/app/api/v1/checkins.py), [apps/api/app/api/v1/places.py](/home/maximoto/dev/sats-rover/apps/api/app/api/v1/places.py), [apps/api/app/api/v1/signals.py](/home/maximoto/dev/sats-rover/apps/api/app/api/v1/signals.py), [apps/web/src/app/api](/home/maximoto/dev/sats-rover/apps/web/src/app/api) | P1 |
| ADR-005: Relay observation and completeness semantics | Make relay/indexer observation state explicit in derived reads | Derived responses must distinguish observed, partially observed, pending, fallback-derived, superseded, invalid, and not-yet-observed where applicable | Prevents clients from treating absence or fallback as self-explanatory truth | [apps/api/app/schemas/place.py](/home/maximoto/dev/sats-rover/apps/api/app/schemas/place.py), [apps/api/app/schemas/signal.py](/home/maximoto/dev/sats-rover/apps/api/app/schemas/signal.py), [apps/api/app/services/signals_service.py](/home/maximoto/dev/sats-rover/apps/api/app/services/signals_service.py), [apps/web/src/app/api/places/[placeId]/feed/route.ts](/home/maximoto/dev/sats-rover/apps/web/src/app/api/places/[placeId]/feed/route.ts), [apps/web/src/app/api/feed/global/route.ts](/home/maximoto/dev/sats-rover/apps/web/src/app/api/feed/global/route.ts) | P1 |

# 5. REPO INVENTORY / CLASSIFICATION MATRIX

## Confirmed repo facts

| Path | Classification | Owner Boundary | Current Role | Risk Level | Verification Status | Evidence / Notes | Recommended Action | Stage | Keep / Move / Quarantine / Delete / Document |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [docs/protocol/satsrover-v2.json](/home/maximoto/dev/sats-rover/docs/protocol/satsrover-v2.json) | normative | protocol | De facto v2 protocol source | High | confirmed | Matches current docs and runtime direction; reducer section names live tables | keep as-is for now | P0 | Document |
| [packages/protocol/src/index.ts](/home/maximoto/dev/sats-rover/packages/protocol/src/index.ts) | stale dangerous residue | protocol | Stale exported protocol constants | Critical | confirmed | Exports v1 values that conflict with v2 docs | quarantine now | P0 | Quarantine |
| [apps/indexer/src/index.ts](/home/maximoto/dev/sats-rover/apps/indexer/src/index.ts) | runtime load-bearing | reducer/indexer | Live relay ingest, validation, claim reduce, canonical ledger writes, schema bootstrap | Critical | confirmed | Also hides protocol and schema ownership drift | keep temporarily but label legacy | P0 | Document |
| [apps/indexer/src/signals_v2_state.ts](/home/maximoto/dev/sats-rover/apps/indexer/src/signals_v2_state.ts) | runtime load-bearing | reducer/indexer | Deterministic reducer/upsert semantics for derived state | Medium | confirmed | Clear reducer core; should remain authoritative for state rule until formalized | keep as-is for now | P1 | Keep |
| [apps/indexer/src/live_signal_policy.ts](/home/maximoto/dev/sats-rover/apps/indexer/src/live_signal_policy.ts) | runtime load-bearing | reducer/indexer | Subscription filter and compatibility gate | High | confirmed | Runtime protocol rule surface not directly linked to normative doc | keep temporarily but label legacy | P0 | Document |
| [apps/indexer/src/importer.ts](/home/maximoto/dev/sats-rover/apps/indexer/src/importer.ts) | runtime-adjacent residue | reducer/indexer | Legacy importer writing to `signals` and normalizing old place ids | High | confirmed | Hot-path compatibility residue; not canonical v2 reducer | quarantine now | P0 | Quarantine |
| [apps/api/app/services/signals_service.py](/home/maximoto/dev/sats-rover/apps/api/app/services/signals_service.py) | runtime load-bearing | API | Feed reads, confirm/status workflow, v2-to-v1 fallbacks | Critical | confirmed | Mixes canonical checks with operator-local state and compatibility paths | keep temporarily but label legacy | P0 | Document |
| [apps/api/app/services/places_service.py](/home/maximoto/dev/sats-rover/apps/api/app/services/places_service.py) | runtime load-bearing | API | Derived place payload from `places`, `app_state_claims`, `signals_v2_state` | High | confirmed | Derived output lacks provenance/completeness semantics | keep as-is for now | P1 | Document |
| [apps/api/app/api/v1/checkins.py](/home/maximoto/dev/sats-rover/apps/api/app/api/v1/checkins.py) | runtime load-bearing | API | Operator workflow routes with auth proof enforcement | High | confirmed | Current route signatures do not match all forwarded web params | keep temporarily but label legacy | P0 | Document |
| [apps/api/app/api/v1/places.py](/home/maximoto/dev/sats-rover/apps/api/app/api/v1/places.py) | runtime load-bearing | API | Derived place read route | Medium | confirmed | Clean route shell; semantics need explicit response class and provenance docs | keep as-is for now | P1 | Document |
| [apps/api/app/api/v1/signals.py](/home/maximoto/dev/sats-rover/apps/api/app/api/v1/signals.py) | runtime load-bearing | API | Derived place-feed read route | High | confirmed | Service can silently fall back to `signals` | keep temporarily but label legacy | P0 | Document |
| [apps/api/alembic/versions/2ef152b01cec_create_signals_table.py](/home/maximoto/dev/sats-rover/apps/api/alembic/versions/2ef152b01cec_create_signals_table.py) | stale dangerous residue | migrations | Historical migration for `signals` and `merchant_claims` | High | confirmed | Current docs/runtime use different tables; migration history is still real and cannot be rewritten casually | keep as-is for now | P0 | Document |
| [apps/api/alembic/versions/c3e9b2f4a1d0_add_ingestion_state_table.py](/home/maximoto/dev/sats-rover/apps/api/alembic/versions/c3e9b2f4a1d0_add_ingestion_state_table.py) | runtime-adjacent residue | migrations | Partial `ingestion_state` shape | High | confirmed | Conflicts with indexer bootstrap shape | keep as-is for now | P0 | Document |
| [apps/api/alembic/versions/f1a7c9d2e4b6_ingestion_state_legacy_value_compat.py](/home/maximoto/dev/sats-rover/apps/api/alembic/versions/f1a7c9d2e4b6_ingestion_state_legacy_value_compat.py) | runtime-adjacent residue | migrations | Legacy `value` compatibility for `ingestion_state` | High | confirmed | Shape still not aligned with indexer runtime assumption | keep as-is for now | P0 | Document |
| [apps/web/src/app/api/merchants/route.ts](/home/maximoto/dev/sats-rover/apps/web/src/app/api/merchants/route.ts) | runtime load-bearing | web client | Derived route proxy/sanitizer for map payload | Medium | confirmed | Sanitizes derived payload but does not add provenance semantics | keep as-is for now | P1 | Document |
| [apps/web/src/app/api/checkins/status/route.ts](/home/maximoto/dev/sats-rover/apps/web/src/app/api/checkins/status/route.ts) | runtime load-bearing | web client | Operator-local proxy for workflow polling | High | confirmed | Forwards params the API route does not declare and normalizes many upstream failures to `pending` | keep temporarily but label legacy | P0 | Document |
| [apps/web/src/app/api/places/[placeId]/feed/route.ts](/home/maximoto/dev/sats-rover/apps/web/src/app/api/places/[placeId]/feed/route.ts) | runtime-adjacent residue | web client | Feed proxy | High | confirmed | Converts upstream error classes to HTTP 200; provenance loss | keep temporarily but label legacy | P1 | Document |
| [apps/web/src/app/api/feed/global/route.ts](/home/maximoto/dev/sats-rover/apps/web/src/app/api/feed/global/route.ts) | runtime load-bearing | web client | Derived global feed aggregator | Medium | confirmed | Useful but semantically opaque without provenance/completeness fields | keep as-is for now | P1 | Document |
| [docs/architecture.md](/home/maximoto/dev/sats-rover/docs/architecture.md) | normative | docs | Current architecture reference | Medium | confirmed | Generally aligned with intended direction; not fully aligned with schema ownership reality | keep as-is for now | P0 | Document |
| [docs/adr/ADR-0001-canonical-v2-truth-boundaries.md](/home/maximoto/dev/sats-rover/docs/adr/ADR-0001-canonical-v2-truth-boundaries.md) | keep-as-is-for-now | docs | Existing truth-boundary ADR | Low | confirmed | Useful baseline but incomplete for current cleanup | keep as-is for now | P0 | Keep |

## High-confidence inferences

- [inference] Generated/build artifacts under `apps/web/.next`, `apps/indexer/dist`, `apps/indexer/node_modules`, and `apps/api/.venv` should not influence architectural decisions and should remain out of execution scope unless later cleanup is explicitly approved.

## Recommendations

- [recommendation] Use this matrix as the quarantine/deletion gate. Nothing marked `runtime load-bearing` should be removed in P0/P1; only isolated after replacement or assertion coverage exists.

# 6. IMPORTANT ROUTE INVENTORY

## Confirmed repo facts

| Route path | File path | Current purpose | Proposed class | Rationale | Current ambiguity or mismatch | Provenance / completeness semantics needed |
| --- | --- | --- | --- | --- | --- | --- |
| `/v1/places` | [apps/api/app/api/v1/places.py](/home/maximoto/dev/sats-rover/apps/api/app/api/v1/places.py) | Derived place/discovery payload | Derived | Returns reducer/read-model output, not raw canonical events | No provenance fields indicating freshness/completeness/fallback mode | Yes |
| `/v1/places/{place_id}/feed` | [apps/api/app/api/v1/signals.py](/home/maximoto/dev/sats-rover/apps/api/app/api/v1/signals.py) | Per-place signal feed | Derived | Returns feed derived from state projection or legacy fallback | Service silently falls back to `signals` via [apps/api/app/services/signals_service.py](/home/maximoto/dev/sats-rover/apps/api/app/services/signals_service.py) | Yes |
| `/v1/checkins/intent` | [apps/api/app/api/v1/checkins.py](/home/maximoto/dev/sats-rover/apps/api/app/api/v1/checkins.py) | Creates short-lived check-in intent token | Operator-local | Workflow handoff only; not canonical truth | None significant; semantics are operator-local already | No |
| `/v1/checkins/confirm` | [apps/api/app/api/v1/checkins.py](/home/maximoto/dev/sats-rover/apps/api/app/api/v1/checkins.py) | Persists durable trace and returns pending/confirmed/duplicate workflow status | Operator-local | Confirm is a handoff into canonical observation, not a canonical truth route itself | Internally mutates durable trace and may return `confirmed` if ledger already observed | Yes, but only to clarify workflow-to-canonical transition |
| `/v1/checkins/status` | [apps/api/app/api/v1/checkins.py](/home/maximoto/dev/sats-rover/apps/api/app/api/v1/checkins.py) | Polls workflow/canonical confirmation result | Operator-local | This is a workflow/status route even though it reads canonical ledger | Route does not declare `pubkey` / `place_id`, but web proxy forwards them; service supports those arguments | Yes |
| `/v1/checkins/{checkin_id}` | [apps/api/app/api/v1/checkins.py](/home/maximoto/dev/sats-rover/apps/api/app/api/v1/checkins.py) | Alternate status route | Operator-local | Same semantics as query route | Same service ambiguity as `/status` | Yes |
| `/debug/checkins/{event_id}` | [apps/api/app/main.py](/home/maximoto/dev/sats-rover/apps/api/app/main.py) | Diagnostic introspection across submission, ledger, state, Redis, and legacy rows | Operator-local | Explicitly diagnostic/operator-facing | None; should stay non-product | No |
| `/debug/signals` | [apps/api/app/main.py](/home/maximoto/dev/sats-rover/apps/api/app/main.py) | Diagnostic ledger/state freshness | Operator-local | Operational status only | None; should stay non-product | No |
| `/debug/counts` | [apps/api/app/main.py](/home/maximoto/dev/sats-rover/apps/api/app/main.py) | Debug counts and places sync metadata | Operator-local | Operator/debug surface | Silently falls back to `signals` | No |
| `/api/merchants` | [apps/web/src/app/api/merchants/route.ts](/home/maximoto/dev/sats-rover/apps/web/src/app/api/merchants/route.ts) | Browser-safe proxy for `/v1/places` | Derived | Preserves derived semantics from backend | Does not surface upstream provenance/completeness state | Yes |
| `/api/checkins/intent` | [apps/web/src/app/api/checkins/intent/route.ts](/home/maximoto/dev/sats-rover/apps/web/src/app/api/checkins/intent/route.ts) | Browser proxy for workflow intent | Operator-local | Pure workflow proxy | None material | No |
| `/api/checkins/confirm` | [apps/web/src/app/api/checkins/confirm/route.ts](/home/maximoto/dev/sats-rover/apps/web/src/app/api/checkins/confirm/route.ts) | Browser proxy for workflow confirm | Operator-local | Pure workflow proxy | None material beyond inherited API semantics | No |
| `/api/checkins/status` | [apps/web/src/app/api/checkins/status/route.ts](/home/maximoto/dev/sats-rover/apps/web/src/app/api/checkins/status/route.ts) | Browser polling proxy | Operator-local | Workflow polling proxy | Collapses some upstream failures to `pending`; forwards ignored params | Yes |
| `/api/places/[placeId]/feed` | [apps/web/src/app/api/places/[placeId]/feed/route.ts](/home/maximoto/dev/sats-rover/apps/web/src/app/api/places/[placeId]/feed/route.ts) | Browser proxy for place feed | Derived | Derived route proxy | Converts upstream non-200 to HTTP 200 error payload | Yes |
| `/api/feed/global` | [apps/web/src/app/api/feed/global/route.ts](/home/maximoto/dev/sats-rover/apps/web/src/app/api/feed/global/route.ts) | Aggregated derived feed | Derived | Built from derived route composition | No explicit completeness semantics for partial place-feed failures/timeouts | Yes |

## High-confidence inferences

- [inference] The most valuable route split is conceptual, not necessarily immediate path renaming: workflow routes can remain under `/checkins` if their class is documented and their payload semantics stop implying canonical observation without provenance.

## Recommendations

- [recommendation] P1 should produce a route-class contract doc and annotate each important route with canonical-input, reducer-output, and operator-local boundaries.

# 7. DO NOT TOUCH YET

## Confirmed repo facts

| Exact path | Why it should not be touched yet | Prerequisite first |
| --- | --- | --- |
| [apps/indexer/src/index.ts](/home/maximoto/dev/sats-rover/apps/indexer/src/index.ts) | Extremely load-bearing: relay ingest, validation, schema bootstrap, metrics, and reducers are all co-located | Finish protocol authority inventory and migration ownership plan first |
| [apps/web/src/components/map/MerchantDrawer.tsx](/home/maximoto/dev/sats-rover/apps/web/src/components/map/MerchantDrawer.tsx) | Large UI orchestrator that already assumes current workflow semantics; cleanup overreach here would blur planning with runtime changes | Finalize route classes and status/provenance vocabulary first |
| [apps/api/tests/test_places_and_signals.py](/home/maximoto/dev/sats-rover/apps/api/tests/test_places_and_signals.py) | Broad regression net across current mixed-mode behavior; editing it early would hide current drift instead of documenting it | Complete residue inventory and choose compatibility deprecation sequence first |
| [apps/indexer/src/importer.ts](/home/maximoto/dev/sats-rover/apps/indexer/src/importer.ts) | Legacy compatibility path that looks deletable but still encodes active fallback behavior | Decide quarantine vs retained compatibility window first |
| [apps/api/alembic/versions/2ef152b01cec_create_signals_table.py](/home/maximoto/dev/sats-rover/apps/api/alembic/versions/2ef152b01cec_create_signals_table.py) | Historical migration file; rewriting history is riskier than documenting ownership drift | Add forward migrations and startup assertions first |
| [docs/architecture.md](/home/maximoto/dev/sats-rover/docs/architecture.md) | Broad rewrite pressure is high, but this pass is for execution planning, not system-doc restatement | Land this plan and ADR decisions first |

## High-confidence inferences

- [inference] The repo will tempt opportunistic cleanup of stale tables and runtime fallbacks. Doing that before migration ownership and route semantics are explicit would increase production risk.

## Recommendations

- [recommendation] Limit early implementation branches to isolated protocol authority, migration ownership, route semantics, and residue classification changes. Do not combine UI cleanup with backend semantics cleanup.

# 8. P0 EXECUTION PLAN

## Confirmed repo facts

- [confirmed] P0 scope in this repo is ambiguity removal and deterministic ownership only.

## High-confidence inferences

- [inference] P0 can land with little or no externally visible behavior change if it focuses on documentation, migrations, startup assertions, and legacy classification rather than immediate deletion.

## Recommendations

### Task P0-1: Identify and lock normative protocol authority

- Task name: Identify and lock normative protocol authority
- Owner boundary: protocol
- Exact files/modules: [docs/protocol/satsrover-v2.json](/home/maximoto/dev/sats-rover/docs/protocol/satsrover-v2.json), [packages/protocol/src/index.ts](/home/maximoto/dev/sats-rover/packages/protocol/src/index.ts), [apps/indexer/src/index.ts](/home/maximoto/dev/sats-rover/apps/indexer/src/index.ts), [apps/indexer/src/live_signal_policy.ts](/home/maximoto/dev/sats-rover/apps/indexer/src/live_signal_policy.ts)
- Why now: Current protocol truth is split and already conflicting.
- Why not later: Every later branch will otherwise keep making implicit protocol choices.
- Why this task belongs in P0: It removes architectural ambiguity without requiring product changes.
- What ambiguity or drift it reduces immediately: Conflicting kinds/tags/version constants and unclear normative source.
- Expected code/document moves: Quarantine or relabel [packages/protocol/src/index.ts](/home/maximoto/dev/sats-rover/packages/protocol/src/index.ts); add explicit traceability note from runtime validators to the normative doc in later implementation.
- Runtime impact in this planning pass: none
- Runtime impact in later implementation: yes
- Validation method: repo-wide import/use-site inventory; direct comparison between runtime validators and normative protocol doc.
- Blockers/prerequisites: none
- Rollback risk: low if done as quarantine/documentation before deletion
- Sequencing notes: Must precede residue deletion and protocol-generated constants work.
- Verification status: confirmed

### Task P0-2: Unify schema ownership under migrations

- Task name: Unify schema ownership under migrations
- Owner boundary: migrations
- Exact files/modules: [apps/indexer/src/index.ts](/home/maximoto/dev/sats-rover/apps/indexer/src/index.ts), [apps/api/alembic/versions](/home/maximoto/dev/sats-rover/apps/api/alembic/versions), [apps/api/alembic/env.py](/home/maximoto/dev/sats-rover/apps/api/alembic/env.py)
- Why now: Canonical and derived tables are currently bootstrapped at runtime outside Alembic.
- Why not later: Schema ownership drift compounds and makes production state harder to audit.
- Why this task belongs in P0: It is a pure ownership/legibility issue.
- What ambiguity or drift it reduces immediately: Who owns `signals_v2_events`, `signals_v2_state`, `app_state_claims`, and final `ingestion_state` shape.
- Expected code/document moves: Add forward Alembic revisions for missing load-bearing tables; replace indexer `CREATE TABLE IF NOT EXISTS` with startup assertions in later implementation.
- Runtime impact in this planning pass: none
- Runtime impact in later implementation: yes
- Validation method: `alembic upgrade head` on empty DB must produce the full required schema; indexer startup must fail loudly on missing schema instead of creating it.
- Blockers/prerequisites: P0-1 protocol table naming lock
- Rollback risk: medium because DB startup assumptions change
- Sequencing notes: Isolate in its own branch; do not bundle with route behavior changes.
- Verification status: confirmed

### Task P0-3: Classify and quarantine dangerous compatibility residue

- Task name: Classify and quarantine dangerous compatibility residue
- Owner boundary: reducer/indexer
- Exact files/modules: [apps/indexer/src/importer.ts](/home/maximoto/dev/sats-rover/apps/indexer/src/importer.ts), [apps/api/app/services/signals_service.py](/home/maximoto/dev/sats-rover/apps/api/app/services/signals_service.py), [apps/api/app/main.py](/home/maximoto/dev/sats-rover/apps/api/app/main.py), [apps/api/alembic/versions/2ef152b01cec_create_signals_table.py](/home/maximoto/dev/sats-rover/apps/api/alembic/versions/2ef152b01cec_create_signals_table.py)
- Why now: The repo still carries live residue that can redefine truth or hide degraded mode.
- Why not later: Provenance/completeness work in P1 depends on explicit fallback inventory.
- Why this task belongs in P0: It removes semantic ambiguity before API redesign.
- What ambiguity or drift it reduces immediately: Whether legacy `signals` and legacy place-id normalization are active, required, or removable.
- Expected code/document moves: Add legacy classification notes; isolate importer/fallback paths for later removal; document `merchant_claims` as historical-only if unused.
- Runtime impact in this planning pass: none
- Runtime impact in later implementation: yes
- Validation method: repo inventory, runtime call-graph inventory, and targeted regression tests for fallback entry points.
- Blockers/prerequisites: P0-1, P0-2
- Rollback risk: medium because compatibility removal can strand old data flows
- Sequencing notes: Do not delete residue in the same branch that introduces migration ownership changes.
- Verification status: confirmed

### Task P0-4: Inventory hot-path compatibility logic and route/contract drift

- Task name: Inventory hot-path compatibility logic and route/contract drift
- Owner boundary: API
- Exact files/modules: [apps/api/app/api/v1/checkins.py](/home/maximoto/dev/sats-rover/apps/api/app/api/v1/checkins.py), [apps/api/app/services/signals_service.py](/home/maximoto/dev/sats-rover/apps/api/app/services/signals_service.py), [apps/web/src/app/api/checkins/status/route.ts](/home/maximoto/dev/sats-rover/apps/web/src/app/api/checkins/status/route.ts), [apps/web/src/app/api/places/[placeId]/feed/route.ts](/home/maximoto/dev/sats-rover/apps/web/src/app/api/places/[placeId]/feed/route.ts)
- Why now: Contract drift already exists and will affect any route semantic cleanup.
- Why not later: P1 route classification needs a confirmed baseline.
- Why this task belongs in P0: It is ambiguity removal, not behavior redesign.
- What ambiguity or drift it reduces immediately: Which parameters are honored, which failures are collapsed, and where legacy fallback occurs.
- Expected code/document moves: Inventory doc, route contract notes, later branch to align API/web proxy signatures and failure mapping.
- Runtime impact in this planning pass: none
- Runtime impact in later implementation: yes
- Validation method: compare route signatures, service signatures, web proxies, and existing tests.
- Blockers/prerequisites: none
- Rollback risk: low for inventory, medium for later implementation
- Sequencing notes: Complete before P1 response-class mapping.
- Verification status: confirmed

### Task P0-5: Normalize durable schema naming and ownership map

- Task name: Normalize durable schema naming and ownership map
- Owner boundary: migrations
- Exact files/modules: [apps/api/alembic/versions/2ef152b01cec_create_signals_table.py](/home/maximoto/dev/sats-rover/apps/api/alembic/versions/2ef152b01cec_create_signals_table.py), [apps/indexer/src/index.ts](/home/maximoto/dev/sats-rover/apps/indexer/src/index.ts), [apps/api/app/services/places_service.py](/home/maximoto/dev/sats-rover/apps/api/app/services/places_service.py), [docs/protocol/satsrover-v2.json](/home/maximoto/dev/sats-rover/docs/protocol/satsrover-v2.json)
- Why now: `merchant_claims` vs `app_state_claims` and `value` vs `value_json` vs `BIGINT value` create operator confusion.
- Why not later: Naming drift blocks safe migration ownership work.
- Why this task belongs in P0: It is a deterministic ownership clarification problem.
- What ambiguity or drift it reduces immediately: Table/entity naming and column-shape truth.
- Expected code/document moves: Forward migration plan, canonical schema matrix, startup assertions for final shapes.
- Runtime impact in this planning pass: none
- Runtime impact in later implementation: yes
- Validation method: schema diff matrix between Alembic head, empty DB bootstrap, and runtime assumptions.
- Blockers/prerequisites: P0-2
- Rollback risk: medium
- Sequencing notes: Land with migration branch, not with route branch.
- Verification status: confirmed

### Measurable P0 done criteria

- One normative protocol authority is declared and every runtime protocol constant surface is either traced to it or marked legacy.
- Alembic head creates all canonical, derived, and operator-local durable tables required by current runtime.
- Indexer startup no longer owns canonical schema creation in design; replacement startup assertions are specified and branch-scoped.
- Every active legacy compatibility path is classified as keep-temporarily, quarantine, or remove-later with exact file paths.
- Route/contract drift inventory is complete for all important workflow and derived routes.

# 9. P1 EXECUTION PLAN

## Confirmed repo facts

- [confirmed] P1 scope in this repo is protocol product definition and backend de-mystification planning.

## High-confidence inferences

- [inference] P1 should remain semantically strict and docs/contracts heavy; it does not require large frontend changes if the route outputs become more explicit.

## Recommendations

### Task P1-1: Document reducer semantics explicitly

- Task name: Document reducer semantics explicitly
- Owner boundary: reducer/indexer
- Exact files/modules: [apps/indexer/src/signals_v2_state.ts](/home/maximoto/dev/sats-rover/apps/indexer/src/signals_v2_state.ts), [apps/indexer/src/index.ts](/home/maximoto/dev/sats-rover/apps/indexer/src/index.ts), [docs/protocol/satsrover-v2.json](/home/maximoto/dev/sats-rover/docs/protocol/satsrover-v2.json)
- Why now: Reducer rules exist in code but are not yet isolated as the product-state definition.
- Why not later: Provenance and route classification need exact reducer outputs first.
- Why this task belongs in P1: It clarifies product semantics without changing product scope.
- What ambiguity or drift it reduces immediately: Whether state is “latest event”, “latest success”, or some hidden heuristic.
- Expected code/document moves: Reducer semantics doc and conformance test plan.
- Runtime impact in this planning pass: none
- Runtime impact in later implementation: yes
- Validation method: reducer replay tests against `signals_v2_events`.
- Blockers/prerequisites: P0-1, P0-2
- Rollback risk: low
- Sequencing notes: First P1 task.
- Verification status: confirmed

### Task P1-2: Map all important routes to response classes

- Task name: Map all important routes to response classes
- Owner boundary: API
- Exact files/modules: [apps/api/app/api/v1/checkins.py](/home/maximoto/dev/sats-rover/apps/api/app/api/v1/checkins.py), [apps/api/app/api/v1/places.py](/home/maximoto/dev/sats-rover/apps/api/app/api/v1/places.py), [apps/api/app/api/v1/signals.py](/home/maximoto/dev/sats-rover/apps/api/app/api/v1/signals.py), [apps/web/src/app/api](/home/maximoto/dev/sats-rover/apps/web/src/app/api)
- Why now: Current route classes are implicit and occasionally mixed.
- Why not later: Provenance fields and client usage depend on route class.
- Why this task belongs in P1: It is semantic clarification of backend surfaces.
- What ambiguity or drift it reduces immediately: Which routes expose canonical observations, reducer outputs, or operator-local workflow state.
- Expected code/document moves: Route-class document; later branch for route schema comments and proxy alignment.
- Runtime impact in this planning pass: none
- Runtime impact in later implementation: yes
- Validation method: route inventory review and contract tests by class.
- Blockers/prerequisites: P0-4
- Rollback risk: low
- Sequencing notes: Can run in parallel with P1-1 after P0 completion.
- Verification status: confirmed

### Task P1-3: Design provenance fields for derived routes

- Task name: Design provenance fields for derived routes
- Owner boundary: API
- Exact files/modules: [apps/api/app/schemas/place.py](/home/maximoto/dev/sats-rover/apps/api/app/schemas/place.py), [apps/api/app/schemas/signal.py](/home/maximoto/dev/sats-rover/apps/api/app/schemas/signal.py), [apps/api/app/services/places_service.py](/home/maximoto/dev/sats-rover/apps/api/app/services/places_service.py), [apps/api/app/services/signals_service.py](/home/maximoto/dev/sats-rover/apps/api/app/services/signals_service.py)
- Why now: Derived routes currently hide whether data is complete, partially observed, or legacy-fallback-derived.
- Why not later: Client-facing semantics will harden quickly if omitted.
- Why this task belongs in P1: This is backend de-mystification.
- What ambiguity or drift it reduces immediately: Why a feed or place summary looks the way it does.
- Expected code/document moves: Add provenance envelope design and schema change plan.
- Runtime impact in this planning pass: none
- Runtime impact in later implementation: yes
- Validation method: contract schema review and golden payload examples.
- Blockers/prerequisites: P1-1, P1-2
- Rollback risk: medium because client payloads may expand
- Sequencing notes: Do after route-class mapping.
- Verification status: confirmed

### Task P1-4: Define completeness semantics vocabulary

- Task name: Define completeness semantics vocabulary
- Owner boundary: API
- Exact files/modules: [apps/api/app/schemas/place.py](/home/maximoto/dev/sats-rover/apps/api/app/schemas/place.py), [apps/api/app/schemas/signal.py](/home/maximoto/dev/sats-rover/apps/api/app/schemas/signal.py), [apps/web/src/app/api/places/[placeId]/feed/route.ts](/home/maximoto/dev/sats-rover/apps/web/src/app/api/places/[placeId]/feed/route.ts), [apps/web/src/app/api/feed/global/route.ts](/home/maximoto/dev/sats-rover/apps/web/src/app/api/feed/global/route.ts)
- Why now: Absence and partial failure are currently normalized away.
- Why not later: Product semantics become harder to correct once proxies and UI assume “missing means empty”.
- Why this task belongs in P1: It is semantic clarification of read completeness.
- What ambiguity or drift it reduces immediately: observed vs partially observed vs pending vs fallback-derived vs invalid vs not-yet-observed.
- Expected code/document moves: Vocabulary doc and payload examples; later branch to add fields to responses.
- Runtime impact in this planning pass: none
- Runtime impact in later implementation: yes
- Validation method: contract tests and explicit example fixtures.
- Blockers/prerequisites: P1-2, P1-3
- Rollback risk: medium
- Sequencing notes: Coordinate with web proxy behavior changes.
- Verification status: confirmed

### Task P1-5: Document relay observation and read semantics

- Task name: Document relay observation and read semantics
- Owner boundary: reducer/indexer
- Exact files/modules: [apps/indexer/src/index.ts](/home/maximoto/dev/sats-rover/apps/indexer/src/index.ts), [apps/indexer/src/live_signal_policy.ts](/home/maximoto/dev/sats-rover/apps/indexer/src/live_signal_policy.ts), [docs/protocol/satsrover-v2.json](/home/maximoto/dev/sats-rover/docs/protocol/satsrover-v2.json)
- Why now: Current reducer/relay behavior is real but partially implicit.
- Why not later: Completeness semantics require a documented observation model.
- Why this task belongs in P1: It de-mystifies operator backends without expanding protocol scope.
- What ambiguity or drift it reduces immediately: What “observed” means, how watermarks work, and what incomplete relay coverage implies for reads.
- Expected code/document moves: Relay observation semantics doc and startup assertion expectations.
- Runtime impact in this planning pass: none
- Runtime impact in later implementation: yes
- Validation method: replay-window tests and relay observation notes tied to watermarks.
- Blockers/prerequisites: P0-2
- Rollback risk: low
- Sequencing notes: Can begin once schema ownership is settled.
- Verification status: confirmed

### Task P1-6: Clarify operator-local vs derived vs observation boundaries

- Task name: Clarify operator-local vs derived vs observation boundaries
- Owner boundary: API
- Exact files/modules: [apps/api/app/services/signals_service.py](/home/maximoto/dev/sats-rover/apps/api/app/services/signals_service.py), [apps/api/app/main.py](/home/maximoto/dev/sats-rover/apps/api/app/main.py), [apps/web/src/app/api/checkins/status/route.ts](/home/maximoto/dev/sats-rover/apps/web/src/app/api/checkins/status/route.ts), [apps/web/src/app/api/places/[placeId]/feed/route.ts](/home/maximoto/dev/sats-rover/apps/web/src/app/api/places/[placeId]/feed/route.ts)
- Why now: Current services and proxies blur these categories operationally.
- Why not later: Backend mystique tends to ossify in status/proxy routes.
- Why this task belongs in P1: It is direct de-mystification planning.
- What ambiguity or drift it reduces immediately: Whether backend responses represent canonical observation, deterministic projection, or operator workflow state.
- Expected code/document moves: Route contract notes, later branch to split or relabel ambiguous payloads.
- Runtime impact in this planning pass: none
- Runtime impact in later implementation: yes
- Validation method: route-class contract tests and payload examples.
- Blockers/prerequisites: P1-2, P1-3
- Rollback risk: medium
- Sequencing notes: Final P1 semantic cleanup before any client/UI changes.
- Verification status: confirmed

### Measurable P1 done criteria

- Reducer semantics are documented in repo-specific terms with exact keys, tie-breakers, and input/output tables.
- Every important route is assigned exactly one response class.
- Derived payloads have a designed provenance/completeness envelope and example fixtures.
- Relay observation semantics and watermark/replay assumptions are documented.
- Operator-local workflow semantics are explicitly separated from canonical observation and reducer outputs in route contracts.

# 10. EXPECTED CODE MOVES

## Confirmed repo facts

| Source file/path | Target file/path | Move type | Why this move reduces ambiguity | Runtime behavior changes now or later | Verification status |
| --- | --- | --- | --- | --- | --- |
| [packages/protocol/src/index.ts](/home/maximoto/dev/sats-rover/packages/protocol/src/index.ts) | Later target TBD under `packages/protocol/` generated or traced from [docs/protocol/satsrover-v2.json](/home/maximoto/dev/sats-rover/docs/protocol/satsrover-v2.json) | generate-from-spec | Removes stale runtime protocol truth | later only | confirmed |
| Protocol constants embedded in [apps/indexer/src/index.ts](/home/maximoto/dev/sats-rover/apps/indexer/src/index.ts) and [apps/indexer/src/live_signal_policy.ts](/home/maximoto/dev/sats-rover/apps/indexer/src/live_signal_policy.ts) | Later small protocol authority module or generated constants package | rename | Makes validator choices traceable to normative authority | later only | confirmed |
| Runtime schema bootstrap in [apps/indexer/src/index.ts](/home/maximoto/dev/sats-rover/apps/indexer/src/index.ts) | Alembic revisions under [apps/api/alembic/versions](/home/maximoto/dev/sats-rover/apps/api/alembic/versions) | move ownership to migrations | Eliminates hidden schema shaping in runtime | later only | confirmed |
| [apps/indexer/src/importer.ts](/home/maximoto/dev/sats-rover/apps/indexer/src/importer.ts) | Quarantine target TBD under `apps/indexer/src/legacy/` if retained | quarantine | Isolates legacy `signals` compatibility logic from canonical v2 reducer path | later only | confirmed |
| Legacy fallback branches in [apps/api/app/services/signals_service.py](/home/maximoto/dev/sats-rover/apps/api/app/services/signals_service.py) | Split explicit degraded-mode handling or remove after compatibility window | split route semantics | Prevents hidden v1-derived responses from looking canonical | later only | confirmed |
| Feed error normalization in [apps/web/src/app/api/places/[placeId]/feed/route.ts](/home/maximoto/dev/sats-rover/apps/web/src/app/api/places/[placeId]/feed/route.ts) | Derived-response envelope with provenance | split route semantics | Preserves upstream meaning instead of collapsing to opaque 200s | later only | confirmed |

## High-confidence inferences

- [inference] Some moves may collapse into smaller edits rather than file moves if the team prefers to keep surface area low; the key requirement is ownership clarity, not path churn for its own sake.

## Recommendations

- [recommendation] Prefer ownership moves and quarantine moves over in-place rewrites when a module currently mixes canonical and legacy semantics.

# 11. MIGRATION OWNERSHIP CHANGES

## Confirmed repo facts

| Table / entity | Current owners | Desired owner | Exact files involved | Required migration follow-up | Startup assertion requirement | Classification | Verification status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `signals_v2_events` | runtime bootstrap in [apps/indexer/src/index.ts](/home/maximoto/dev/sats-rover/apps/indexer/src/index.ts); partial ALTER in [apps/api/alembic/versions/6c2f4b9d7e31_add_raw_event_payment_evidence_to_signals_v2_events.py](/home/maximoto/dev/sats-rover/apps/api/alembic/versions/6c2f4b9d7e31_add_raw_event_payment_evidence_to_signals_v2_events.py) | migrations | same plus [apps/api/app/services/signals_service.py](/home/maximoto/dev/sats-rover/apps/api/app/services/signals_service.py) | Create canonical table in Alembic and formalize indexes/columns there | Assert exact columns including `raw_event` / `payment_evidence` / indexes | canonical schema | confirmed |
| `signals_v2_state` | runtime bootstrap in [apps/indexer/src/index.ts](/home/maximoto/dev/sats-rover/apps/indexer/src/index.ts) | migrations | [apps/indexer/src/index.ts](/home/maximoto/dev/sats-rover/apps/indexer/src/index.ts), [apps/indexer/src/signals_v2_state.ts](/home/maximoto/dev/sats-rover/apps/indexer/src/signals_v2_state.ts), [apps/api/app/services/places_service.py](/home/maximoto/dev/sats-rover/apps/api/app/services/places_service.py) | Create derived table and indexes in Alembic | Assert PK `(pubkey, place_id, day_utc)` and reducer-owned columns | derived schema | confirmed |
| `app_state_claims` | runtime bootstrap in [apps/indexer/src/index.ts](/home/maximoto/dev/sats-rover/apps/indexer/src/index.ts) | migrations | [apps/indexer/src/index.ts](/home/maximoto/dev/sats-rover/apps/indexer/src/index.ts), [apps/api/app/services/places_service.py](/home/maximoto/dev/sats-rover/apps/api/app/services/places_service.py) | Create canonical app-state claim table in Alembic | Assert PK `(pubkey, d)` and current columns | derived schema | confirmed |
| `ingestion_state` | migrations with `value_json` and `value` text; runtime bootstrap with `value BIGINT` | migrations | [apps/api/alembic/versions/c3e9b2f4a1d0_add_ingestion_state_table.py](/home/maximoto/dev/sats-rover/apps/api/alembic/versions/c3e9b2f4a1d0_add_ingestion_state_table.py), [apps/api/alembic/versions/f1a7c9d2e4b6_ingestion_state_legacy_value_compat.py](/home/maximoto/dev/sats-rover/apps/api/alembic/versions/f1a7c9d2e4b6_ingestion_state_legacy_value_compat.py), [apps/indexer/src/index.ts](/home/maximoto/dev/sats-rover/apps/indexer/src/index.ts), [apps/api/app/main.py](/home/maximoto/dev/sats-rover/apps/api/app/main.py) | Choose final column shape and add forward migration if needed | Assert final shape and compatible read/write paths | operator-local schema | confirmed |
| `checkin_submissions` | migrations and runtime service writes | migrations | [apps/api/alembic/versions/8d4f9c0a1b2e_create_checkin_submissions_table.py](/home/maximoto/dev/sats-rover/apps/api/alembic/versions/8d4f9c0a1b2e_create_checkin_submissions_table.py), [apps/api/app/services/signals_service.py](/home/maximoto/dev/sats-rover/apps/api/app/services/signals_service.py) | No ownership change; add startup assertion coverage only | Assert presence and expected status constraint | operator-local schema | confirmed |
| `signals` | legacy migration and compatibility runtime reads/writes | legacy only, not future owner | [apps/api/alembic/versions/2ef152b01cec_create_signals_table.py](/home/maximoto/dev/sats-rover/apps/api/alembic/versions/2ef152b01cec_create_signals_table.py), [apps/api/app/services/signals_service.py](/home/maximoto/dev/sats-rover/apps/api/app/services/signals_service.py), [apps/indexer/src/importer.ts](/home/maximoto/dev/sats-rover/apps/indexer/src/importer.ts) | None in P0 except classification and later deprecation plan | If retained during transition, degraded-mode assertion must be explicit | historical-only | confirmed |
| `merchant_claims` | legacy migration only | historical-only | [apps/api/alembic/versions/2ef152b01cec_create_signals_table.py](/home/maximoto/dev/sats-rover/apps/api/alembic/versions/2ef152b01cec_create_signals_table.py) | None in P0 except classification note | None | historical-only | confirmed |
| `places` | migrations and API model | migrations | [apps/api/alembic/versions/0001_create_places.py](/home/maximoto/dev/sats-rover/apps/api/alembic/versions/0001_create_places.py), [apps/api/app/models/place.py](/home/maximoto/dev/sats-rover/apps/api/app/models/place.py) | No ownership change | Assert required columns and indexes as part of startup checks | canonical schema | confirmed |

## Recommendations

- [recommendation] Treat `signals_v2_events` as canonical schema, `signals_v2_state` and `app_state_claims` as deterministic derived schema, `checkin_submissions` and `ingestion_state` as operator-local schema, and `signals` / `merchant_claims` as historical-only residue.

# 12. DOCUMENTATION OUTPUTS

## Confirmed repo facts

- [confirmed] Supporting Edits Made In This Pass: none beyond this new plan artifact.

## Recommendations

| Exact target path | Purpose | Dependencies | Stage | Verification status |
| --- | --- | --- | --- | --- |
| [docs/execution-plan-p0-p1.md](/home/maximoto/dev/sats-rover/docs/execution-plan-p0-p1.md) | Durable execution plan, repo memory, LLM/human handoff | none | this pass | confirmed |
| `docs/protocol-authority.md` | Identify normative protocol authority and runtime traceability rules | P0-1 | P0 | inferred |
| `docs/reducer-semantics.md` | Repo-specific reducer semantics for canonical and derived state | P1-1 | P1 | inferred |
| `docs/api-response-classes.md` | Observation / Derived / Operator-local mapping for important routes | P1-2 | P1 | inferred |
| `docs/relay-observation-semantics.md` | Watermark, replay, observation completeness, and relay-read semantics | P1-5 | P1 | inferred |
| `docs/legacy-residue-classification.md` | Explicit disposition for `signals`, `merchant_claims`, importer compatibility, stale protocol exports | P0-3 | P0 | inferred |
| Later ADR branch only, no file in this pass | Promote ADR-001..005 from this plan into standalone ADRs after review | architecture review of this plan | later | inferred |

# 13. TEST / CONFORMANCE OUTPUTS

## Confirmed repo facts

- [confirmed] The repo already contains reducer tests in [apps/indexer/src/__tests__/signalsV2StateReducer.test.ts](/home/maximoto/dev/sats-rover/apps/indexer/src/__tests__/signalsV2StateReducer.test.ts) and many API behavior tests in [apps/api/tests](/home/maximoto/dev/sats-rover/apps/api/tests), but they do not yet form a complete protocol / response-class / schema-ownership conformance set.

## Recommendations

| Exact target module/path if inferable | What it validates | Stage | Test type | Verification status |
| --- | --- | --- | --- | --- |
| `apps/indexer/src/__tests__/protocolAuthorityConformance.test.ts` | Runtime validators and constants match the normative protocol authority | P0 | unit | inferred |
| `apps/indexer/src/__tests__/signalsV2ReducerConformance.test.ts` | Replay of `signals_v2_events` yields deterministic `signals_v2_state` outputs and tie-break semantics | P1 | unit / conformance | inferred |
| `apps/api/tests/test_schema_startup_assertions.py` | API/indexer fail loudly when required canonical/derived/operator-local schema is missing or wrong | P0 | integration / migration assertion | inferred |
| `apps/api/tests/test_response_classes_contract.py` | Important routes emit the declared response class semantics | P1 | contract | inferred |
| `apps/api/tests/test_provenance_semantics.py` | Derived routes encode completeness/provenance vocabulary correctly | P1 | contract | inferred |
| `apps/api/tests/test_legacy_compatibility_guardrails.py` | Any retained fallback path is explicit, isolated, and observable | P0 | integration | inferred |
| `apps/web/tests/route-proxy-semantics.contract.test.mjs` | Web proxies preserve route class and do not collapse upstream provenance unexpectedly | P1 | contract | inferred |

# 14. IMPLEMENTATION BRANCH PLAN

## Recommendations

| Branch Name | Scope | Owner Boundary | Depends On | Blocked By | Touches Runtime? yes/no | Safe To Land Independently? yes/no |
| --- | --- | --- | --- | --- | --- | --- |
| `docs/p0-p1-execution-plan` | This planning artifact only | docs | none | none | no | yes |
| `docs/protocol-authority-adr-prep` | Protocol authority doc, residue classification, ADR draft extraction | protocol | `docs/p0-p1-execution-plan` | review of this plan | no | yes |
| `migrations/schema-ownership-v2` | Alembic ownership for v2 ledger/state/claims/ingestion_state; startup assertion design | migrations | `docs/protocol-authority-adr-prep` | schema review | yes | yes |
| `indexer/protocol-authority-cleanup` | Remove stale protocol exports usage, trace runtime constants to normative source, replace bootstrap creation with assertions | reducer/indexer | `migrations/schema-ownership-v2` | final schema ownership decisions | yes | mostly |
| `api/legacy-residue-quarantine` | Isolate or deprecate `signals` fallback and importer-related compatibility edges | API | `migrations/schema-ownership-v2` | compatibility-window decision | yes | mostly |
| `api/response-classes-provenance` | Route class mapping, payload provenance/completeness fields, route signature alignment | API | `docs/protocol-authority-adr-prep`, `api/legacy-residue-quarantine` | route contract review | yes | no |
| `web/proxy-semantics-alignment` | Update web proxies to preserve response classes/provenance semantics | web client | `api/response-classes-provenance` | final API contract | yes | yes |

If `indexer/protocol-authority-cleanup` and `api/legacy-residue-quarantine` both need to edit [apps/indexer/src/index.ts](/home/maximoto/dev/sats-rover/apps/indexer/src/index.ts) or shared protocol helpers heavily, consolidate them or sequence them strictly after `migrations/schema-ownership-v2`.

# 15. MILESTONES AND EXIT CRITERIA

## Recommendations

### Milestone 1: Week 1

- Scope: Finalize architecture decisions and residue inventory.
- Exact deliverables: approved execution plan; protocol authority inventory; legacy residue classification; ADR recommendations approved in principle.
- Prerequisites: none
- Blockers: architecture review availability
- Risk notes: Risk of premature implementation before ownership decisions are settled.
- Validation method: review against actual repo files listed in this plan.
- Measurable exit criteria: protocol authority source chosen; all major residue paths classified; no disputed owner boundary remains for canonical vs derived vs operator-local state.

### Milestone 2: Week 2

- Scope: Migration ownership unification.
- Exact deliverables: forward Alembic plan/branch for `signals_v2_events`, `signals_v2_state`, `app_state_claims`, `ingestion_state`; startup assertion design.
- Prerequisites: Milestone 1
- Blockers: DB shape decisions for `ingestion_state`
- Risk notes: Highest runtime risk milestone because startup/schema assumptions change.
- Validation method: empty-DB migration test plus startup assertion tests.
- Measurable exit criteria: Alembic head defines all required load-bearing tables; runtime creation paths are marked for removal or assertion-only replacement.

### Milestone 3: Week 3

- Scope: Route classes and reducer semantics.
- Exact deliverables: reducer semantics doc; route-class doc; route contract mismatch fixes scoped and branchable.
- Prerequisites: Milestone 2
- Blockers: unresolved compatibility-window questions for legacy `signals`
- Risk notes: Semantic changes can sprawl unless route inventory stays strict.
- Validation method: conformance test skeletons and contract fixture review.
- Measurable exit criteria: every important route assigned exactly one class; reducer tie-break rules and inputs/outputs documented.

### Milestone 4: Week 4

- Scope: Provenance/completeness semantics and web proxy alignment.
- Exact deliverables: provenance vocabulary; derived route envelope design; web proxy alignment branch plan.
- Prerequisites: Milestone 3
- Blockers: API contract approval
- Risk notes: Client compatibility and UX copy may need careful rollout.
- Validation method: contract tests for API and web proxies.
- Measurable exit criteria: derived routes can distinguish observed / partially observed / pending / fallback-derived / superseded / invalid / not-yet-observed; web proxies no longer erase those distinctions.

# 16. DEFERRED ITEMS (P2+)

## Confirmed repo facts

- [confirmed] The current repo already documents claim maturity, moderation, bonding/economic mechanics, and broader discovery redesign as deferred or not implemented in [docs/architecture.md](/home/maximoto/dev/sats-rover/docs/architecture.md) and [docs/roadmap.md](/home/maximoto/dev/sats-rover/docs/roadmap.md).

## Recommendations

- Claim-tier maturity work: deferred because P0/P1 must first define canonical inputs, reducer outputs, and route semantics clearly.
- Attestation / external linkage: deferred because claim policy cannot be expanded safely while claim state ownership and route semantics remain ambiguous.
- Economic / bonding mechanics: deferred because anti-spam economics are intentionally out of immediate implementation scope and would distract from deterministic ownership cleanup.
- Alternative indexer portability beyond minimal prep: deferred because current priority is making the existing backend legible and replayable, not introducing portability layers.
- Deep client verification / full client-side indexing: deferred because current architecture still relies on backend reducers/readers and needs explicit semantics before client parity work.
- Broad UI redesign: deferred because current frontend already reflects backend truth direction and should not be mixed with backend semantic cleanup.

# 17. NON-GOALS FOR THIS PASS

- Claim bonding implementation.
- New economic mechanics.
- Broad frontend redesign.
- Full client-side verification or indexing.
- Major protocol expansion unless strictly needed to resolve ambiguity.
- Broad runtime refactors.
- Broad docs system rewrites.
- ADR file creation or editing outside this plan artifact.
- README / `docs/architecture.md` / `docs/roadmap.md` rewrite.
- Opportunistic cleanup of generated artifacts, tests, or unrelated modules.

# 18. OPEN QUESTIONS / UNCERTAINTIES

## Confirmed repo facts

- [confirmed] The repo does not currently show a standalone runtime consumer of [packages/protocol/src/index.ts](/home/maximoto/dev/sats-rover/packages/protocol/src/index.ts) in the scanned source tree, but its presence in the workspace and package graph still makes it dangerous residue.
- [confirmed] The repo contains current tests for many fallback paths, but this pass did not execute runtime tests; all findings are code-audit based.

## Uncertain / needs human verification

- [uncertain] Whether any external deployment or script still depends on the legacy `signals` table or [apps/indexer/src/importer.ts](/home/maximoto/dev/sats-rover/apps/indexer/src/importer.ts) outside the repo-scanned code paths.
- [uncertain] Whether `ingestion_state` must preserve both structured and scalar values for backwards operational compatibility, or whether one final shape can be enforced immediately.
- [uncertain] Whether the team wants a generated protocol constants package or a hand-maintained traceability layer from runtime validators to the normative doc.
- [uncertain] Whether claim read state should remain purely informational in P1 payload semantics, or whether any explicit “policy not applied” provenance marker is desired immediately.

## High-confidence inferences

- [inference] The safest sequencing is to settle schema ownership and route classes before deleting legacy fallbacks.

## Recommendations

- [recommendation] Resolve the external-compatibility questions before landing any branch that removes `signals` fallback behavior or importer compatibility.

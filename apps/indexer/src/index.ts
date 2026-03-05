import { WebSocket } from "ws";
import { Pool } from "pg";
import dotenv from "dotenv";
import { getEventHash, verifyEvent } from "nostr-tools";
import { processSatsRoverEvent } from "./importer.js";
import {
  dbConflictTotal,
  claimsRejectedTotal,
  claimsSeenTotal,
  claimsUpsertTotal,
  eventsAcceptedTotal,
  eventsReceivedTotal,
  eventsRejectedTotal,
  relayConnected,
  signalsV2RejectedTotal,
  signalsV2SeenTotal,
  signalsV2UpsertTotal,
  startMetricsServer,
  v2SeenTotal,
  v2SoftInvalidTotal,
  v2SoftUnknownTagTotal,
  watermarkUpdatesTotal,
  watermarkValue,
  wsReconnectTotal,
} from "./metrics.js";

dotenv.config();

const RELAYS = [
  "wss://relay.damus.io",
  "wss://relay.primal.net",
  "wss://nos.lol",
];
const pool = new Pool({
  connectionString:
    process.env.INDEXER_DATABASE_URL || process.env.DATABASE_URL,
});
const METRICS_PORT = Number(process.env.METRICS_PORT || 9108);
const SIGNALS_LANE = "signals";
const CLAIMS_LANE = "claims";
const SIGNALS_WATERMARK_KEY = "signals_max_created_at";
const CLAIMS_WATERMARK_KEY = "claims_max_created_at";
const SINCE_BUFFER_SEC = 60;
const RETENTION_SEC = 30 * 24 * 60 * 60;
const PREFILTER_MAX_PLACE_ID_LENGTH = 200;
const PREFILTER_MAX_CONTENT_BYTES = 8 * 1024;
const PREFILTER_MAX_TAGS = 200;
const DROP_LOG_DEDUPE_MAX_KEYS = 5000;
const PUBKEY_WINDOW_MS = 60_000;
const PUBKEY_MAX_EVENTS_PER_WINDOW = 30;
const PUBKEY_LIMITER_MAX_KEYS = 20_000;
const GLOBAL_BUDGET_TOKENS_PER_SEC = 200;
const GLOBAL_BUDGET_BURST_TOKENS = 400;
const SIGVERIFY_TOKENS_PER_SEC = 120;
const SIGVERIFY_BURST_TOKENS = 240;
const RELAY_WINDOW_MS = 10_000;
const RELAY_MAX_EVENTS_PER_WINDOW = 120;
const RELAY_LIMITER_MAX_KEYS = 2000;
const RELAY_HEALTH_WINDOW_MS = 60_000;
const RELAY_HEALTH_MIN_SAMPLE = 200;
const RELAY_HEALTH_DROP_RATIO_THRESHOLD = 0.9;
const RELAY_QUARANTINE_MS = 5 * 60_000;
const SEEN_EVENT_TTL_MS = 10 * 60_000;
const SEEN_EVENT_MAX_KEYS = 200_000;
const SEEN_EVENT_SWEEP_INTERVAL = 1000;
const SEEN_EVENT_SWEEP_MAX_PER_TICK = 256;
const SEEN_EVENT_SWEEP_QUEUE_MAX_KEYS = 8192;
const MAX_TAG_FIELD_LENGTH = 200;
const VERIFICATION_TAG_SCAN_LIMIT = 64;
const MAX_CREATED_AT_FUTURE_SKEW_SEC = 10 * 60;
const MAX_CREATED_AT_AGE_SEC = 30 * 24 * 60 * 60;
const ALLOWED_EVENT_KINDS = new Set([1, 30331]);
const SOFT_V2_ALLOWED_STATUS = new Set(["success", "failed", "did_not_try"]);
const SOFT_V2_KNOWN_TAGS = new Set([
  "t",
  "v",
  "place",
  "status",
  "g",
  "client",
  "amount_msat",
  "zap",
  "bolt11",
]);
const SOFT_V2_GEOHASH_CHARS = "0123456789bcdefghjkmnpqrstuvwxyz";
const CLAIMS_KIND = 30078;
const SIGNALS_KIND = 30331;
const MAX_CLAIM_D_LENGTH = 240;
const MAX_CLAIM_CONTENT_BYTES = 4096;
const MAX_SIGNALS_V2_CONTENT_BYTES = 4096;

const dropLogDedupe = new Set<string>();
const pubkeyLimiter = new Map<
  string,
  { windowStartMs: number; count: number }
>();
const relayLimiter = new Map<string, { windowStartMs: number; count: number }>();
const seenEventIds = new Map<string, number>();
const seenEventSweepQueue: string[] = [];
let seenEventSweepQueueIndex = 0;
let globalTokens = GLOBAL_BUDGET_BURST_TOKENS;
let globalLastRefillMs = Date.now();
let sigverifyTokens = SIGVERIFY_BURST_TOKENS;
let sigverifyLastRefillMs = Date.now();
let budgetTokenDrops = 0;
let budgetTokenConsumes = 0;
let statsTimerStarted = false;
let eventsSeen = 0;
let eventsParsedOk = 0;
let eventsParsedFail = 0;
let dropsInvalidIdHex = 0;
let dropsInvalidPubkeyHex = 0;
let dropsMissingPlace = 0;
let dropsPlaceTooLong = 0;
let dropsTooManyTags = 0;
let dropsContentTooLarge = 0;
let dropsDuplicateEventId = 0;
let dropsInvalidWsFrameShape = 0;
let dropsInvalidEventFrameShape = 0;
let dropsMissingEventObject = 0;
let dropsInvalidWsJson = 0;
let dropsInvalidKind = 0;
let dropsDisallowedKind = 0;
let dropsInvalidCreatedAt = 0;
let dropsCreatedAtOutOfRange = 0;
let dropsInvalidTagsShape = 0;
let dropsTagValueTooLong = 0;
let dropsTagsScanLimitExceeded = 0;
let dropsMissingSig = 0;
let dropsInvalidSigHex = 0;
let verificationGatePassed = 0;
let expensivePathAttempts = 0;
let expensivePathSkippedByBudget = 0;
let expensivePathInvoked = 0;
let sigverifyAttempts = 0;
let sigverifyBudgetDrops = 0;
let sigverifyInvoked = 0;
let sigverifyPassed = 0;
let sigverifyFailedInvalidId = 0;
let sigverifyFailedInvalidSig = 0;
let seenEventSweepTick = 0;

type RelayStats = {
  accepted: number;
  dropped: number;
  rateLimited: number;
  pubkeyLimited: number;
  budgetDropped: number;
  windowStartMs: number;
  acceptedInWindow: number;
  droppedInWindow: number;
  guardDroppedInWindow: number;
  relayFaultDroppedInWindow: number;
  quarantinedUntilMs: number;
  droppedByReason: Record<string, number>;
};
const relayStats = new Map<string, RelayStats>();
let cachedSignalsWatermarkSec = 0;
let cachedClaimsWatermarkSec = 0;

async function ensureIngestionStateTable(pool: Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ingestion_state (
      key TEXT PRIMARY KEY,
      value BIGINT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
}

async function ensureClaimsTable(pool: Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_state_claims (
      pubkey TEXT NOT NULL,
      d TEXT NOT NULL,
      place_id TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at BIGINT NOT NULL,
      event_id TEXT NOT NULL,
      content TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (pubkey, d)
    )
  `);
}

async function ensureSignalsV2Tables(pool: Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS signals_v2_events (
      event_id TEXT PRIMARY KEY,
      pubkey TEXT NOT NULL,
      created_at BIGINT NOT NULL,
      place_id TEXT NOT NULL,
      status TEXT NOT NULL,
      day_utc INTEGER NOT NULL,
      g TEXT NULL,
      client TEXT NULL,
      amount_msat BIGINT NULL,
      zap TEXT NULL,
      bolt11 TEXT NULL,
      content TEXT NOT NULL,
      relay TEXT NULL,
      inserted_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS signals_v2_state (
      pubkey TEXT NOT NULL,
      place_id TEXT NOT NULL,
      day_utc INTEGER NOT NULL,
      status TEXT NOT NULL,
      created_at BIGINT NOT NULL,
      event_id TEXT NOT NULL,
      g TEXT NULL,
      client TEXT NULL,
      amount_msat BIGINT NULL,
      zap TEXT NULL,
      bolt11 TEXT NULL,
      content TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (pubkey, place_id, day_utc)
    )
  `);
}

async function getWatermark(pool: Pool, key: string): Promise<number> {
  const res = await pool.query<{ value: string | number }>(
    "SELECT value FROM ingestion_state WHERE key = $1",
    [key],
  );
  if (res.rowCount === 0) return 0;
  const raw = res.rows[0]?.value;
  const value = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.floor(value));
}

async function upsertWatermarkMonotonic(
  pool: Pool,
  key: string,
  newValue: number,
): Promise<void> {
  await pool.query(
    `
      INSERT INTO ingestion_state(key, value)
      VALUES ($1, $2)
      ON CONFLICT (key) DO UPDATE
      SET value = GREATEST(ingestion_state.value, EXCLUDED.value),
          updated_at = now()
    `,
    [key, newValue],
  );
}

function computeSinceCreatedAt(watermarkSec: number, nowSec: number): number {
  const base = watermarkSec - SINCE_BUFFER_SEC;
  const cap = nowSec - RETENTION_SEC;
  const since = Math.max(base, cap);
  return since < 0 ? 0 : since;
}

type ClaimsValidationResult =
  | {
      ok: true;
      pubkey: string;
      eventId: string;
      createdAt: number;
      d: string;
      placeId: string;
      role: string;
      content: string;
    }
  | { ok: false; reason: string; eventId?: string };

function validateClaimsEventStrict(event: any, nowSec: number): ClaimsValidationResult {
  if (!event || typeof event !== "object") {
    return { ok: false, reason: "invalid_event_shape" };
  }
  if (event.kind !== CLAIMS_KIND) {
    return { ok: false, reason: "invalid_kind" };
  }
  if (typeof event.id !== "string" || !isHex64(event.id)) {
    return { ok: false, reason: "invalid_event_id_hex" };
  }
  if (typeof event.pubkey !== "string" || !isHex64(event.pubkey)) {
    return { ok: false, reason: "invalid_pubkey_hex", eventId: event.id };
  }
  if (
    typeof event.created_at !== "number" ||
    !Number.isFinite(event.created_at) ||
    !Number.isInteger(event.created_at)
  ) {
    return { ok: false, reason: "invalid_created_at", eventId: event.id };
  }
  if (event.created_at > nowSec + MAX_CREATED_AT_FUTURE_SKEW_SEC) {
    return { ok: false, reason: "created_at_future_skew", eventId: event.id };
  }
  const content = typeof event.content === "string" ? event.content : "";
  if (Buffer.byteLength(content, "utf8") > MAX_CLAIM_CONTENT_BYTES) {
    return { ok: false, reason: "content_too_large", eventId: event.id };
  }

  const tags = event.tags;
  if (!Array.isArray(tags)) {
    return { ok: false, reason: "invalid_tags_shape", eventId: event.id };
  }

  let tCount = 0;
  let vCount = 0;
  let dCount = 0;
  let placeCount = 0;
  let roleCount = 0;
  let tValue: string | null = null;
  let vValue: string | null = null;
  let dValue: string | null = null;
  let placeValue: string | null = null;
  let roleValue: string | null = null;

  for (let i = 0; i < tags.length && i < VERIFICATION_TAG_SCAN_LIMIT; i += 1) {
    const tag = tags[i];
    if (!Array.isArray(tag) || typeof tag[0] !== "string") {
      return { ok: false, reason: "invalid_tags_shape", eventId: event.id };
    }
    const tagName = tag[0];
    if (tagName === "t") {
      tCount += 1;
      if (typeof tag[1] === "string") tValue = tag[1];
      continue;
    }
    if (tagName === "v") {
      vCount += 1;
      if (typeof tag[1] === "string") vValue = tag[1];
      continue;
    }
    if (tagName === "d") {
      dCount += 1;
      if (typeof tag[1] === "string") dValue = tag[1];
      continue;
    }
    if (tagName === "place") {
      placeCount += 1;
      if (typeof tag[1] === "string") placeValue = tag[1];
      continue;
    }
    if (tagName === "role") {
      roleCount += 1;
      if (typeof tag[1] === "string") roleValue = tag[1];
      continue;
    }
  }

  if (tCount === 0 || tValue !== "satsrover-claim") {
    return { ok: false, reason: "missing_or_invalid_t", eventId: event.id };
  }
  if (vCount === 0 || vValue !== "2") {
    return { ok: false, reason: "missing_or_invalid_v", eventId: event.id };
  }
  if (dCount === 0 || typeof dValue !== "string") {
    return { ok: false, reason: "missing_or_invalid_d", eventId: event.id };
  }
  if (placeCount === 0 || typeof placeValue !== "string") {
    return { ok: false, reason: "missing_or_invalid_place", eventId: event.id };
  }
  if (roleCount === 0 || roleValue !== "owner") {
    return { ok: false, reason: "missing_or_invalid_role", eventId: event.id };
  }
  if (tCount > 1 || vCount > 1 || dCount > 1 || placeCount > 1 || roleCount > 1) {
    return { ok: false, reason: "duplicate_required_tag", eventId: event.id };
  }
  if (dValue.length > MAX_CLAIM_D_LENGTH) {
    return { ok: false, reason: "d_too_long", eventId: event.id };
  }
  if (placeValue.length > PREFILTER_MAX_PLACE_ID_LENGTH) {
    return { ok: false, reason: "place_too_long", eventId: event.id };
  }
  if (!dValue.startsWith("claim:")) {
    return { ok: false, reason: "invalid_d_prefix", eventId: event.id };
  }
  const dPlace = dValue.slice("claim:".length);
  if (dPlace !== placeValue) {
    return { ok: false, reason: "d_place_mismatch", eventId: event.id };
  }

  return {
    ok: true,
    pubkey: event.pubkey,
    eventId: event.id,
    createdAt: event.created_at,
    d: dValue,
    placeId: placeValue,
    role: roleValue,
    content,
  };
}

async function reduceClaimEvent(
  pool: Pool,
  claim: {
    pubkey: string;
    d: string;
    placeId: string;
    role: string;
    createdAt: number;
    eventId: string;
    content: string;
  },
): Promise<"inserted" | "updated" | "ignored"> {
  const res = await pool.query<{ inserted: boolean }>(
    `
      INSERT INTO app_state_claims (
        pubkey, d, place_id, role, created_at, event_id, content, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, now())
      ON CONFLICT (pubkey, d) DO UPDATE
      SET
        place_id = EXCLUDED.place_id,
        role = EXCLUDED.role,
        created_at = EXCLUDED.created_at,
        event_id = EXCLUDED.event_id,
        content = EXCLUDED.content,
        updated_at = now()
      WHERE
        app_state_claims.created_at < EXCLUDED.created_at
        OR (
          app_state_claims.created_at = EXCLUDED.created_at
          AND app_state_claims.event_id < EXCLUDED.event_id
        )
      RETURNING (xmax = 0) AS inserted
    `,
    [
      claim.pubkey,
      claim.d,
      claim.placeId,
      claim.role,
      claim.createdAt,
      claim.eventId,
      claim.content,
    ],
  );
  if (res.rowCount === 0) return "ignored";
  return res.rows[0]?.inserted ? "inserted" : "updated";
}

type SignalsV2ParseResult =
  | {
      ok: true;
      pubkey: string;
      eventId: string;
      createdAt: number;
      placeId: string;
      status: "success" | "failed" | "did_not_try";
      dayUtc: number;
      g: string | null;
      client: string | null;
      amountMsat: bigint | null;
      zap: string | null;
      bolt11: string | null;
      content: string;
    }
  | { ok: false; reason: string; eventId?: string };

function parseSignalsV2EventStrict(event: any, nowSec: number): SignalsV2ParseResult {
  if (!event || typeof event !== "object") {
    return { ok: false, reason: "invalid_event_shape" };
  }
  if (typeof event.id !== "string" || !isHex64(event.id)) {
    return { ok: false, reason: "invalid_event_id_hex" };
  }
  if (typeof event.pubkey !== "string" || !isHex64(event.pubkey)) {
    return { ok: false, reason: "invalid_pubkey_hex", eventId: event.id };
  }
  if (
    typeof event.created_at !== "number" ||
    !Number.isFinite(event.created_at) ||
    !Number.isInteger(event.created_at)
  ) {
    return { ok: false, reason: "invalid_created_at", eventId: event.id };
  }
  if (event.created_at > nowSec + MAX_CREATED_AT_FUTURE_SKEW_SEC) {
    return { ok: false, reason: "created_at_future_skew", eventId: event.id };
  }
  const content = typeof event.content === "string" ? event.content : "";
  if (Buffer.byteLength(content, "utf8") > MAX_SIGNALS_V2_CONTENT_BYTES) {
    return { ok: false, reason: "content_too_large", eventId: event.id };
  }

  const tags = event.tags;
  if (!Array.isArray(tags)) {
    return { ok: false, reason: "invalid_tags_shape", eventId: event.id };
  }

  let tCount = 0;
  let vCount = 0;
  let placeCount = 0;
  let statusCount = 0;
  let gCount = 0;
  let clientCount = 0;
  let amountMsatCount = 0;
  let zapCount = 0;
  let bolt11Count = 0;

  let tValue: string | null = null;
  let vValue: string | null = null;
  let placeValue: string | null = null;
  let statusValue: string | null = null;
  let gValue: string | null = null;
  let clientValue: string | null = null;
  let amountMsatValue: bigint | null = null;
  let zapValue: string | null = null;
  let bolt11Value: string | null = null;

  for (let i = 0; i < tags.length && i < VERIFICATION_TAG_SCAN_LIMIT; i += 1) {
    const tag = tags[i];
    if (!Array.isArray(tag) || typeof tag[0] !== "string") {
      return { ok: false, reason: "invalid_tags_shape", eventId: event.id };
    }
    const tagName = tag[0];
    const tagValue = typeof tag[1] === "string" ? tag[1] : null;

    if (tagName === "t") {
      tCount += 1;
      tValue = tagValue;
      continue;
    }
    if (tagName === "v") {
      vCount += 1;
      vValue = tagValue;
      continue;
    }
    if (tagName === "place") {
      placeCount += 1;
      placeValue = tagValue;
      continue;
    }
    if (tagName === "status") {
      statusCount += 1;
      statusValue = tagValue;
      continue;
    }
    if (tagName === "g") {
      gCount += 1;
      if (typeof tagValue !== "string" || !isSoftV2Geohash(tagValue)) {
        return { ok: false, reason: "invalid_g", eventId: event.id };
      }
      gValue = tagValue;
      continue;
    }
    if (tagName === "client") {
      clientCount += 1;
      clientValue = tagValue;
      continue;
    }
    if (tagName === "amount_msat") {
      amountMsatCount += 1;
      if (
        typeof tagValue !== "string" ||
        tagValue.length > 20 ||
        !isDigitsOnly(tagValue)
      ) {
        return { ok: false, reason: "invalid_amount_msat", eventId: event.id };
      }
      try {
        const parsedAmount = BigInt(tagValue);
        if (parsedAmount < 0n || parsedAmount > 9223372036854775807n) {
          return { ok: false, reason: "invalid_amount_msat", eventId: event.id };
        }
        amountMsatValue = parsedAmount;
      } catch {
        return { ok: false, reason: "invalid_amount_msat", eventId: event.id };
      }
      continue;
    }
    if (tagName === "zap") {
      zapCount += 1;
      if (typeof tagValue !== "string" || !isHex64(tagValue)) {
        return { ok: false, reason: "invalid_zap", eventId: event.id };
      }
      zapValue = tagValue;
      continue;
    }
    if (tagName === "bolt11") {
      bolt11Count += 1;
      if (typeof tagValue !== "string" || tagValue.length > 2000) {
        return { ok: false, reason: "invalid_bolt11", eventId: event.id };
      }
      bolt11Value = tagValue;
      continue;
    }
  }

  if (tCount > 1 || vCount > 1 || placeCount > 1 || statusCount > 1) {
    return { ok: false, reason: "duplicate_required_tag", eventId: event.id };
  }
  if (gCount > 1 || clientCount > 1 || amountMsatCount > 1 || zapCount > 1 || bolt11Count > 1) {
    return { ok: false, reason: "duplicate_optional_tag", eventId: event.id };
  }
  if (tCount === 0 || tValue !== "satsrover") {
    return { ok: false, reason: "missing_or_invalid_t", eventId: event.id };
  }
  if (vCount === 0 || vValue !== "2") {
    return { ok: false, reason: "missing_or_invalid_v", eventId: event.id };
  }
  if (placeCount === 0 || typeof placeValue !== "string" || placeValue.length === 0) {
    return { ok: false, reason: "missing_or_invalid_place", eventId: event.id };
  }
  if (statusCount === 0 || typeof statusValue !== "string") {
    return { ok: false, reason: "missing_or_invalid_status", eventId: event.id };
  }
  if (statusValue !== "success" && statusValue !== "failed" && statusValue !== "did_not_try") {
    return { ok: false, reason: "invalid_status", eventId: event.id };
  }
  if (placeValue.length > PREFILTER_MAX_PLACE_ID_LENGTH) {
    return { ok: false, reason: "place_too_long", eventId: event.id };
  }

  return {
    ok: true,
    pubkey: event.pubkey,
    eventId: event.id,
    createdAt: event.created_at,
    placeId: placeValue,
    status: statusValue,
    dayUtc: Math.floor(event.created_at / 86400),
    g: gValue,
    client: clientValue,
    amountMsat: amountMsatValue,
    zap: zapValue,
    bolt11: bolt11Value,
    content,
  };
}

async function reduceSignalsV2Event(
  pool: Pool,
  relay: string,
  parsed: {
    pubkey: string;
    eventId: string;
    createdAt: number;
    placeId: string;
    status: "success" | "failed" | "did_not_try";
    dayUtc: number;
    g: string | null;
    client: string | null;
    amountMsat: bigint | null;
    zap: string | null;
    bolt11: string | null;
    content: string;
  },
): Promise<"inserted" | "updated" | "ignored"> {
  await pool.query(
    `
      INSERT INTO signals_v2_events (
        event_id, pubkey, created_at, place_id, status, day_utc, g, client,
        amount_msat, zap, bolt11, content, relay
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT (event_id) DO NOTHING
    `,
    [
      parsed.eventId,
      parsed.pubkey,
      parsed.createdAt,
      parsed.placeId,
      parsed.status,
      parsed.dayUtc,
      parsed.g,
      parsed.client,
      parsed.amountMsat,
      parsed.zap,
      parsed.bolt11,
      parsed.content,
      relay,
    ],
  );

  const reduced = await pool.query<{ inserted: boolean }>(
    `
      INSERT INTO signals_v2_state (
        pubkey, place_id, day_utc, status, created_at, event_id, g, client,
        amount_msat, zap, bolt11, content, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, now())
      ON CONFLICT (pubkey, place_id, day_utc) DO UPDATE
      SET
        status = EXCLUDED.status,
        created_at = EXCLUDED.created_at,
        event_id = EXCLUDED.event_id,
        g = EXCLUDED.g,
        client = EXCLUDED.client,
        amount_msat = EXCLUDED.amount_msat,
        zap = EXCLUDED.zap,
        bolt11 = EXCLUDED.bolt11,
        content = EXCLUDED.content,
        updated_at = now()
      WHERE
        signals_v2_state.created_at < EXCLUDED.created_at
        OR (
          signals_v2_state.created_at = EXCLUDED.created_at
          AND signals_v2_state.event_id < EXCLUDED.event_id
        )
      RETURNING (xmax = 0) AS inserted
    `,
    [
      parsed.pubkey,
      parsed.placeId,
      parsed.dayUtc,
      parsed.status,
      parsed.createdAt,
      parsed.eventId,
      parsed.g,
      parsed.client,
      parsed.amountMsat,
      parsed.zap,
      parsed.bolt11,
      parsed.content,
    ],
  );

  if (reduced.rowCount === 0) return "ignored";
  return reduced.rows[0]?.inserted ? "inserted" : "updated";
}

function log(
  level: "info" | "warn" | "error",
  msg: string,
  ctx: Record<string, unknown> = {},
) {
  const payload = {
    ts: new Date().toISOString(),
    level,
    msg,
    service: "indexer",
    ...ctx,
  };
  const line = JSON.stringify(payload);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

function rememberDropLogKey(key: string): boolean {
  if (dropLogDedupe.has(key)) return false;
  if (dropLogDedupe.size >= DROP_LOG_DEDUPE_MAX_KEYS) {
    dropLogDedupe.clear();
  }
  dropLogDedupe.add(key);
  return true;
}

function getRelayStats(relay: string): RelayStats {
  const existing = relayStats.get(relay);
  if (existing) return existing;
  const created: RelayStats = {
    accepted: 0,
    dropped: 0,
    rateLimited: 0,
    pubkeyLimited: 0,
    budgetDropped: 0,
    windowStartMs: Date.now(),
    acceptedInWindow: 0,
    droppedInWindow: 0,
    guardDroppedInWindow: 0,
    relayFaultDroppedInWindow: 0,
    quarantinedUntilMs: 0,
    droppedByReason: {},
  };
  relayStats.set(relay, created);
  return created;
}

function refreshRelayHealthWindow(stats: RelayStats, nowMs: number): void {
  if (nowMs - stats.windowStartMs < RELAY_HEALTH_WINDOW_MS) return;
  stats.windowStartMs = nowMs;
  stats.acceptedInWindow = 0;
  stats.droppedInWindow = 0;
  stats.guardDroppedInWindow = 0;
  stats.relayFaultDroppedInWindow = 0;
}

function maybeActivateRelayQuarantine(relay: string, stats: RelayStats, nowMs: number): void {
  if (stats.quarantinedUntilMs > nowMs) return;
  const sample = stats.acceptedInWindow + stats.relayFaultDroppedInWindow;
  if (sample < RELAY_HEALTH_MIN_SAMPLE) return;
  const faultRatio = stats.relayFaultDroppedInWindow / sample;
  if (faultRatio < RELAY_HEALTH_DROP_RATIO_THRESHOLD) return;

  stats.quarantinedUntilMs = nowMs + RELAY_QUARANTINE_MS;
  log("warn", "relay_quarantine_activated", {
    relay,
    sample,
    faultRatio: Math.round(faultRatio * 1000) / 1000,
    acceptedInWindow: stats.acceptedInWindow,
    guardDroppedInWindow: stats.guardDroppedInWindow,
    relayFaultDroppedInWindow: stats.relayFaultDroppedInWindow,
    quarantinedUntilMs: stats.quarantinedUntilMs,
  });
}

function recordDropped(
  relay: string,
  reason: string,
  kind: "guard" | "relay_fault",
  nowMs = Date.now(),
): void {
  const stats = getRelayStats(relay);
  refreshRelayHealthWindow(stats, nowMs);
  stats.dropped += 1;
  stats.droppedInWindow += 1;
  if (kind === "guard") {
    stats.guardDroppedInWindow += 1;
  } else {
    stats.relayFaultDroppedInWindow += 1;
  }
  stats.droppedByReason[reason] = (stats.droppedByReason[reason] || 0) + 1;
  maybeActivateRelayQuarantine(relay, stats, nowMs);
}

function recordAccepted(relay: string, nowMs = Date.now()): void {
  const stats = getRelayStats(relay);
  refreshRelayHealthWindow(stats, nowMs);
  stats.accepted += 1;
  stats.acceptedInWindow += 1;
  maybeActivateRelayQuarantine(relay, stats, nowMs);
}

function refillGlobalTokens(nowMs: number): void {
  const elapsedMs = Math.max(0, nowMs - globalLastRefillMs);
  globalLastRefillMs = nowMs;
  if (elapsedMs === 0) return;
  const tokensToAdd = (elapsedMs / 1000) * GLOBAL_BUDGET_TOKENS_PER_SEC;
  globalTokens = Math.min(GLOBAL_BUDGET_BURST_TOKENS, globalTokens + tokensToAdd);
}

function tryConsumeGlobalToken(nowMs: number): boolean {
  refillGlobalTokens(nowMs);
  if (globalTokens < 1) {
    budgetTokenDrops += 1;
    return false;
  }
  globalTokens -= 1;
  budgetTokenConsumes += 1;
  return true;
}

function refillSigverifyTokens(nowMs: number): void {
  const elapsedMs = Math.max(0, nowMs - sigverifyLastRefillMs);
  sigverifyLastRefillMs = nowMs;
  if (elapsedMs === 0) return;
  const tokensToAdd = (elapsedMs / 1000) * SIGVERIFY_TOKENS_PER_SEC;
  sigverifyTokens = Math.min(SIGVERIFY_BURST_TOKENS, sigverifyTokens + tokensToAdd);
}

function tryConsumeSigverifyToken(nowMs: number): boolean {
  refillSigverifyTokens(nowMs);
  if (sigverifyTokens < 1) {
    return false;
  }
  sigverifyTokens -= 1;
  return true;
}

function sweepPubkeyLimiter(nowMs: number): void {
  if (pubkeyLimiter.size < PUBKEY_LIMITER_MAX_KEYS) return;
  for (const [key, state] of pubkeyLimiter.entries()) {
    if (nowMs - state.windowStartMs >= PUBKEY_WINDOW_MS) {
      pubkeyLimiter.delete(key);
    }
  }
  if (pubkeyLimiter.size >= PUBKEY_LIMITER_MAX_KEYS) {
    pubkeyLimiter.clear();
  }
}

function isPubkeyWithinRateLimit(pubkey: string, nowMs: number): boolean {
  sweepPubkeyLimiter(nowMs);
  const current = pubkeyLimiter.get(pubkey);
  if (!current || nowMs - current.windowStartMs >= PUBKEY_WINDOW_MS) {
    pubkeyLimiter.set(pubkey, { windowStartMs: nowMs, count: 1 });
    return true;
  }
  if (current.count >= PUBKEY_MAX_EVENTS_PER_WINDOW) {
    return false;
  }
  current.count += 1;
  return true;
}

function sweepRelayLimiter(nowMs: number): void {
  if (relayLimiter.size < RELAY_LIMITER_MAX_KEYS) return;
  for (const [key, state] of relayLimiter.entries()) {
    if (nowMs - state.windowStartMs >= RELAY_WINDOW_MS) {
      relayLimiter.delete(key);
    }
  }
  if (relayLimiter.size >= RELAY_LIMITER_MAX_KEYS) {
    relayLimiter.clear();
  }
}

function isRelayWithinRateLimit(relay: string, nowMs: number): boolean {
  sweepRelayLimiter(nowMs);
  const current = relayLimiter.get(relay);
  if (!current || nowMs - current.windowStartMs >= RELAY_WINDOW_MS) {
    relayLimiter.set(relay, { windowStartMs: nowMs, count: 1 });
    return true;
  }
  if (current.count >= RELAY_MAX_EVENTS_PER_WINDOW) {
    return false;
  }
  current.count += 1;
  return true;
}

function clearSeenEventSweepQueue(): void {
  seenEventSweepQueue.length = 0;
  seenEventSweepQueueIndex = 0;
}

function refillSeenEventSweepQueueIfNeeded(): void {
  if (seenEventSweepQueueIndex < seenEventSweepQueue.length) return;
  clearSeenEventSweepQueue();
  for (const eventId of seenEventIds.keys()) {
    seenEventSweepQueue.push(eventId);
    if (seenEventSweepQueue.length >= SEEN_EVENT_SWEEP_QUEUE_MAX_KEYS) {
      break;
    }
  }
}

function sweepSeenEventIds(nowMs: number): void {
  if (seenEventIds.size === 0) {
    clearSeenEventSweepQueue();
    return;
  }
  refillSeenEventSweepQueueIfNeeded();

  let processed = 0;
  while (
    processed < SEEN_EVENT_SWEEP_MAX_PER_TICK &&
    seenEventSweepQueueIndex < seenEventSweepQueue.length
  ) {
    const eventId = seenEventSweepQueue[seenEventSweepQueueIndex];
    seenEventSweepQueueIndex += 1;
    processed += 1;
    const seenAt = seenEventIds.get(eventId);
    if (typeof seenAt !== "number") {
      continue;
    }
    if (nowMs - seenAt >= SEEN_EVENT_TTL_MS) {
      seenEventIds.delete(eventId);
    }
  }
  if (seenEventSweepQueueIndex >= seenEventSweepQueue.length) {
    clearSeenEventSweepQueue();
  }

  if (seenEventIds.size > SEEN_EVENT_MAX_KEYS) {
    seenEventIds.clear();
    clearSeenEventSweepQueue();
  }
}

function isDuplicateEventId(eventId: string, nowMs: number): boolean {
  seenEventSweepTick += 1;
  if (
    seenEventIds.size >= SEEN_EVENT_MAX_KEYS ||
    seenEventSweepTick % SEEN_EVENT_SWEEP_INTERVAL === 0
  ) {
    sweepSeenEventIds(nowMs);
  }

  const seenAt = seenEventIds.get(eventId);
  if (typeof seenAt === "number") {
    if (nowMs - seenAt < SEEN_EVENT_TTL_MS) {
      return true;
    }
    seenEventIds.set(eventId, nowMs);
    return false;
  }
  seenEventIds.set(eventId, nowMs);
  return false;
}

function isHex64(value: string): boolean {
  if (value.length !== 64) return false;
  for (let i = 0; i < 64; i += 1) {
    const code = value.charCodeAt(i);
    const isDigit = code >= 48 && code <= 57;
    const isLowerHex = code >= 97 && code <= 102;
    const isUpperHex = code >= 65 && code <= 70;
    if (!isDigit && !isLowerHex && !isUpperHex) return false;
  }
  return true;
}

function isHex128(value: string): boolean {
  if (value.length !== 128) return false;
  for (let i = 0; i < 128; i += 1) {
    const code = value.charCodeAt(i);
    const isDigit = code >= 48 && code <= 57;
    const isLowerHex = code >= 97 && code <= 102;
    const isUpperHex = code >= 65 && code <= 70;
    if (!isDigit && !isLowerHex && !isUpperHex) return false;
  }
  return true;
}

function shouldProcessEvent(event: any): {
  ok: boolean;
  reason?: string;
  pubkey?: string;
  eventId?: string;
} {
  if (!event || typeof event !== "object") {
    return { ok: false, reason: "invalid_event_shape" };
  }
  const eventId = event.id;
  const pubkey = event.pubkey;
  if (typeof eventId !== "string" || !isHex64(eventId)) {
    return {
      ok: false,
      reason:
        typeof eventId === "string" ? "invalid_event_id_hex" : "missing_event_id",
      pubkey: typeof pubkey === "string" ? pubkey : undefined,
      eventId: typeof eventId === "string" ? eventId : undefined,
    };
  }
  if (typeof pubkey !== "string" || !isHex64(pubkey)) {
    return {
      ok: false,
      reason:
        typeof pubkey === "string" ? "invalid_pubkey_hex" : "missing_pubkey",
      pubkey: typeof pubkey === "string" ? pubkey : undefined,
      eventId,
    };
  }

  const tags = event.tags;
  if (!Array.isArray(tags)) {
    return { ok: false, reason: "missing_tags", pubkey, eventId };
  }
  if (tags.length > PREFILTER_MAX_TAGS) {
    return { ok: false, reason: "too_many_tags", pubkey, eventId };
  }

  let placeValue: string | null = null;
  for (const tag of tags) {
    if (
      Array.isArray(tag) &&
      tag[0] === "place" &&
      typeof tag[1] === "string"
    ) {
      placeValue = tag[1];
      break;
    }
  }
  if (!placeValue) {
    return { ok: false, reason: "missing_place_tag", pubkey, eventId };
  }
  const trimmedPlace = placeValue.trim();
  if (trimmedPlace.length === 0) {
    return { ok: false, reason: "empty_place_tag", pubkey, eventId };
  }
  if (trimmedPlace.length > PREFILTER_MAX_PLACE_ID_LENGTH) {
    return { ok: false, reason: "place_tag_too_long", pubkey, eventId };
  }

  const content = typeof event.content === "string" ? event.content : "";
  if (Buffer.byteLength(content, "utf8") > PREFILTER_MAX_CONTENT_BYTES) {
    return { ok: false, reason: "content_too_large", pubkey, eventId };
  }

  return { ok: true, pubkey, eventId };
}

function passesVerificationGate(
  event: any,
  nowSec: number,
): { ok: true } | { ok: false; reason: string } {
  const kind = event?.kind;
  if (typeof kind !== "number" || !Number.isFinite(kind)) {
    return { ok: false, reason: "invalid_kind" };
  }
  if (!ALLOWED_EVENT_KINDS.has(kind)) {
    return { ok: false, reason: "disallowed_kind" };
  }

  const createdAt = event?.created_at;
  // Keep created_at strict: do not accept stringified ints; reject instead.
  if (
    typeof createdAt !== "number" ||
    !Number.isFinite(createdAt) ||
    !Number.isInteger(createdAt)
  ) {
    return { ok: false, reason: "invalid_created_at" };
  }
  if (
    createdAt > nowSec + MAX_CREATED_AT_FUTURE_SKEW_SEC ||
    createdAt < nowSec - MAX_CREATED_AT_AGE_SEC
  ) {
    return { ok: false, reason: "created_at_out_of_range" };
  }

  const tags = event?.tags;
  if (!Array.isArray(tags)) {
    return { ok: false, reason: "invalid_tags_shape" };
  }
  if (tags.length > VERIFICATION_TAG_SCAN_LIMIT) {
    return { ok: false, reason: "tags_scan_limit_exceeded" };
  }
  for (const tag of tags) {
    if (!Array.isArray(tag) || typeof tag[0] !== "string") {
      return { ok: false, reason: "invalid_tags_shape" };
    }
    if (tag[0].length > MAX_TAG_FIELD_LENGTH) {
      return { ok: false, reason: "tag_value_too_long" };
    }
    if (tag.length > 1 && typeof tag[1] === "string" && tag[1].length > MAX_TAG_FIELD_LENGTH) {
      return { ok: false, reason: "tag_value_too_long" };
    }
  }

  return { ok: true };
}

function passesSignaturePrereqGate(
  event: any,
): { ok: true } | { ok: false; reason: string } {
  const sig = event?.sig;
  if (typeof sig !== "string") {
    return { ok: false, reason: "missing_sig" };
  }
  if (!isHex128(sig)) {
    return { ok: false, reason: "invalid_sig_hex" };
  }
  return { ok: true };
}

function verifyEventSignature(
  event: any,
): { ok: true } | { ok: false; reason: "sigverify_invalid_id" | "sigverify_invalid_sig" } {
  try {
    const computedId = getEventHash(event);
    if (computedId !== event.id) {
      return { ok: false, reason: "sigverify_invalid_id" };
    }
  } catch {
    return { ok: false, reason: "sigverify_invalid_id" };
  }
  if (!verifyEvent(event)) {
    return { ok: false, reason: "sigverify_invalid_sig" };
  }
  return { ok: true };
}

type EnvelopeValidationResult =
  | { kind: "drop"; reason: "invalid_ws_frame_shape" | "invalid_event_frame_shape" | "missing_event_object" }
  | { kind: "ignore" }
  | { kind: "event"; event: any };

function validateInboundEnvelope(msg: any): EnvelopeValidationResult {
  if (!Array.isArray(msg) || typeof msg[0] !== "string") {
    return { kind: "drop", reason: "invalid_ws_frame_shape" };
  }
  if (msg[0] !== "EVENT") {
    return { kind: "ignore" };
  }
  if (msg.length < 3) {
    return { kind: "drop", reason: "invalid_event_frame_shape" };
  }
  const eventCandidate = msg[2];
  if (eventCandidate == null) {
    return { kind: "drop", reason: "missing_event_object" };
  }
  if (typeof eventCandidate !== "object") {
    return { kind: "drop", reason: "invalid_event_frame_shape" };
  }
  return { kind: "event", event: eventCandidate };
}

function maybeLogDrop(opts: {
  msg:
    | "event_dropped_prefilter"
    | "event_dropped_rate_limited"
    | "event_dropped_budget"
    | "event_dropped_quarantined"
    | "event_dropped_relay_fault";
  reason: string;
  pubkey: string | undefined;
  eventId: string | undefined;
  relay: string;
}): void {
  const { msg, reason, pubkey, eventId, relay } = opts;
  const dedupeKey =
    reason === "relay_quarantined" ||
    reason === "relay_rate_limited" ||
    reason === "verification_budget_exhausted" ||
    reason === "duplicate_event_id" ||
    reason === "sigverify_budget_exhausted" ||
    reason === "sigverify_invalid_id" ||
    reason === "sigverify_invalid_sig" ||
    reason === "tags_scan_limit_exceeded" ||
    reason === "invalid_ws_frame_shape" ||
    reason === "invalid_event_frame_shape" ||
    reason === "missing_event_object" ||
    reason === "invalid_ws_json"
      ? `${msg}:${reason}:${relay}`
      : `${msg}:${reason}:${pubkey || "unknown"}`;
  if (!rememberDropLogKey(dedupeKey)) return;
  log("warn", msg, {
    reason,
    pubkey: pubkey || "unknown",
    eventId: eventId || "unknown",
    relay,
  });
}

function getEventKindLabel(event: any): string {
  const kind = event?.kind;
  if (typeof kind === "number" && Number.isFinite(kind) && Number.isInteger(kind)) {
    return String(kind);
  }
  return "missing";
}

function getEventVersionLabel(event: any): string {
  const tags = event?.tags;
  if (!Array.isArray(tags)) return "missing";
  for (const tag of tags) {
    if (Array.isArray(tag) && tag[0] === "v" && typeof tag[1] === "string") {
      if (tag[1] === "1") return "1";
      if (tag[1] === "2") return "2";
      return "other";
    }
  }
  return "missing";
}

function normalizeSoftV2UnknownTag(tagName: string): string {
  if (
    tagName === "t" ||
    tagName === "v" ||
    tagName === "place" ||
    tagName === "status" ||
    tagName === "g" ||
    tagName === "client" ||
    tagName === "amount_msat" ||
    tagName === "zap" ||
    tagName === "bolt11"
  ) {
    return tagName;
  }
  return "other";
}

function isSoftV2Geohash(value: string): boolean {
  if (value.length < 5 || value.length > 7) return false;
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    const lowerCode = code >= 65 && code <= 90 ? code + 32 : code;
    const char = String.fromCharCode(lowerCode);
    if (!SOFT_V2_GEOHASH_CHARS.includes(char)) return false;
  }
  return true;
}

function isDigitsOnly(value: string): boolean {
  if (value.length === 0) return false;
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    if (code < 48 || code > 57) return false;
  }
  return true;
}

function validateSignalsV2Soft(event: any): {
  firstReason?: string;
  reasons: string[];
  unknownTags: string[];
} {
  const tags = Array.isArray(event?.tags) ? event.tags : [];
  const reasons: string[] = [];
  const unknownTags: string[] = [];
  let tCount = 0;
  let vCount = 0;
  let placeCount = 0;
  let statusCount = 0;
  let gCount = 0;
  let clientCount = 0;
  let amountMsatCount = 0;
  let zapCount = 0;
  let bolt11Count = 0;
  let hasTSatsrover = false;
  let hasV2 = false;
  let hasPlace = false;
  let hasStatus = false;

  for (let i = 0; i < tags.length && i < VERIFICATION_TAG_SCAN_LIMIT; i += 1) {
    const tag = tags[i];
    if (!Array.isArray(tag) || typeof tag[0] !== "string") continue;
    const tagName = tag[0];
    const tagValue = typeof tag[1] === "string" ? tag[1] : "";

    if (!SOFT_V2_KNOWN_TAGS.has(tagName)) {
      unknownTags.push(normalizeSoftV2UnknownTag(tagName));
      continue;
    }

    if (tagName === "t") {
      tCount += 1;
      if (tagValue === "satsrover") hasTSatsrover = true;
      continue;
    }
    if (tagName === "v") {
      vCount += 1;
      if (tagValue === "2") hasV2 = true;
      continue;
    }
    if (tagName === "place") {
      placeCount += 1;
      if (typeof tag[1] === "string" && tag[1].length > 0) hasPlace = true;
      continue;
    }
    if (tagName === "status") {
      statusCount += 1;
      if (typeof tag[1] === "string" && tag[1].length > 0) hasStatus = true;
      if (!SOFT_V2_ALLOWED_STATUS.has(tagValue)) {
        reasons.push("invalid_status");
      }
      continue;
    }
    if (tagName === "g") {
      gCount += 1;
      if (typeof tag[1] !== "string" || !isSoftV2Geohash(tag[1])) {
        reasons.push("invalid_g");
      }
      continue;
    }
    if (tagName === "client") {
      clientCount += 1;
      continue;
    }
    if (tagName === "amount_msat") {
      amountMsatCount += 1;
      if (
        typeof tag[1] !== "string" ||
        tag[1].length > 20 ||
        !isDigitsOnly(tag[1])
      ) {
        reasons.push("invalid_amount_msat");
      }
      continue;
    }
    if (tagName === "zap") {
      zapCount += 1;
      if (typeof tag[1] !== "string" || !isHex64(tag[1])) {
        reasons.push("invalid_zap");
      }
      continue;
    }
    if (tagName === "bolt11") {
      bolt11Count += 1;
      if (typeof tag[1] !== "string" || tag[1].length > 2000) {
        reasons.push("invalid_bolt11");
      }
      continue;
    }
  }

  if (!hasTSatsrover) reasons.push("missing_t_satsrover");
  if (!hasV2) reasons.push("missing_v2");
  if (!hasPlace) reasons.push("missing_place");
  if (!hasStatus) reasons.push("missing_status");
  if (tCount > 1) reasons.push("duplicate_t");
  if (vCount > 1) reasons.push("duplicate_v");
  if (placeCount > 1) reasons.push("duplicate_place");
  if (statusCount > 1) reasons.push("duplicate_status");
  if (gCount > 1) reasons.push("duplicate_g");
  if (clientCount > 1) reasons.push("duplicate_client");
  if (amountMsatCount > 1) reasons.push("duplicate_amount_msat");
  if (zapCount > 1) reasons.push("duplicate_zap");
  if (bolt11Count > 1) reasons.push("duplicate_bolt11");

  return { firstReason: reasons[0], reasons, unknownTags };
}

function startStatsTimerIfNeeded(): void {
  if (statsTimerStarted) return;
  statsTimerStarted = true;
  setInterval(() => {
    for (const [relay, stats] of relayStats.entries()) {
      const sample = stats.acceptedInWindow + stats.relayFaultDroppedInWindow;
      const faultRatio =
        sample > 0 ? stats.relayFaultDroppedInWindow / sample : 0;
      log("info", "relay_ingest_stats", {
        relay,
        accepted: stats.accepted,
        dropped: stats.dropped,
        rateLimited: stats.rateLimited,
        pubkeyLimited: stats.pubkeyLimited,
        budgetDropped: stats.budgetDropped,
        acceptedInWindow: stats.acceptedInWindow,
        droppedInWindow: stats.droppedInWindow,
        guardDroppedInWindow: stats.guardDroppedInWindow,
        relayFaultDroppedInWindow: stats.relayFaultDroppedInWindow,
        faultRatio: Math.round(faultRatio * 1000) / 1000,
        quarantinedUntilMs:
          stats.quarantinedUntilMs > 0 ? stats.quarantinedUntilMs : null,
        quarantinedUntilIso:
          stats.quarantinedUntilMs > 0
            ? new Date(stats.quarantinedUntilMs).toISOString()
            : null,
        droppedByReason: stats.droppedByReason,
      });
    }
    log("info", "global_budget_stats", {
      tokens: Math.round(globalTokens),
      consumes: budgetTokenConsumes,
      drops: budgetTokenDrops,
      tokensPerSec: GLOBAL_BUDGET_TOKENS_PER_SEC,
      burstTokens: GLOBAL_BUDGET_BURST_TOKENS,
      sigverifyTokens: Math.round(sigverifyTokens),
      sigverifyTokensPerSec: SIGVERIFY_TOKENS_PER_SEC,
      sigverifyBurstTokens: SIGVERIFY_BURST_TOKENS,
    });
    log("info", "ingest_guard_stats", {
      eventsSeen,
      eventsParsedOk,
      eventsParsedFail,
      dropsInvalidIdHex,
      dropsInvalidPubkeyHex,
      dropsMissingPlace,
      dropsPlaceTooLong,
      dropsTooManyTags,
      dropsContentTooLarge,
      dropsDuplicateEventId,
      dropsInvalidWsFrameShape,
      dropsInvalidEventFrameShape,
      dropsMissingEventObject,
      dropsInvalidWsJson,
      dropsInvalidKind,
      dropsDisallowedKind,
      dropsInvalidCreatedAt,
      dropsCreatedAtOutOfRange,
      dropsInvalidTagsShape,
      dropsTagValueTooLong,
      dropsTagsScanLimitExceeded,
      dropsMissingSig,
      dropsInvalidSigHex,
      verificationGatePassed,
      expensivePathAttempts,
      expensivePathSkippedByBudget,
      expensivePathInvoked,
      sigverifyAttempts,
      sigverifyBudgetDrops,
      sigverifyInvoked,
      sigverifyPassed,
      sigverifyFailedInvalidId,
      sigverifyFailedInvalidSig,
    });
  }, 60_000);
}

function connect(url: string) {
  const ws = new WebSocket(url);

  ws.on("open", async () => {
    relayConnected.labels(url).set(1);
    const dbSignalsWatermark = await getWatermark(pool, SIGNALS_WATERMARK_KEY).catch(
      () => cachedSignalsWatermarkSec,
    );
    if (dbSignalsWatermark > cachedSignalsWatermarkSec) {
      cachedSignalsWatermarkSec = dbSignalsWatermark;
    }
    const dbClaimsWatermark = await getWatermark(pool, CLAIMS_WATERMARK_KEY).catch(
      () => cachedClaimsWatermarkSec,
    );
    if (dbClaimsWatermark > cachedClaimsWatermarkSec) {
      cachedClaimsWatermarkSec = dbClaimsWatermark;
    }
    watermarkValue.labels(SIGNALS_LANE).set(cachedSignalsWatermarkSec);
    watermarkValue.labels(CLAIMS_LANE).set(cachedClaimsWatermarkSec);
    const nowSec = Math.floor(Date.now() / 1000);
    const signalsSinceCreatedAt = computeSinceCreatedAt(cachedSignalsWatermarkSec, nowSec);
    const claimsSinceCreatedAt = computeSinceCreatedAt(cachedClaimsWatermarkSec, nowSec);
    log("info", "relay_connected", { relay: url });
    log("info", "relay_subscribe", {
      relay: url,
      kinds: [30331],
      since: signalsSinceCreatedAt,
    });
    ws.send(
      JSON.stringify([
        "REQ",
        "sr_live",
        { kinds: [30331], "#t": ["satsrover"], since: signalsSinceCreatedAt },
      ]),
    );
    log("info", "relay_subscribe", {
      relay: url,
      lane: CLAIMS_LANE,
      sub: "sr_claims",
      kinds: [CLAIMS_KIND],
      since: claimsSinceCreatedAt,
    });
    ws.send(
      JSON.stringify([
        "REQ",
        "sr_claims",
        {
          kinds: [CLAIMS_KIND],
          "#t": ["satsrover-claim"],
          "#v": ["2"],
          since: claimsSinceCreatedAt,
        },
      ]),
    );
  });

  ws.on("message", async (data: any) => {
    eventsSeen += 1;
    let parsed = false;
    try {
      const nowMs = Date.now();
      const msg = JSON.parse(data.toString());
      parsed = true;
      eventsParsedOk += 1;
      const envelope = validateInboundEnvelope(msg);
      if (envelope.kind === "ignore") {
        return;
      }
      if (envelope.kind === "drop") {
        eventsRejectedTotal.labels(envelope.reason, "missing", "missing").inc();
        if (envelope.reason === "invalid_ws_frame_shape") {
          dropsInvalidWsFrameShape += 1;
        } else if (envelope.reason === "invalid_event_frame_shape") {
          dropsInvalidEventFrameShape += 1;
        } else if (envelope.reason === "missing_event_object") {
          dropsMissingEventObject += 1;
        }
        recordDropped(url, envelope.reason, "relay_fault", nowMs);
        maybeLogDrop({
          msg: "event_dropped_relay_fault",
          reason: envelope.reason,
          pubkey: undefined,
          eventId: undefined,
          relay: url,
        });
        return;
      }
      if (envelope.kind === "event") {
        const event = envelope.event;
        const kindLabel = getEventKindLabel(event);
        const versionLabel = getEventVersionLabel(event);
        if (event?.kind === CLAIMS_KIND) {
          claimsSeenTotal.labels(CLAIMS_LANE).inc();
          const nowSec = Math.floor(nowMs / 1000);
          const claimsValidation = validateClaimsEventStrict(event, nowSec);
          if (!claimsValidation.ok) {
            claimsRejectedTotal
              .labels(CLAIMS_LANE, claimsValidation.reason)
              .inc();
            log("warn", "claims_event_rejected", {
              relay: url,
              eventId: claimsValidation.eventId || "unknown",
              reason: claimsValidation.reason,
            });
            return;
          }
          const claimsUpsertResult = await reduceClaimEvent(pool, {
            pubkey: claimsValidation.pubkey,
            d: claimsValidation.d,
            placeId: claimsValidation.placeId,
            role: claimsValidation.role,
            createdAt: claimsValidation.createdAt,
            eventId: claimsValidation.eventId,
            content: claimsValidation.content,
          });
          claimsUpsertTotal.labels(CLAIMS_LANE, claimsUpsertResult).inc();
          if (claimsUpsertResult !== "ignored") {
            await upsertWatermarkMonotonic(
              pool,
              CLAIMS_WATERMARK_KEY,
              claimsValidation.createdAt,
            );
            const previousClaimsWatermark = cachedClaimsWatermarkSec;
            cachedClaimsWatermarkSec = Math.max(
              cachedClaimsWatermarkSec,
              claimsValidation.createdAt,
            );
            watermarkValue.labels(CLAIMS_LANE).set(cachedClaimsWatermarkSec);
            if (cachedClaimsWatermarkSec > previousClaimsWatermark) {
              watermarkUpdatesTotal.labels(CLAIMS_LANE).inc();
            }
          }
          return;
        }
        eventsReceivedTotal
          .labels(url, kindLabel, versionLabel)
          .inc();
        const stats = getRelayStats(url);
        refreshRelayHealthWindow(stats, nowMs);
        const prefilter = shouldProcessEvent(event);
        if (!prefilter.ok) {
          const reason = prefilter.reason || "prefilter_rejected";
          eventsRejectedTotal.labels(reason, kindLabel, versionLabel).inc();
          if (reason === "invalid_event_id_hex") dropsInvalidIdHex += 1;
          if (reason === "invalid_pubkey_hex") dropsInvalidPubkeyHex += 1;
          if (reason === "missing_place_tag" || reason === "empty_place_tag") {
            dropsMissingPlace += 1;
          }
          if (reason === "place_tag_too_long") dropsPlaceTooLong += 1;
          if (reason === "too_many_tags") dropsTooManyTags += 1;
          if (reason === "content_too_large") dropsContentTooLarge += 1;
          recordDropped(url, reason, "guard", nowMs);
          maybeLogDrop({
            msg: "event_dropped_prefilter",
            reason,
            pubkey: prefilter.pubkey,
            eventId: prefilter.eventId,
            relay: url,
          });
          return;
        }
        if (isDuplicateEventId(prefilter.eventId!, nowMs)) {
          const reason = "duplicate_event_id";
          eventsRejectedTotal.labels(reason, kindLabel, versionLabel).inc();
          dbConflictTotal.labels("duplicate_event_id").inc();
          dropsDuplicateEventId += 1;
          recordDropped(url, reason, "guard", nowMs);
          maybeLogDrop({
            msg: "event_dropped_prefilter",
            reason,
            pubkey: prefilter.pubkey,
            eventId: prefilter.eventId,
            relay: url,
          });
          return;
        }
        const nowSec = Math.floor(nowMs / 1000);
        const verificationGate = passesVerificationGate(event, nowSec);
        if (!verificationGate.ok) {
          const reason = verificationGate.reason;
          eventsRejectedTotal.labels(reason, kindLabel, versionLabel).inc();
          if (reason === "invalid_kind") dropsInvalidKind += 1;
          else if (reason === "disallowed_kind") dropsDisallowedKind += 1;
          else if (reason === "invalid_created_at") dropsInvalidCreatedAt += 1;
          else if (reason === "created_at_out_of_range") {
            dropsCreatedAtOutOfRange += 1;
          } else if (reason === "invalid_tags_shape") {
            dropsInvalidTagsShape += 1;
          } else if (reason === "tag_value_too_long") {
            dropsTagValueTooLong += 1;
          } else if (reason === "tags_scan_limit_exceeded") {
            dropsTagsScanLimitExceeded += 1;
          }
          recordDropped(url, reason, "guard", nowMs);
          maybeLogDrop({
            msg: "event_dropped_prefilter",
            reason,
            pubkey: prefilter.pubkey,
            eventId: prefilter.eventId,
            relay: url,
          });
          return;
        }
        verificationGatePassed += 1;
        const sigGate = passesSignaturePrereqGate(event);
        if (!sigGate.ok) {
          const reason = sigGate.reason;
          eventsRejectedTotal.labels(reason, kindLabel, versionLabel).inc();
          if (reason === "missing_sig") dropsMissingSig += 1;
          if (reason === "invalid_sig_hex") dropsInvalidSigHex += 1;
          recordDropped(url, reason, "guard", nowMs);
          maybeLogDrop({
            msg: "event_dropped_prefilter",
            reason,
            pubkey: prefilter.pubkey,
            eventId: prefilter.eventId,
            relay: url,
          });
          return;
        }

        if (stats.quarantinedUntilMs > nowMs) {
          const reason = "relay_quarantined";
          eventsRejectedTotal.labels(reason, kindLabel, versionLabel).inc();
          recordDropped(url, reason, "guard", nowMs);
          maybeLogDrop({
            msg: "event_dropped_quarantined",
            reason,
            pubkey: prefilter.pubkey,
            eventId: prefilter.eventId,
            relay: url,
          });
          return;
        }
        if (!isRelayWithinRateLimit(url, nowMs)) {
          const reason = "relay_rate_limited";
          eventsRejectedTotal.labels(reason, kindLabel, versionLabel).inc();
          recordDropped(url, reason, "guard", nowMs);
          stats.rateLimited += 1;
          maybeLogDrop({
            msg: "event_dropped_rate_limited",
            reason,
            pubkey: prefilter.pubkey,
            eventId: prefilter.eventId,
            relay: url,
          });
          return;
        }
        if (!isPubkeyWithinRateLimit(prefilter.pubkey!, nowMs)) {
          const reason = "pubkey_rate_limited";
          eventsRejectedTotal.labels(reason, kindLabel, versionLabel).inc();
          recordDropped(url, reason, "guard", nowMs);
          stats.pubkeyLimited += 1;
          maybeLogDrop({
            msg: "event_dropped_rate_limited",
            reason,
            pubkey: prefilter.pubkey,
            eventId: prefilter.eventId,
            relay: url,
          });
          return;
        }
        expensivePathAttempts += 1;
        if (!tryConsumeGlobalToken(nowMs)) {
          const reason = "verification_budget_exhausted";
          eventsRejectedTotal.labels(reason, kindLabel, versionLabel).inc();
          expensivePathSkippedByBudget += 1;
          recordDropped(url, reason, "guard", nowMs);
          stats.budgetDropped += 1;
          maybeLogDrop({
            msg: "event_dropped_budget",
            reason,
            pubkey: prefilter.pubkey,
            eventId: prefilter.eventId,
            relay: url,
          });
          return;
        }
        sigverifyAttempts += 1;
        if (!tryConsumeSigverifyToken(nowMs)) {
          const reason = "sigverify_budget_exhausted";
          eventsRejectedTotal.labels(reason, kindLabel, versionLabel).inc();
          sigverifyBudgetDrops += 1;
          recordDropped(url, reason, "guard", nowMs);
          maybeLogDrop({
            msg: "event_dropped_budget",
            reason,
            pubkey: prefilter.pubkey,
            eventId: prefilter.eventId,
            relay: url,
          });
          return;
        }
        sigverifyInvoked += 1;
        const signatureVerification = verifyEventSignature(event);
        if (!signatureVerification.ok) {
          const reason = signatureVerification.reason;
          eventsRejectedTotal.labels(reason, kindLabel, versionLabel).inc();
          if (reason === "sigverify_invalid_id") {
            sigverifyFailedInvalidId += 1;
          } else {
            sigverifyFailedInvalidSig += 1;
          }
          recordDropped(url, reason, "guard", nowMs);
          maybeLogDrop({
            msg: "event_dropped_prefilter",
            reason,
            pubkey: prefilter.pubkey,
            eventId: prefilter.eventId,
            relay: url,
          });
          return;
        }
        sigverifyPassed += 1;

        if (kindLabel === String(SIGNALS_KIND) && versionLabel === "2") {
          signalsV2SeenTotal.labels(SIGNALS_LANE).inc();
          const parsedV2 = parseSignalsV2EventStrict(event, nowSec);
          if (!parsedV2.ok) {
            signalsV2RejectedTotal
              .labels(SIGNALS_LANE, parsedV2.reason)
              .inc();
            log("warn", "signals_v2_rejected", {
              relay: url,
              eventId: parsedV2.eventId || prefilter.eventId || "unknown",
              reason: parsedV2.reason,
            });
            return;
          }

          expensivePathInvoked += 1;
          recordAccepted(url, nowMs);
          eventsAcceptedTotal.labels(kindLabel, versionLabel).inc();
          const reduceResult = await reduceSignalsV2Event(pool, url, parsedV2);
          signalsV2UpsertTotal.labels(SIGNALS_LANE, reduceResult).inc();
          if (reduceResult !== "ignored") {
            await upsertWatermarkMonotonic(
              pool,
              SIGNALS_WATERMARK_KEY,
              parsedV2.createdAt,
            );
            const previousWatermark = cachedSignalsWatermarkSec;
            cachedSignalsWatermarkSec = Math.max(
              cachedSignalsWatermarkSec,
              parsedV2.createdAt,
            );
            watermarkValue.labels(SIGNALS_LANE).set(cachedSignalsWatermarkSec);
            if (cachedSignalsWatermarkSec > previousWatermark) {
              watermarkUpdatesTotal.labels(SIGNALS_LANE).inc();
            }
            log("info", "signals_v2_state_upsert", {
              relay: url,
              placeId: parsedV2.placeId,
              status: parsedV2.status,
              result: reduceResult,
            });
          }
          return;
        }

        if (kindLabel === "30331" && versionLabel === "2") {
          v2SeenTotal.labels(SIGNALS_LANE).inc();
          const softV2 = validateSignalsV2Soft(event);
          for (const reason of softV2.reasons) {
            v2SoftInvalidTotal.labels(SIGNALS_LANE, reason).inc();
          }
          for (const tag of softV2.unknownTags) {
            v2SoftUnknownTagTotal.labels(SIGNALS_LANE, tag).inc();
          }
          if (softV2.firstReason) {
            log("warn", "v2_soft_validation_failed", {
              relay: url,
              url,
              eventId: prefilter.eventId,
              reason: softV2.firstReason,
            });
          }
        }

        expensivePathInvoked += 1;
        recordAccepted(url, nowMs);
        eventsAcceptedTotal.labels(kindLabel, versionLabel).inc();
        const result = await processSatsRoverEvent(pool, event);
        await upsertWatermarkMonotonic(pool, SIGNALS_WATERMARK_KEY, event.created_at);
        const previousWatermark = cachedSignalsWatermarkSec;
        cachedSignalsWatermarkSec = Math.max(cachedSignalsWatermarkSec, event.created_at);
        watermarkValue.labels(SIGNALS_LANE).set(cachedSignalsWatermarkSec);
        if (cachedSignalsWatermarkSec > previousWatermark) {
          watermarkUpdatesTotal.labels(SIGNALS_LANE).inc();
        }
        if (result) {
          log("info", "signal_ingested", {
            relay: url,
            placeId: result.placeId,
            status: result.status,
          });
        }
      }
    } catch (e: any) {
      if (!parsed) {
        eventsParsedFail += 1;
        dropsInvalidWsJson += 1;
        const nowMs = Date.now();
        eventsRejectedTotal.labels("invalid_ws_json", "missing", "missing").inc();
        recordDropped(url, "invalid_ws_json", "relay_fault", nowMs);
        maybeLogDrop({
          msg: "event_dropped_relay_fault",
          reason: "invalid_ws_json",
          pubkey: undefined,
          eventId: undefined,
          relay: url,
        });
      } else {
        log("error", "relay_message_handler_error", {
          relay: url,
          error: e?.message || String(e),
        });
        return;
      }
      return;
    }
  });

  ws.on("close", () => {
    relayConnected.labels(url).set(0);
    wsReconnectTotal.labels(url).inc();
    log("warn", "relay_disconnected", { relay: url, retryInMs: 5000 });
    setTimeout(() => connect(url), 5000);
  });

  ws.on("error", (err: any) => {
    relayConnected.labels(url).set(0);
    log("error", "relay_error", {
      relay: url,
      error: err?.message || String(err),
    });
  });
}

log("info", "indexer_start", { relayCount: RELAYS.length });
startMetricsServer(METRICS_PORT);
startStatsTimerIfNeeded();
// Delay relay connects until ingestion_state init attempt finishes to avoid
// early watermark SELECT failures during startup.
ensureIngestionStateTable(pool)
  .then(() =>
    ensureClaimsTable(pool).catch((err: any) => {
      log("error", "claims_table_init_failed", {
        error: err?.message || String(err),
      });
      throw err;
    }),
  )
  .then(() =>
    ensureSignalsV2Tables(pool).catch((err: any) => {
      log("error", "signals_v2_table_init_failed", {
        error: err?.message || String(err),
      });
      throw err;
    }),
  )
  .then(() =>
    Promise.all([
      getWatermark(pool, SIGNALS_WATERMARK_KEY),
      getWatermark(pool, CLAIMS_WATERMARK_KEY),
    ]),
  )
  .then(([signalsWatermarkSec, claimsWatermarkSec]) => {
    cachedSignalsWatermarkSec = signalsWatermarkSec;
    cachedClaimsWatermarkSec = claimsWatermarkSec;
    watermarkValue.labels(SIGNALS_LANE).set(cachedSignalsWatermarkSec);
    watermarkValue.labels(CLAIMS_LANE).set(cachedClaimsWatermarkSec);
    if (signalsWatermarkSec === 0) {
      log("warn", "watermark_zero_after_init", {
        key: SIGNALS_WATERMARK_KEY,
      });
    }
  })
  .catch((err: any) => {
    log("error", "ingestion_state_init_failed", {
      error: err?.message || String(err),
    });
    cachedSignalsWatermarkSec = 0;
    cachedClaimsWatermarkSec = 0;
    watermarkValue.labels(SIGNALS_LANE).set(cachedSignalsWatermarkSec);
    watermarkValue.labels(CLAIMS_LANE).set(cachedClaimsWatermarkSec);
  })
  .finally(() => {
    RELAYS.forEach(connect);
  });

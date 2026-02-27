import { WebSocket } from "ws";
import { Pool } from "pg";
import dotenv from "dotenv";
import { processSatsRoverEvent } from "./importer.js";

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
const PREFILTER_MAX_PLACE_ID_LENGTH = 200;
const PREFILTER_MAX_CONTENT_BYTES = 8 * 1024;
const PREFILTER_MAX_TAGS = 200;
const DROP_LOG_DEDUPE_MAX_KEYS = 5000;
const PUBKEY_WINDOW_MS = 60_000;
const PUBKEY_MAX_EVENTS_PER_WINDOW = 30;
const PUBKEY_LIMITER_MAX_KEYS = 20_000;
const GLOBAL_BUDGET_TOKENS_PER_SEC = 200;
const GLOBAL_BUDGET_BURST_TOKENS = 400;
const RELAY_WINDOW_MS = 10_000;
const RELAY_MAX_EVENTS_PER_WINDOW = 120;
const RELAY_LIMITER_MAX_KEYS = 2000;

const dropLogDedupe = new Set<string>();
const pubkeyLimiter = new Map<
  string,
  { windowStartMs: number; count: number }
>();
const relayLimiter = new Map<string, { windowStartMs: number; count: number }>();
let globalTokens = GLOBAL_BUDGET_BURST_TOKENS;
let globalLastRefillMs = Date.now();
let budgetTokenDrops = 0;
let budgetTokenConsumes = 0;
let statsTimerStarted = false;

type RelayStats = {
  accepted: number;
  dropped: number;
  rateLimited: number;
  pubkeyLimited: number;
  budgetDropped: number;
  droppedByReason: Record<string, number>;
};
const relayStats = new Map<string, RelayStats>();

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
    droppedByReason: {},
  };
  relayStats.set(relay, created);
  return created;
}

function recordDropped(relay: string, reason: string): void {
  const stats = getRelayStats(relay);
  stats.dropped += 1;
  stats.droppedByReason[reason] = (stats.droppedByReason[reason] || 0) + 1;
}

function recordAccepted(relay: string): void {
  const stats = getRelayStats(relay);
  stats.accepted += 1;
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

function shouldProcessEvent(event: any): {
  ok: boolean;
  reason?: string;
  pubkey?: string;
  eventId?: string;
} {
  if (!event || typeof event !== "object") {
    return { ok: false, reason: "invalid_event_shape" };
  }
  const eventId = typeof event.id === "string" ? event.id : undefined;
  const pubkey = typeof event.pubkey === "string" ? event.pubkey : undefined;
  if (!eventId) {
    return { ok: false, reason: "missing_event_id", pubkey, eventId };
  }
  if (!pubkey) {
    return { ok: false, reason: "missing_pubkey", pubkey, eventId };
  }

  const tags = Array.isArray(event.tags) ? event.tags : null;
  if (!tags) {
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

function maybeLogDrop(opts: {
  msg:
    | "event_dropped_prefilter"
    | "event_dropped_rate_limited"
    | "event_dropped_budget";
  reason: string;
  pubkey: string | undefined;
  eventId: string | undefined;
  relay: string;
}): void {
  const { msg, reason, pubkey, eventId, relay } = opts;
  const dedupeKey = `${msg}:${reason}:${pubkey || "unknown"}`;
  if (!rememberDropLogKey(dedupeKey)) return;
  log("warn", msg, {
    reason,
    pubkey: pubkey || "unknown",
    eventId: eventId || "unknown",
    relay,
  });
}

function startStatsTimerIfNeeded(): void {
  if (statsTimerStarted) return;
  statsTimerStarted = true;
  setInterval(() => {
    for (const [relay, stats] of relayStats.entries()) {
      log("info", "relay_ingest_stats", {
        relay,
        accepted: stats.accepted,
        dropped: stats.dropped,
        rateLimited: stats.rateLimited,
        pubkeyLimited: stats.pubkeyLimited,
        budgetDropped: stats.budgetDropped,
        droppedByReason: stats.droppedByReason,
      });
    }
    log("info", "global_budget_stats", {
      tokens: Math.round(globalTokens),
      consumes: budgetTokenConsumes,
      drops: budgetTokenDrops,
      tokensPerSec: GLOBAL_BUDGET_TOKENS_PER_SEC,
      burstTokens: GLOBAL_BUDGET_BURST_TOKENS,
    });
  }, 60_000);
}

function connect(url: string) {
  const ws = new WebSocket(url);

  ws.on("open", () => {
    log("info", "relay_connected", { relay: url });
    ws.send(
      JSON.stringify([
        "REQ",
        "sr_live",
        { kinds: [1, 30331], "#t": ["satsrover"] },
      ]),
    );
  });

  ws.on("message", async (data: any) => {
    try {
      const msg = JSON.parse(data.toString());
      if (msg[0] === "EVENT") {
        const event = msg[2];
        const prefilter = shouldProcessEvent(event);
        if (!prefilter.ok) {
          const reason = prefilter.reason || "prefilter_rejected";
          recordDropped(url, reason);
          maybeLogDrop({
            msg: "event_dropped_prefilter",
            reason,
            pubkey: prefilter.pubkey,
            eventId: prefilter.eventId,
            relay: url,
          });
          return;
        }

        const nowMs = Date.now();
        if (!isRelayWithinRateLimit(url, nowMs)) {
          const reason = "relay_rate_limited";
          recordDropped(url, reason);
          getRelayStats(url).rateLimited += 1;
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
          recordDropped(url, reason);
          getRelayStats(url).pubkeyLimited += 1;
          maybeLogDrop({
            msg: "event_dropped_rate_limited",
            reason,
            pubkey: prefilter.pubkey,
            eventId: prefilter.eventId,
            relay: url,
          });
          return;
        }
        if (!tryConsumeGlobalToken(nowMs)) {
          const reason = "verification_budget_exhausted";
          recordDropped(url, reason);
          getRelayStats(url).budgetDropped += 1;
          maybeLogDrop({
            msg: "event_dropped_budget",
            reason,
            pubkey: prefilter.pubkey,
            eventId: prefilter.eventId,
            relay: url,
          });
          return;
        }

        recordAccepted(url);
        const result = await processSatsRoverEvent(pool, event);
        if (result) {
          log("info", "signal_ingested", {
            relay: url,
            placeId: result.placeId,
            status: result.status,
          });
        }
      }
    } catch (e: any) {
      log("error", "relay_message_parse_error", {
        relay: url,
        error: e?.message || String(e),
        raw: String(data).slice(0, 300),
      });
    }
  });

  ws.on("close", () => {
    log("warn", "relay_disconnected", { relay: url, retryInMs: 5000 });
    setTimeout(() => connect(url), 5000);
  });

  ws.on("error", (err: any) =>
    log("error", "relay_error", {
      relay: url,
      error: err?.message || String(err),
    }),
  );
}

log("info", "indexer_start", { relayCount: RELAYS.length });
startStatsTimerIfNeeded();
RELAYS.forEach(connect);

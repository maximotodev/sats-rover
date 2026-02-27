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
const RELAY_HEALTH_WINDOW_MS = 60_000;
const RELAY_HEALTH_MIN_SAMPLE = 200;
const RELAY_HEALTH_DROP_RATIO_THRESHOLD = 0.9;
const RELAY_QUARANTINE_MS = 5 * 60_000;
const SEEN_EVENT_TTL_MS = 10 * 60_000;
const SEEN_EVENT_MAX_KEYS = 200_000;
const SEEN_EVENT_SWEEP_INTERVAL = 1000;

const dropLogDedupe = new Set<string>();
const pubkeyLimiter = new Map<
  string,
  { windowStartMs: number; count: number }
>();
const relayLimiter = new Map<string, { windowStartMs: number; count: number }>();
const seenEventIds = new Map<string, number>();
let globalTokens = GLOBAL_BUDGET_BURST_TOKENS;
let globalLastRefillMs = Date.now();
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

function sweepSeenEventIds(nowMs: number): void {
  for (const [eventId, seenAt] of seenEventIds.entries()) {
    if (nowMs - seenAt >= SEEN_EVENT_TTL_MS) {
      seenEventIds.delete(eventId);
    }
  }
  if (seenEventIds.size > SEEN_EVENT_MAX_KEYS) {
    seenEventIds.clear();
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
        const stats = getRelayStats(url);
        refreshRelayHealthWindow(stats, nowMs);
        const prefilter = shouldProcessEvent(event);
        if (!prefilter.ok) {
          const reason = prefilter.reason || "prefilter_rejected";
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

        if (stats.quarantinedUntilMs > nowMs) {
          const reason = "relay_quarantined";
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
        if (!tryConsumeGlobalToken(nowMs)) {
          const reason = "verification_budget_exhausted";
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

        recordAccepted(url, nowMs);
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
      if (!parsed) {
        eventsParsedFail += 1;
        dropsInvalidWsJson += 1;
        const nowMs = Date.now();
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

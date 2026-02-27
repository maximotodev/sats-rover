// apps/indexer/src/importer.ts
import { Pool } from "pg";
import { verifyEvent, type Event } from "nostr-tools";

const CANONICAL_PLACE_ID =
  /^(osm:(node|way|relation):\d+|btcmap:[a-zA-Z0-9:_-]+|manual:[a-zA-Z0-9_-]+|sr:[a-zA-Z0-9:_-]+)$/;
const LEGACY_DIGITS_ONLY_PLACE_ID = /^\d+$/;
const MAX_LOG_DEDUPE_KEYS = 5000;
const MAX_RESOLUTION_CACHE_KEYS = 5000;

const warnedNonCanonicalPlaceIds = new Set<string>();
const loggedNormalizedPlaceIds = new Set<string>();
const resolvedLegacyPlaceIds = new Map<string, string>();
const unresolvedLegacyPlaceIds = new Set<string>();

let resolutionCacheHit = 0;
let resolutionCacheMiss = 0;
let resolutionNegativeCacheHit = 0;
let resolutionDbHit = 0;
let resolutionDbMiss = 0;
let resolutionNormalized = 0;
let resolutionRejected = 0;
let resolutionProcessedEvents = 0;

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

function isValidHex64(v: string | undefined): boolean {
  return !!v && /^[0-9a-f]{64}$/.test(v);
}

export type PlaceIdAnalysis =
  | { type: "canonical"; id: string }
  | { type: "needs_db_lookup"; candidates: string[] }
  | { type: "reject" };

export function analyzePlaceId(raw: string): PlaceIdAnalysis {
  if (raw.includes(":") && CANONICAL_PLACE_ID.test(raw)) {
    return { type: "canonical", id: raw };
  }
  if (LEGACY_DIGITS_ONLY_PLACE_ID.test(raw)) {
    return {
      type: "needs_db_lookup",
      candidates: [`btcmap:node:${raw}`, `osm:node:${raw}`],
    };
  }
  return { type: "reject" };
}

function rememberUniqueKey(keys: Set<string>, key: string): boolean {
  if (keys.has(key)) return false;
  if (keys.size >= MAX_LOG_DEDUPE_KEYS) {
    keys.clear();
  }
  keys.add(key);
  return true;
}

function rememberResolvedLegacyPlaceId(raw: string, canonical: string): void {
  if (resolvedLegacyPlaceIds.size >= MAX_RESOLUTION_CACHE_KEYS) {
    resolvedLegacyPlaceIds.clear();
  }
  resolvedLegacyPlaceIds.set(raw, canonical);
}

function rememberUnresolvedLegacyPlaceId(raw: string): void {
  if (unresolvedLegacyPlaceIds.size >= MAX_RESOLUTION_CACHE_KEYS) {
    unresolvedLegacyPlaceIds.clear();
  }
  unresolvedLegacyPlaceIds.add(raw);
}

async function canonicalizePlaceId(
  pool: Pool,
  raw: string,
): Promise<{ canonical: string; didNormalize: boolean } | null> {
  const analysis = analyzePlaceId(raw);
  if (analysis.type === "canonical") {
    return { canonical: analysis.id, didNormalize: false };
  }
  if (analysis.type === "reject") {
    resolutionRejected += 1;
    return null;
  }
  if (analysis.type === "needs_db_lookup") {
    const cachedCanonical = resolvedLegacyPlaceIds.get(raw);
    if (typeof cachedCanonical === "string") {
      resolutionCacheHit += 1;
      return { canonical: cachedCanonical, didNormalize: true };
    }
    if (unresolvedLegacyPlaceIds.has(raw)) {
      resolutionNegativeCacheHit += 1;
      return null;
    }
    resolutionCacheMiss += 1;

    const resolved = await pool.query<{ id: string }>(
      `
        SELECT id
        FROM places
        WHERE id = ANY($1::text[])
        ORDER BY array_position($1::text[], id)
        LIMIT 1
      `,
      [analysis.candidates],
    );
    const canonical = resolved.rows[0]?.id;
    if (typeof canonical === "string" && CANONICAL_PLACE_ID.test(canonical)) {
      resolutionDbHit += 1;
      resolutionNormalized += 1;
      rememberResolvedLegacyPlaceId(raw, canonical);
      return { canonical, didNormalize: true };
    }
    resolutionDbMiss += 1;
    resolutionRejected += 1;
    rememberUnresolvedLegacyPlaceId(raw);
    return null;
  }

  return null;
}

export async function processSatsRoverEvent(pool: Pool, event: Event) {
  resolutionProcessedEvents += 1;
  try {
    if (!verifyEvent(event)) return null;
    if (!isValidHex64(event.id) || !isValidHex64(event.pubkey)) {
      log("warn", "invalid_event_identity", {
        eventId: event.id,
        pubkey: event.pubkey,
      });
      return null;
    }

    const rawPlaceId = event.tags.find((t: string[]) => t[0] === "place")?.[1];
    if (!rawPlaceId) return null;
    const canonicalPlace = await canonicalizePlaceId(pool, rawPlaceId);
    if (!canonicalPlace) {
      if (rememberUniqueKey(warnedNonCanonicalPlaceIds, rawPlaceId)) {
        log("warn", "non_canonical_place_id", {
          placeId: rawPlaceId,
          eventId: event.id,
        });
      }
      return null;
    }
    const placeId = canonicalPlace.canonical;
    if (
      canonicalPlace.didNormalize &&
      rememberUniqueKey(loggedNormalizedPlaceIds, rawPlaceId)
    ) {
      log("info", "place_id_normalized", {
        rawPlaceId,
        canonicalPlaceId: placeId,
        eventId: event.id,
      });
    }

    const status =
      event.tags.find((t: string[]) => t[0] === "status")?.[1] || "did_not_try";

    const boost =
      status === "success" ? 0.05 : status === "failed" ? -0.02 : 0.01;
    const signalDate = new Date(event.created_at * 1000)
      .toISOString()
      .split("T")[0];

    const query = `
      WITH target_place AS (
        SELECT id FROM places WHERE id = $3
      ),
      inserted_signal AS (
        INSERT INTO signals (event_id, pubkey, place_id, status, created_at, signal_date)
        SELECT $1, $2, id, $4, to_timestamp($5), $6 FROM target_place
        ON CONFLICT DO NOTHING
        RETURNING place_id
      )
      UPDATE places
      SET glow_score = LEAST(1.0, GREATEST(0.1, glow_score + $7)),
          last_activity_at = now()
      WHERE id IN (SELECT place_id FROM inserted_signal);
    `;

    const res = await pool.query(query, [
      event.id,
      event.pubkey,
      placeId,
      status,
      event.created_at,
      signalDate,
      boost,
    ]);

    if (res.rowCount && res.rowCount > 0) {
      await pool.query(
        `
          UPDATE checkin_submissions
          SET status = 'confirmed', confirmed_at = now()
          WHERE event_id = $1 AND status = 'pending'
        `,
        [event.id],
      );
      return { placeId, status };
    }

    await pool.query(
      `
        UPDATE checkin_submissions
        SET status = 'confirmed', confirmed_at = now()
        WHERE event_id = $1 AND status = 'pending'
      `,
      [event.id],
    );
    return null;
  } catch (err: any) {
    if (err.code === "23505") {
      log("warn", "signal_duplicate_ignored", {
        eventId: event?.id,
      });
      return null;
    }
    if (err.code === "23503") {
      log("warn", "signal_foreign_key_rejected", {
        eventId: event?.id,
        placeId: event?.tags?.find?.((t: string[]) => t[0] === "place")?.[1],
      });
      return null;
    }
    log("error", "importer_error", {
      error: err.message || String(err),
      eventId: event?.id,
    });
    return null;
  } finally {
    if (resolutionProcessedEvents % 1000 === 0) {
      log("info", "place_id_resolution_metrics", {
        processedEvents: resolutionProcessedEvents,
        resolutionCacheHit,
        resolutionCacheMiss,
        resolutionNegativeCacheHit,
        resolutionDbHit,
        resolutionDbMiss,
        resolutionNormalized,
        resolutionRejected,
      });
    }
  }
}

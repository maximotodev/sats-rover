// apps/indexer/src/importer.ts
import { Pool } from "pg";
import { verifyEvent, type Event } from "nostr-tools";

const CANONICAL_PLACE_ID =
  /^(osm:(node|way|relation):\d+|btcmap:[a-zA-Z0-9:_-]+|manual:[a-zA-Z0-9_-]+|sr:[a-zA-Z0-9:_-]+)$/;
const LEGACY_DIGITS_ONLY_PLACE_ID = /^\d+$/;
const MAX_LOG_DEDUPE_KEYS = 5000;

const warnedNonCanonicalPlaceIds = new Set<string>();
const loggedNormalizedPlaceIds = new Set<string>();

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

function rememberUniqueKey(keys: Set<string>, key: string): boolean {
  if (keys.has(key)) return false;
  if (keys.size >= MAX_LOG_DEDUPE_KEYS) {
    keys.clear();
  }
  keys.add(key);
  return true;
}

function canonicalizePlaceId(
  raw: string,
): { canonical: string; didNormalize: boolean } | null {
  // Keep canonical tagged IDs exactly as they came in.
  if (raw.includes(":") && CANONICAL_PLACE_ID.test(raw)) {
    return { canonical: raw, didNormalize: false };
  }

  // Legacy format: bare digits mapped to btcmap node IDs.
  if (LEGACY_DIGITS_ONLY_PLACE_ID.test(raw)) {
    return { canonical: `btcmap:node:${raw}`, didNormalize: true };
  }

  return null;
}

export async function processSatsRoverEvent(pool: Pool, event: Event) {
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
    const canonicalPlace = canonicalizePlaceId(rawPlaceId);
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
  }
}

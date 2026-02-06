import { Pool } from "pg";
import { verifyEvent, type Event } from "nostr-tools";

export async function processSatsRoverEvent(pool: Pool, event: Event) {
  try {
    if (!verifyEvent(event)) return null;

    const rawPlaceId = event.tags.find((t: string[]) => t[0] === "place")?.[1];
    if (!rawPlaceId) return null;

    const placeId = /^\d+$/.test(rawPlaceId)
      ? `btcmap:node:${rawPlaceId}`
      : rawPlaceId;
    const status =
      event.tags.find((t: string[]) => t[0] === "status")?.[1] || "checkin";
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
        ON CONFLICT (event_id) DO NOTHING
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
    return res.rowCount && res.rowCount > 0 ? { placeId, status } : null;
  } catch (err: any) {
    if (err.code === "23503") return null;
    console.error(`[Importer] Error:`, err.message || err);
    return null;
  }
}

import type { Pool, PoolClient, QueryResult } from "pg";

export type SignalsV2Status = "success" | "failed" | "did_not_try";

export type SignalsV2StateRow = {
  pubkey: string;
  placeId: string;
  dayUtc: number;
  status: SignalsV2Status;
  createdAt: number;
  eventId: string;
  g: string | null;
  client: string | null;
  amountMsat: bigint | null;
  zap: string | null;
  bolt11: string | null;
  content: string;
};

type DbLike = Pool | PoolClient;

export function shouldReplaceSignalsV2State(
  existing: SignalsV2StateRow,
  incoming: SignalsV2StateRow,
): boolean {
  if (incoming.createdAt > existing.createdAt) return true;
  if (incoming.createdAt < existing.createdAt) return false;
  return incoming.eventId > existing.eventId;
}

export function applySignalsV2StateRows(
  rows: SignalsV2StateRow[],
): SignalsV2StateRow[] {
  const byKey = new Map<string, SignalsV2StateRow>();
  for (const row of rows) {
    const key = `${row.pubkey}|${row.placeId}|${row.dayUtc}`;
    const existing = byKey.get(key);
    if (!existing || shouldReplaceSignalsV2State(existing, row)) {
      byKey.set(key, row);
    }
  }
  return Array.from(byKey.values());
}

export async function upsertSignalsV2StateRow(
  db: DbLike,
  row: SignalsV2StateRow,
): Promise<"inserted" | "updated" | "ignored"> {
  const reduced: QueryResult<{ inserted: boolean }> = await db.query(
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
      row.pubkey,
      row.placeId,
      row.dayUtc,
      row.status,
      row.createdAt,
      row.eventId,
      row.g,
      row.client,
      row.amountMsat,
      row.zap,
      row.bolt11,
      row.content,
    ],
  );

  if (reduced.rowCount === 0) return "ignored";
  return reduced.rows[0]?.inserted ? "inserted" : "updated";
}

import { Pool } from "pg";
import dotenv from "dotenv";
import { upsertSignalsV2StateRow } from "./signals_v2_state.js";

dotenv.config();

const pool = new Pool({
  connectionString:
    process.env.INDEXER_DATABASE_URL || process.env.DATABASE_URL,
});

type LedgerRow = {
  pubkey: string;
  place_id: string;
  day_utc: number;
  status: "success" | "failed" | "did_not_try";
  created_at: number;
  event_id: string;
  g: string | null;
  client: string | null;
  amount_msat: string | null;
  zap: string | null;
  bolt11: string | null;
  content: string;
};

function log(msg: string, ctx: Record<string, unknown> = {}) {
  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      level: "info",
      msg,
      service: "indexer",
      ...ctx,
    }),
  );
}

async function main() {
  const startedAt = Date.now();
  const client = await pool.connect();
  try {
    log("signals_v2_state_rebuild_started");

    const ledger = await client.query<LedgerRow>(
      `
        SELECT
          pubkey,
          place_id,
          day_utc,
          status,
          created_at,
          event_id,
          g,
          client,
          amount_msat,
          zap,
          bolt11,
          content
        FROM signals_v2_events
        ORDER BY created_at ASC, event_id ASC
      `,
    );

    const total = ledger.rowCount || 0;
    log("signals_v2_state_rebuild_rows_loaded", { total_rows: total });

    await client.query("BEGIN");
    await client.query("TRUNCATE TABLE signals_v2_state");

    let processed = 0;
    for (const row of ledger.rows) {
      await upsertSignalsV2StateRow(client, {
        pubkey: row.pubkey,
        placeId: row.place_id,
        dayUtc: row.day_utc,
        status: row.status,
        createdAt: row.created_at,
        eventId: row.event_id,
        g: row.g,
        client: row.client,
        amountMsat: row.amount_msat === null ? null : BigInt(row.amount_msat),
        zap: row.zap,
        bolt11: row.bolt11,
        content: row.content,
      });
      processed += 1;
      if (processed % 10000 === 0) {
        log("signals_v2_state_rebuild_progress", { processed_rows: processed, total_rows: total });
      }
    }

    await client.query("COMMIT");
    log("signals_v2_state_rebuild_completed", {
      processed_rows: processed,
      total_rows: total,
      duration_ms: Date.now() - startedAt,
    });
  } catch (err: any) {
    await client.query("ROLLBACK");
    console.error(
      JSON.stringify({
        ts: new Date().toISOString(),
        level: "error",
        msg: "signals_v2_state_rebuild_failed",
        service: "indexer",
        error: err?.message || String(err),
      }),
    );
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

void main();

import { Pool } from "pg";
import dotenv from "dotenv";
import { evaluateSignalsV2EventDecision } from "./signal_event_audit.js";

dotenv.config();

const pool = new Pool({
  connectionString:
    process.env.INDEXER_DATABASE_URL || process.env.DATABASE_URL,
});

function usage(): never {
  console.error("usage: EVENT_ID=<64hex> pnpm exec tsx src/audit_signal_event.ts");
  process.exit(1);
}

async function main() {
  const eventId = (process.env.EVENT_ID || process.argv[2] || "").trim();
  if (!eventId) usage();

  const client = await pool.connect();
  try {
    const submission = (
      await client.query(
        `
          SELECT event_id, pubkey, place_id, status, reason_code, raw_event
          FROM checkin_submissions
          WHERE event_id = $1
          LIMIT 1
        `,
        [eventId],
      )
    ).rows[0] as
      | {
          event_id: string;
          pubkey: string | null;
          place_id: string | null;
          status: string | null;
          reason_code: string | null;
          raw_event: unknown;
        }
      | undefined;

    const ledger = (
      await client.query(
        `
          SELECT event_id, pubkey, place_id, status, created_at, day_utc
          FROM signals_v2_events
          WHERE event_id = $1
          LIMIT 1
        `,
        [eventId],
      )
    ).rows[0] as
      | {
          event_id: string;
          pubkey: string;
          place_id: string;
          status: string;
          created_at: number;
          day_utc: number;
        }
      | undefined;

    const state = (
      await client.query(
        `
          SELECT event_id, pubkey, place_id, status, created_at, day_utc
          FROM signals_v2_state
          WHERE event_id = $1
          LIMIT 1
        `,
        [eventId],
      )
    ).rows[0] as
      | {
          event_id: string;
          pubkey: string;
          place_id: string;
          status: string;
          created_at: number;
          day_utc: number;
        }
      | undefined;

    const rawEvent =
      submission && typeof submission.raw_event === "object"
        ? (submission.raw_event as Record<string, unknown>)
        : null;
    const auditDecision = rawEvent
      ? evaluateSignalsV2EventDecision(
          rawEvent,
          Math.floor(Date.now() / 1000),
        )
      : {
          accepted: false,
          stage: "prefilter_rejected",
          reasonCode: "raw_event_missing_or_invalid_json",
          placeId: null,
          status: null,
        };

    console.log(
      JSON.stringify(
        {
          event_id: eventId,
          checkin_submission: {
            exists: Boolean(submission),
            status: submission?.status ?? null,
            reason_code: submission?.reason_code ?? null,
            place_id: submission?.place_id ?? null,
            pubkey: submission?.pubkey ?? null,
            raw_event_exists: Boolean(rawEvent),
          },
          ledger: {
            exists: Boolean(ledger),
            event_id: ledger?.event_id ?? null,
            place_id: ledger?.place_id ?? null,
            status: ledger?.status ?? null,
          },
          state: {
            exists: Boolean(state),
            event_id: state?.event_id ?? null,
            place_id: state?.place_id ?? null,
            status: state?.status ?? null,
          },
          raw_event_structural_eligibility: auditDecision,
        },
        null,
        2,
      ),
    );
  } finally {
    client.release();
    await pool.end();
  }
}

void main();

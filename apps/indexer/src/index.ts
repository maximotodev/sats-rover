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
  connectionString: process.env.INDEXER_DATABASE_URL || process.env.DATABASE_URL,
});

function log(level: "info" | "warn" | "error", msg: string, ctx: Record<string, unknown> = {}) {
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
        const result = await processSatsRoverEvent(pool, msg[2]);
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
    log("error", "relay_error", { relay: url, error: err?.message || String(err) }),
  );
}

log("info", "indexer_start", { relayCount: RELAYS.length });
RELAYS.forEach(connect);

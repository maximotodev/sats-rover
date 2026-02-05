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
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function connect(url: string) {
  const ws = new WebSocket(url);

  ws.on("open", () => {
    console.log(`[Indexer] Monitoring ${url}`);
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
        if (result)
          console.log(
            `[Indexer] 🚀 Glow Boost: ${result.placeId} (${result.status})`,
          );
      }
    } catch (e) {}
  });

  ws.on("close", () => {
    console.log(`[Indexer] Connection lost ${url}. Retrying...`);
    setTimeout(() => connect(url), 5000);
  });

  ws.on("error", (err: any) =>
    console.error(`[Indexer] ${url} error:`, err.message),
  );
}

console.log("[Indexer] Starting Live Nostr Indexer...");
RELAYS.forEach(connect);

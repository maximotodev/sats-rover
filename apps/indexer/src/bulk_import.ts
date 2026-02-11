import { Pool } from "pg";
import readline from "readline";
import { processSatsRoverEvent } from "./importer.js";
import dotenv from "dotenv";

dotenv.config();
const pool = new Pool({
  connectionString: process.env.INDEXER_DATABASE_URL || process.env.DATABASE_URL,
});
const rl = readline.createInterface({ input: process.stdin });

function log(level: "info" | "warn" | "error", msg: string, ctx: Record<string, unknown> = {}) {
  const payload = {
    ts: new Date().toISOString(),
    level,
    msg,
    service: "indexer-bulk",
    ...ctx,
  };
  const line = JSON.stringify(payload);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

rl.on("line", async (line) => {
  try {
    const event = JSON.parse(line);
    await processSatsRoverEvent(pool, event);
  } catch (e: any) {
    log("error", "bulk_import_line_error", {
      error: e?.message || String(e),
      raw: line.slice(0, 300),
    });
  }
});

rl.on("close", () => {
  log("info", "bulk_import_finished");
  process.exit(0);
});

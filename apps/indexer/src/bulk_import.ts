import { Pool } from "pg";
import readline from "readline";
import { processSatsRoverEvent } from "./importer.js";
import dotenv from "dotenv";

dotenv.config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const rl = readline.createInterface({ input: process.stdin });

rl.on("line", async (line) => {
  try {
    const event = JSON.parse(line);
    await processSatsRoverEvent(pool, event);
  } catch (e) {
    /* skip */
  }
});

rl.on("close", () => {
  console.log("[BulkImport] Finished processing signals.");
  process.exit(0);
});

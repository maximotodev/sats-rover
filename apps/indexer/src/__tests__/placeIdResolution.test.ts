import test from "node:test";
import assert from "node:assert/strict";

import { analyzePlaceId } from "../importer.js";

test("analyzePlaceId passes through canonical place_id", () => {
  const out = analyzePlaceId("btcmap:node:123");
  assert.deepEqual(out, { type: "canonical", id: "btcmap:node:123" });
});

test("analyzePlaceId emits ordered candidates for digits-only legacy IDs", () => {
  const out = analyzePlaceId("12994676519");
  assert.deepEqual(out, {
    type: "needs_db_lookup",
    candidates: ["btcmap:node:12994676519", "osm:node:12994676519"],
  });
});

test("analyzePlaceId rejects empty string", () => {
  const out = analyzePlaceId("");
  assert.deepEqual(out, { type: "reject" });
});

test("analyzePlaceId rejects junk values", () => {
  const out = analyzePlaceId("abc123");
  assert.deepEqual(out, { type: "reject" });
});

test("analyzePlaceId rejects malformed colon form", () => {
  const out = analyzePlaceId("btcmap:bad");
  assert.deepEqual(out, { type: "reject" });
});

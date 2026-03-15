import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

async function loadSource(relativePath) {
  const abs = path.join(process.cwd(), relativePath);
  return fs.readFile(abs, "utf8");
}

test("merchant route sanitizes derived place profile fields", async () => {
  const source = await loadSource("apps/web/src/app/api/merchants/route.ts");

  assert.ok(source.includes("function sanitizeProfile(raw: ProfileRecord)"));
  assert.ok(source.includes("confidenceScore:"));
  assert.ok(source.includes("freshnessLabel:"));
  assert.ok(source.includes("trustSignals:"));
});

test("merchant drawer renders place profile freshness and trust signals", async () => {
  const source = await loadSource("apps/web/src/components/map/MerchantDrawer.tsx");

  assert.ok(source.includes("Place Profile"));
  assert.ok(source.includes("merchantProfile?.freshnessLabel || \"Quiet recently\""));
  assert.ok(source.includes("merchantProfile?.confidenceLabel || \"Low confidence\""));
  assert.ok(source.includes("merchantProfile.trustSignals.map((signal) => ("));
});

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

async function loadTsModule(relativePath) {
  const abs = path.join(process.cwd(), relativePath);
  const source = await fs.readFile(abs, "utf8");
  const out = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: abs,
  });
  const dataUrl =
    "data:text/javascript;base64," +
    Buffer.from(out.outputText, "utf8").toString("base64");
  return import(dataUrl);
}

async function loadSource(relativePath) {
  const abs = path.join(process.cwd(), relativePath);
  return fs.readFile(abs, "utf8");
}

test("merchant claim tags match the v2 claims lane shape", async () => {
  const { buildMerchantClaimTags } = await loadTsModule(
    "apps/web/src/flows/signal-tags.ts",
  );
  const tags = buildMerchantClaimTags("btcmap:123");

  assert.deepEqual(tags, [
    ["t", "satsrover-claim"],
    ["t", "satsrover"],
    ["v", "2"],
    ["d", "claim:btcmap:123"],
    ["place", "btcmap:123"],
    ["role", "owner"],
    ["client", "satsrover-web"],
  ]);
});

test("claim publish path uses kind 30078 and canonical claim tags", async () => {
  const source = await loadSource("apps/web/src/hooks/use-nostr.ts");

  assert.ok(source.includes("const KIND_CLAIM = 30078;"));
  assert.ok(source.includes("event.tags = buildMerchantClaimTags(merchantId);"));
  assert.ok(source.includes("event.content = JSON.stringify({});"));
});

test("merchant drawer claim UI is canonical-read-driven and non-authoritative", async () => {
  const source = await loadSource("apps/web/src/components/map/MerchantDrawer.tsx");

  assert.match(source, /merchantClaim\?\.claimed \? "Claimed" : "Unclaimed"/);
  assert.ok(
    source.includes("Claim submitted. Awaiting canonical visibility."),
    "drawer should keep local publish success non-authoritative",
  );
  assert.ok(
    source.includes("Derived from canonical read state only. Not verified ownership."),
    "drawer should not imply verified ownership",
  );
});

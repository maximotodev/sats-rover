import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

async function loadSource(relativePath) {
  const abs = path.join(process.cwd(), relativePath);
  return fs.readFile(abs, "utf8");
}

test("map view defines local discovery filters and applies AND semantics from merchant payload fields", async () => {
  const source = await loadSource("apps/web/src/components/map/MapView.tsx");

  assert.ok(source.includes("type DiscoveryFilterKey ="));
  assert.ok(source.includes("const DEFAULT_DISCOVERY_FILTERS"));
  assert.ok(source.includes("function merchantMatchesDiscoveryFilters("));
  assert.ok(source.includes("filters.claimed && merchant.claim?.claimed !== true"));
  assert.ok(
    source.includes("merchant.profile?.recentlyActive !== true &&") &&
      source.includes("merchant.profile?.activeThisWeek !== true"),
  );
  assert.ok(
    source.includes("filters.higher_confidence && merchant.profile?.higherConfidence !== true"),
  );
  assert.ok(
    source.includes("filters.repeated_success &&") &&
      source.includes("merchant.profile?.repeatedSuccessSignals !== true"),
  );
});

test("map view uses the filtered merchant collection consistently across discovery surfaces", async () => {
  const source = await loadSource("apps/web/src/components/map/MapView.tsx");

  assert.ok(source.includes("const filteredMapMerchants = useMemo("));
  assert.ok(source.includes("renderMerchantDataToMap(map, filteredMapMerchants);"));
  assert.ok(source.includes("return filteredMapMerchants.filter("));
  assert.ok(source.includes("if (filteredMapMerchants.length === 0) return [] as Merchant[];"));
});

test("filtered render path does not rewrite source merchant state", async () => {
  const source = await loadSource("apps/web/src/components/map/MapView.tsx");

  assert.ok(source.includes("const ingestMerchantData = (merchants: Merchant[]): void => {"));
  assert.ok(source.includes("setMapMerchants(merchants);"));
  assert.ok(!source.includes("renderMerchantDataToMap(map, filteredMapMerchants);\n    setMapMerchants"));
  assert.ok(
    !source.includes("const renderMerchantDataToMap = (\n    map: maplibregl.Map,\n    merchants: Merchant[],\n  ): void => {\n    merchantsByIdRef.current = new Map(merchants.map((m) => [m.id, m]));\n    mapMerchantsRef.current = merchants;\n    setMapMerchants(merchants);"),
  );
});

test("map view renders compact filter controls and a factual empty state", async () => {
  const source = await loadSource("apps/web/src/components/map/MapView.tsx");

  assert.match(source, /Claimed/);
  assert.match(source, /Recently active/);
  assert.match(source, /Higher confidence/);
  assert.match(source, /Repeated success/);
  assert.ok(source.includes("No places match these filters in the current map area."));
  assert.ok(source.includes("Clear filters"));
  assert.ok(source.includes("Reset"));
});

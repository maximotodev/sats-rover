import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

async function loadSource(relativePath) {
  const abs = path.join(process.cwd(), relativePath);
  return fs.readFile(abs, "utf8");
}

test("merchant drawer top CTA does not expose quick Check in action", async () => {
  const source = await loadSource("apps/web/src/components/map/MerchantDrawer.tsx");
  assert.ok(!source.includes("handleQuickCheckin"), "quick check-in handler should be removed");
  assert.ok(
    !source.includes("<Zap className=\"h-4 w-4\" /> Check in"),
    "top quick Check in CTA should be removed",
  );
});

test("merchant drawer keeps Publish signal as top workflow entry CTA", async () => {
  const source = await loadSource("apps/web/src/components/map/MerchantDrawer.tsx");
  assert.ok(
    source.includes("<Signal className=\"h-4 w-4\" /> Publish signal"),
    "missing Publish signal CTA",
  );
});

test("drawer mode enum is present for coherent flow states", async () => {
  const source = await loadSource("apps/web/src/components/map/MerchantDrawer.tsx");
  assert.match(
    source,
    /type DrawerMode =[\s\S]*"idle"[\s\S]*"composing"[\s\S]*"publishing"[\s\S]*"awaiting_confirmation"[\s\S]*"confirmed"[\s\S]*"error"/,
  );
});

test("top-level workflow CTA is hidden during active composing/publishing/awaiting modes", async () => {
  const source = await loadSource("apps/web/src/components/map/MerchantDrawer.tsx");
  assert.match(
    source,
    /const showTopWorkflowAction =[\s\S]*drawerMode !== "composing"[\s\S]*drawerMode !== "publishing"[\s\S]*drawerMode !== "awaiting_confirmation"/,
  );
  assert.match(
    source,
    /\{showTopWorkflowAction && \(\s*<div className="mt-4 grid grid-cols-2 gap-2">/,
  );
});

test("composer closes on backend-confirmed success transitions", async () => {
  const source = await loadSource("apps/web/src/components/map/MerchantDrawer.tsx");
  assert.match(
    source,
    /if \(confirmDecision\.next === "ok"\) \{[\s\S]*setComposerOpen\(false\);[\s\S]*placeFeed\.markConfirmed\(eventId\);/,
  );
  assert.match(
    source,
    /if \(status === "ok"\) \{[\s\S]*setComposerOpen\(false\);[\s\S]*placeFeed\.markConfirmed\(checkinId\);/,
  );
});

test("success strip is rendered on confirmed mode", async () => {
  const source = await loadSource("apps/web/src/components/map/MerchantDrawer.tsx");
  assert.match(
    source,
    /\{drawerMode === "confirmed" && activeCheckinId && \([\s\S]*Check-in confirmed in canonical timeline/,
  );
});

test("confirmed state has a single explicit confirmation message surface", async () => {
  const source = await loadSource("apps/web/src/components/map/MerchantDrawer.tsx");
  assert.ok(
    source.includes("Check-in confirmed in canonical timeline"),
    "confirmed success strip must remain visible",
  );
  assert.ok(
    !source.includes("<CheckCircle2 className=\"h-4 w-4\" /> Confirmed"),
    "duplicate legacy confirmed prose block should be removed",
  );
});

test("advanced section contains protocol/debug details", async () => {
  const source = await loadSource("apps/web/src/components/map/MerchantDrawer.tsx");
  assert.ok(source.includes("Advanced"));
  assert.ok(source.includes("place_id"));
  assert.ok(source.includes("event_id"));
});

test("composer heading is user-facing", async () => {
  const source = await loadSource("apps/web/src/components/map/MerchantDrawer.tsx");
  assert.ok(!source.includes("Check-in Composer"));
  assert.ok(source.includes("Publish signal"));
});

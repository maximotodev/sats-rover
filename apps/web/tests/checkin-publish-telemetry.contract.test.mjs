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

test("empty provisional_event_id is omitted from start telemetry", async () => {
  const { buildCheckinPublishStartTelemetry } = await loadTsModule(
    "apps/web/src/flows/checkin-publish-telemetry.ts",
  );
  const telemetry = buildCheckinPublishStartTelemetry({
    provisionalEventId: "",
    pubkey: "a".repeat(64),
    placeId: "btcmap:1",
    status: "success",
  });

  assert.equal("provisional_event_id" in telemetry, false);
  assert.equal(telemetry.place_id, "btcmap:1");
});

test("publish summary stays compact and includes backend confirm status only when present", async () => {
  const { buildCheckinPublishSummaryTelemetry } = await loadTsModule(
    "apps/web/src/flows/checkin-publish-telemetry.ts",
  );
  const telemetry = buildCheckinPublishSummaryTelemetry({
    eventId: "b".repeat(64),
    pubkey: "c".repeat(64),
    placeId: "btcmap:2",
    status: "failed",
    relayOutcome: {
      relayResult: "no_acceptance",
      relayAttemptCount: 4,
      failedRelayCount: 4,
      errorName: "NDKPublishError",
    },
    backendConfirmStatus: "failed",
  });

  assert.equal(telemetry.event_id, "b".repeat(64));
  assert.equal(telemetry.relay_result, "no_acceptance");
  assert.equal(telemetry.relay_attempt_count, 4);
  assert.equal(telemetry.backend_confirm_status, "failed");
});

test("publish error summary preserves real no-acceptance failures", async () => {
  const { summarizeRelayPublishError } = await loadTsModule(
    "apps/web/src/flows/checkin-publish-telemetry.ts",
  );
  const relayOutcome = summarizeRelayPublishError({
    name: "NDKPublishError",
    message: "Not enough relays received the event (0 published, 1 required)",
    publishedToRelays: { size: 0 },
    intendedRelaySet: { size: 4 },
    errors: { size: 4 },
  });

  assert.equal(relayOutcome.relayResult, "no_acceptance");
  assert.equal(relayOutcome.relayAttemptCount, 4);
  assert.equal(relayOutcome.failedRelayCount, 4);
});

test("SatsRover-owned NDK bootstrap connection noise is not logged as an error", async () => {
  const source = await loadSource("apps/web/src/lib/ndk.ts");

  assert.ok(source.includes("console.info(\"[NDK] Initial relay connection incomplete\""));
  assert.ok(!source.includes("console.error(\"[NDK] Connection error\""));
});

test("check-in publish path emits compact summary telemetry and keeps failure severity", async () => {
  const source = await loadSource("apps/web/src/hooks/use-nostr.ts");

  assert.match(source, /console\.info\(\s*\"checkin_publish_summary\"/);
  assert.match(source, /console\.error\(\s*\"checkin_publish_summary\"/);
  assert.ok(!source.includes("checkin_publish_complete"));
});

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

test("resolveCanonicalCheckinEventId returns final signed id", async () => {
  const { resolveCanonicalCheckinEventId } = await loadTsModule(
    "apps/web/src/flows/checkin-correlation.ts",
  );
  const id = "a".repeat(64);
  const resolved = resolveCanonicalCheckinEventId({
    provisionalEventId: null,
    signedEventId: id,
    publishedEventId: id,
  });
  assert.equal(resolved, id);
});

test("buildCheckinConfirmPayload uses exact event id", async () => {
  const { buildCheckinConfirmPayload } = await loadTsModule(
    "apps/web/src/flows/checkin-correlation.ts",
  );
  const id = "b".repeat(64);
  const payload = buildCheckinConfirmPayload({
    eventId: id,
    placeId: "btcmap:1",
    pubkey: "c".repeat(64),
  });
  assert.equal(payload.event_id, id);
});

test("buildCheckinStatusParams uses exact checkin id", async () => {
  const { buildCheckinStatusParams } = await loadTsModule(
    "apps/web/src/flows/checkin-correlation.ts",
  );
  const id = "d".repeat(64);
  const params = buildCheckinStatusParams({
    checkinId: id,
    pubkey: "e".repeat(64),
    placeId: "btcmap:1",
  });
  assert.equal(params.get("checkin_id"), id);
});

test("pending polling allowed only for durable confirm response", async () => {
  const { evaluateConfirmResponseForPolling } = await loadTsModule(
    "apps/web/src/flows/checkin-correlation.ts",
  );
  const id = "f".repeat(64);
  const accepted = evaluateConfirmResponseForPolling({
    httpOk: true,
    status: "pending",
    reasonCode: "indexing_delay",
    expectedEventId: id,
    responseEventId: id,
  });
  assert.equal(accepted.next, "pending");
});

test("malformed or mismatched confirm response fails polling gate", async () => {
  const { evaluateConfirmResponseForPolling } = await loadTsModule(
    "apps/web/src/flows/checkin-correlation.ts",
  );
  const id = "1".repeat(64);
  const malformed = evaluateConfirmResponseForPolling({
    httpOk: true,
    status: null,
    reasonCode: null,
    expectedEventId: id,
    responseEventId: null,
  });
  assert.equal(malformed.next, "failed");
  const mismatched = evaluateConfirmResponseForPolling({
    httpOk: true,
    status: "pending",
    reasonCode: "indexing_delay",
    expectedEventId: id,
    responseEventId: "2".repeat(64),
  });
  assert.equal(mismatched.next, "failed");
  assert.equal(mismatched.reasonCode, "confirm_event_id_mismatch");
});

test("non-durable confirm response never starts polling", async () => {
  const { evaluateConfirmResponseForPolling } = await loadTsModule(
    "apps/web/src/flows/checkin-correlation.ts",
  );
  const id = "5".repeat(64);
  const rejected = evaluateConfirmResponseForPolling({
    httpOk: false,
    status: "rejected",
    reasonCode: "submission_not_durable",
    expectedEventId: id,
    responseEventId: id,
  });
  assert.equal(rejected.next, "failed");
  assert.equal(rejected.reasonCode, "submission_not_durable");
});

test("pending response with non-durable reason never starts polling", async () => {
  const { evaluateConfirmResponseForPolling } = await loadTsModule(
    "apps/web/src/flows/checkin-correlation.ts",
  );
  const id = "6".repeat(64);
  const rejected = evaluateConfirmResponseForPolling({
    httpOk: true,
    status: "pending",
    reasonCode: "submission_commit_failed",
    expectedEventId: id,
    responseEventId: id,
  });
  assert.equal(rejected.next, "failed");
  assert.equal(rejected.reasonCode, "submission_commit_failed");
});

test("provisional id mismatch never survives", async () => {
  const { resolveCanonicalCheckinEventId } = await loadTsModule(
    "apps/web/src/flows/checkin-correlation.ts",
  );
  assert.throws(
    () =>
      resolveCanonicalCheckinEventId({
        provisionalEventId: "1".repeat(64),
        signedEventId: "2".repeat(64),
        publishedEventId: "2".repeat(64),
      }),
    /event_id_mismatch_pre_sign/,
  );
});

test("published id mismatch fails loudly", async () => {
  const { resolveCanonicalCheckinEventId } = await loadTsModule(
    "apps/web/src/flows/checkin-correlation.ts",
  );
  assert.throws(
    () =>
      resolveCanonicalCheckinEventId({
        provisionalEventId: null,
        signedEventId: "3".repeat(64),
        publishedEventId: "4".repeat(64),
      }),
    /event_id_mismatch_post_publish/,
  );
});

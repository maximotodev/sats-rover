import test from "node:test";
import assert from "node:assert/strict";

import {
  buildSignalAuditRecord,
  evaluateSignalsV2EventDecision,
  normalizeDebugSignalEventId,
  shouldAuditSignalEvent,
} from "../signal_event_audit.js";

function baseEvent(overrides: Record<string, unknown> = {}) {
  return {
    id: "a".repeat(64),
    pubkey: "b".repeat(64),
    kind: 30331,
    created_at: 1_700_000_000,
    tags: [
      ["t", "satsrover"],
      ["v", "2"],
      ["place", "btcmap:1"],
      ["status", "success"],
    ],
    content: "{}",
    ...overrides,
  };
}

test("valid v2 event returns accepted materialized decision", () => {
  const decision = evaluateSignalsV2EventDecision(baseEvent(), 1_700_000_100);
  assert.equal(decision.accepted, true);
  assert.equal(decision.stage, "materialized");
  assert.equal(decision.reasonCode, null);
  assert.equal(decision.placeId, "btcmap:1");
  assert.equal(decision.status, "success");
});

test("invalid kind is rejected deterministically", () => {
  const decision = evaluateSignalsV2EventDecision(
    baseEvent({ kind: 1 }),
    1_700_000_100,
  );
  assert.equal(decision.accepted, false);
  assert.equal(decision.stage, "signals_v2_rejected");
  assert.equal(decision.reasonCode, "invalid_kind");
});

test("missing place tag is rejected", () => {
  const decision = evaluateSignalsV2EventDecision(
    baseEvent({ tags: [["status", "success"]] }),
    1_700_000_100,
  );
  assert.equal(decision.accepted, false);
  assert.equal(decision.reasonCode, "missing_place_tag");
});

test("missing status tag is rejected", () => {
  const decision = evaluateSignalsV2EventDecision(
    baseEvent({ tags: [["place", "btcmap:1"]] }),
    1_700_000_100,
  );
  assert.equal(decision.accepted, false);
  assert.equal(decision.reasonCode, "missing_or_invalid_status");
});

test("invalid event id and pubkey hex are rejected", () => {
  const invalidId = evaluateSignalsV2EventDecision(
    baseEvent({ id: "bad-id" }),
    1_700_000_100,
  );
  assert.equal(invalidId.accepted, false);
  assert.equal(invalidId.reasonCode, "invalid_event_id_hex");

  const invalidPubkey = evaluateSignalsV2EventDecision(
    baseEvent({ pubkey: "nothex" }),
    1_700_000_100,
  );
  assert.equal(invalidPubkey.accepted, false);
  assert.equal(invalidPubkey.reasonCode, "invalid_pubkey_hex");
});

test("duplicate_event_id debug record includes exact reason and seen flag", () => {
  const record = buildSignalAuditRecord({
    stage: "prefilter_rejected",
    eventId: "c".repeat(64),
    pubkey: "d".repeat(64),
    relay: "wss://relay.example",
    placeId: "btcmap:2",
    status: "rejected",
    reasonCode: "duplicate_event_id",
    seenInMemory: true,
  });
  assert.equal(record.stage, "prefilter_rejected");
  assert.equal(record.reason_code, "duplicate_event_id");
  assert.equal(record.seen_in_memory, true);
});

test("materialized debug record emits accepted final stage", () => {
  const record = buildSignalAuditRecord({
    stage: "materialized",
    eventId: "e".repeat(64),
    pubkey: "f".repeat(64),
    relay: "wss://relay.example",
    placeId: "btcmap:3",
    status: "success",
    reasonCode: null,
  });
  assert.equal(record.stage, "materialized");
  assert.equal(record.status, "success");
  assert.equal(record.reason_code, null);
});

test("debug event id matching is deterministic", () => {
  const debugEventId = normalizeDebugSignalEventId("A".repeat(64));
  assert.equal(debugEventId, "a".repeat(64));
  assert.equal(shouldAuditSignalEvent("A".repeat(64), debugEventId), true);
  assert.equal(shouldAuditSignalEvent("b".repeat(64), debugEventId), false);
});

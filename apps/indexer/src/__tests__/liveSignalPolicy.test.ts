import test from "node:test";
import assert from "node:assert/strict";
import {
  buildLiveSignalsReqFilter,
  evaluateLiveSignalCompatibility,
} from "../live_signal_policy.js";

test("live signal REQ filter is v2-only", () => {
  const filter = buildLiveSignalsReqFilter(123);
  assert.deepEqual(filter, {
    kinds: [30331],
    "#t": ["satsrover"],
    "#v": ["2"],
    since: 123,
  });
});

test("non-v2 30331 is rejected by live compatibility policy", () => {
  assert.deepEqual(evaluateLiveSignalCompatibility("30331", "missing"), {
    ok: false,
    reason: "missing_or_invalid_v",
  });
  assert.deepEqual(evaluateLiveSignalCompatibility("30331", "1"), {
    ok: false,
    reason: "missing_or_invalid_v",
  });
  assert.deepEqual(evaluateLiveSignalCompatibility("30331", "other"), {
    ok: false,
    reason: "missing_or_invalid_v",
  });
});

test("v2 30331 remains accepted by live compatibility policy", () => {
  assert.deepEqual(evaluateLiveSignalCompatibility("30331", "2"), { ok: true });
});


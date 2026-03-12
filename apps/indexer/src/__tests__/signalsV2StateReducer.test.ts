import test from "node:test";
import assert from "node:assert/strict";

import { applySignalsV2StateRows, type SignalsV2StateRow } from "../signals_v2_state.js";

function row(overrides: Partial<SignalsV2StateRow> = {}): SignalsV2StateRow {
  return {
    pubkey: "p1",
    placeId: "place:1",
    dayUtc: 20000,
    status: "success",
    createdAt: 100,
    eventId: "a",
    g: null,
    client: null,
    amountMsat: null,
    zap: null,
    bolt11: null,
    content: "{}",
    ...overrides,
  };
}

test("applying a success signal row yields expected derived state shape", () => {
  const out = applySignalsV2StateRows([row()]);
  assert.equal(out.length, 1);
  assert.deepEqual(out[0], row());
});

test("replaying the same ordered ledger rows is deterministic", () => {
  const ledger = [
    row({ createdAt: 100, eventId: "a", status: "failed" }),
    row({ createdAt: 100, eventId: "b", status: "success" }),
    row({ createdAt: 101, eventId: "c", status: "did_not_try" }),
  ];

  const first = applySignalsV2StateRows(ledger);
  const second = applySignalsV2StateRows(ledger);

  assert.deepEqual(first, second);
  assert.equal(first.length, 1);
  assert.equal(first[0]?.eventId, "c");
  assert.equal(first[0]?.status, "did_not_try");
});

test("empty input yields empty derived state", () => {
  const out = applySignalsV2StateRows([]);
  assert.deepEqual(out, []);
});

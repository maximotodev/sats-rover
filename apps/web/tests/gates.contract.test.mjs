import test from "node:test";
import assert from "node:assert/strict";

import { decideGateFromAction } from "../src/flows/gates.ts";

test("decideGateFromAction maps need_identity to identity gate", () => {
  assert.equal(
    decideGateFromAction({ kind: "need_identity", reason: "missing_identity" }),
    "identity",
  );
});

test("decideGateFromAction maps need_wallet to wallet gate", () => {
  assert.equal(
    decideGateFromAction({ kind: "need_wallet", reason: "missing_wallet" }),
    "wallet",
  );
});

test("decideGateFromAction maps run to none", () => {
  assert.equal(decideGateFromAction({ kind: "run" }), "none");
});

test("decideGateFromAction maps error to error", () => {
  assert.equal(decideGateFromAction({ kind: "error", reason: "flow_error" }), "error");
});

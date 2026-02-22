import test from "node:test";
import assert from "node:assert/strict";

import { evaluateFlowRequirement } from "../src/flows/types.ts";

const transmitRequirement = {
  identity: "required",
  wallet: "not_required",
};

test("transmit signal flow requires identity first and never wallet", () => {
  const anonDecision = evaluateFlowRequirement(transmitRequirement, {
    identityStatus: "anon",
    walletState: "disconnected",
  });

  assert.equal(anonDecision.kind, "need_identity");
  assert.equal(anonDecision.reason, "missing_identity");

  const readyDecision = evaluateFlowRequirement(transmitRequirement, {
    identityStatus: "ready",
    walletState: "disconnected",
  });

  assert.equal(readyDecision.kind, "run");
});

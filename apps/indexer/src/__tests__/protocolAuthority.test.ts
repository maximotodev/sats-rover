import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  SATSROVER_APP_STATE_KIND,
  SATSROVER_CLAIM_D_PREFIX,
  SATSROVER_CLAIM_REQUIRED_ROLE,
  SATSROVER_HASHTAGS,
  SATSROVER_PROTOCOL_TRACEABILITY,
  SATSROVER_PROTOCOL_VERSION,
  SATSROVER_SIGNAL_KIND,
  SATSROVER_SIGNAL_KNOWN_TAGS,
  SATSROVER_SIGNAL_STATUSES,
  SATSROVER_TAGS,
  buildClaimsReqFilter,
} from "../protocol_authority.js";
import { buildLiveSignalsReqFilter } from "../live_signal_policy.js";

function loadNormativeProtocol(): any {
  const protocolPath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../../../../docs/protocol/satsrover-v2.json",
  );
  return JSON.parse(fs.readFileSync(protocolPath, "utf8"));
}

test("indexer runtime protocol constants remain traceable to the normative v2 protocol doc", () => {
  const doc = loadNormativeProtocol();
  const indexerSubscriptions = doc.req_filters.indexer.subscriptions;
  const signalSpec = doc.event_model.kinds["30331"];
  const claimSpec = doc.event_model.kinds["30078"].subtypes.claim;

  assert.equal(
    SATSROVER_PROTOCOL_TRACEABILITY.normativePath,
    "docs/protocol/satsrover-v2.json",
  );
  assert.equal(SATSROVER_PROTOCOL_VERSION, doc.protocol.version);
  assert.equal(SATSROVER_SIGNAL_KIND, indexerSubscriptions[0].filter.kinds[0]);
  assert.equal(SATSROVER_APP_STATE_KIND, indexerSubscriptions[1].filter.kinds[0]);
  assert.equal(SATSROVER_HASHTAGS.ROOT, doc.namespaces.hashtags.root);
  assert.equal(SATSROVER_HASHTAGS.CLAIM, doc.namespaces.hashtags.claim);
  assert.equal(SATSROVER_HASHTAGS.PROFILE, doc.namespaces.hashtags.profile);
  assert.equal(SATSROVER_TAGS.VERSION, doc.namespaces.tags.protocol_version_tag);
  assert.equal(SATSROVER_TAGS.PLACE, doc.namespaces.tags.place_tag);
  assert.equal(SATSROVER_TAGS.STATUS, doc.namespaces.tags.status_tag);
  assert.equal(SATSROVER_TAGS.IDENTIFIER, doc.namespaces.tags.identifier_tag);
  assert.equal(
    SATSROVER_SIGNAL_STATUSES.join("|"),
    signalSpec.required_tags[3][1],
  );
  assert.deepEqual(
    SATSROVER_SIGNAL_KNOWN_TAGS,
    doc.validation.canonical_tag_allowlist["30331"],
  );

  assert.deepEqual(buildLiveSignalsReqFilter(123), {
    ...indexerSubscriptions[0].filter,
    since: 123,
  });
  assert.deepEqual(buildClaimsReqFilter(456), {
    ...indexerSubscriptions[1].filter,
    since: 456,
  });
  assert.equal(SATSROVER_CLAIM_D_PREFIX, "claim:");
  assert.equal(SATSROVER_CLAIM_REQUIRED_ROLE, claimSpec.required_tags[5][1]);
});

test("packages/protocol is quarantined as legacy residue instead of exporting v1 constants as normative truth", () => {
  const source = fs.readFileSync(
    path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      "../../../../packages/protocol/src/index.ts",
    ),
    "utf8",
  );

  assert.match(source, /legacy residue/i);
  assert.match(source, /not the normative protocol authority/i);
  assert.match(source, /SATSROVER_PROTOCOL_V1_LEGACY_RESIDUE/);
});

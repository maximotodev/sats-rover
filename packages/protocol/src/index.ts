/**
 * Legacy residue only.
 *
 * The sole normative protocol authority for SatsRover v2 is:
 *   docs/protocol/satsrover-v2.json
 *
 * This package is intentionally not a source of protocol constants for runtime
 * code. The old v1-shaped exports remain available only under an explicitly
 * legacy name so they do not present themselves as authoritative.
 */

export const SATSROVER_PROTOCOL = Object.freeze({
  deprecated: true,
  normativeProtocolPath: "docs/protocol/satsrover-v2.json",
  message:
    "packages/protocol is legacy residue and not the normative protocol authority. Use docs/protocol/satsrover-v2.json and runtime traceability modules instead.",
} as const);

export const SATSROVER_PROTOCOL_V1_LEGACY_RESIDUE = Object.freeze({
  VERSION: "1",
  KINDS: {
    SIGNAL: 30331,
    CLAIM: 30333,
    REVOKE: 30334,
  },
  TAGS: {
    PLACE: "p",
    STATUS: "s",
    TOPIC: "t",
  },
} as const);

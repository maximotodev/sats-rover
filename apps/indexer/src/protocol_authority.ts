// Runtime traceability only: this module mirrors the values the indexer
// currently implements and is covered by tests against docs/protocol/satsrover-v2.json.
// It is not a second normative spec.

export const SATSROVER_NORMATIVE_PROTOCOL_PATH =
  "docs/protocol/satsrover-v2.json" as const;

export const SATSROVER_PROTOCOL_TRACEABILITY = {
  normativePath: SATSROVER_NORMATIVE_PROTOCOL_PATH,
  refs: {
    signalKind: "event_model.kinds.30331",
    claimKind: "event_model.kinds.30078.subtypes.claim",
    liveSignalsReq: "req_filters.indexer.subscriptions[sr_live]",
    claimsReq: "req_filters.indexer.subscriptions[sr_claims]",
    globalLimits: "validation.global_limits",
    signalAllowlist: "validation.canonical_tag_allowlist.30331",
    claimAllowlist: "validation.canonical_tag_allowlist.30078_claim",
    profileLaneDoc: "req_filters.indexer.subscriptions[sr_profiles]",
  },
} as const;

export const SATSROVER_PROTOCOL_VERSION = "2" as const;
export const SATSROVER_SIGNAL_KIND = 30331 as const;
export const SATSROVER_APP_STATE_KIND = 30078 as const;

export const SATSROVER_HASHTAGS = {
  ROOT: "satsrover",
  CLAIM: "satsrover-claim",
  PROFILE: "satsrover-profile",
} as const;

export const SATSROVER_TAGS = {
  TOPIC: "t",
  VERSION: "v",
  PLACE: "place",
  STATUS: "status",
  IDENTIFIER: "d",
  ROLE: "role",
  GEOHASH: "g",
  CLIENT: "client",
  AMOUNT_MSAT: "amount_msat",
  ZAP: "zap",
  BOLT11: "bolt11",
} as const;

export const SATSROVER_SIGNAL_STATUSES = [
  "success",
  "failed",
  "did_not_try",
] as const;

export const SATSROVER_SIGNAL_KNOWN_TAGS = [
  SATSROVER_TAGS.TOPIC,
  SATSROVER_TAGS.VERSION,
  SATSROVER_TAGS.PLACE,
  SATSROVER_TAGS.STATUS,
  SATSROVER_TAGS.GEOHASH,
  SATSROVER_TAGS.CLIENT,
  SATSROVER_TAGS.AMOUNT_MSAT,
  SATSROVER_TAGS.ZAP,
  SATSROVER_TAGS.BOLT11,
] as const;

export const SATSROVER_CLAIM_REQUIRED_ROLE = "owner" as const;
export const SATSROVER_CLAIM_D_PREFIX = "claim:" as const;
export const SATSROVER_PROFILE_LANE_RUNTIME_IMPLEMENTED = false as const;

export function buildClaimsReqFilter(since: number) {
  return {
    kinds: [SATSROVER_APP_STATE_KIND],
    "#t": [SATSROVER_HASHTAGS.CLAIM],
    "#v": [SATSROVER_PROTOCOL_VERSION],
    since,
  };
}

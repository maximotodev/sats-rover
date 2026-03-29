import {
  SATSROVER_HASHTAGS,
  SATSROVER_PROTOCOL_VERSION,
  SATSROVER_SIGNAL_KIND,
} from "./protocol_authority.js";

const LIVE_SIGNALS_KIND = String(SATSROVER_SIGNAL_KIND);

export function buildLiveSignalsReqFilter(since: number) {
  // Traceability: docs/protocol/satsrover-v2.json -> req_filters.indexer.sr_live
  return {
    kinds: [SATSROVER_SIGNAL_KIND],
    "#t": [SATSROVER_HASHTAGS.ROOT],
    "#v": [SATSROVER_PROTOCOL_VERSION],
    since,
  };
}

export function evaluateLiveSignalCompatibility(
  kindLabel: string,
  versionLabel: string,
): { ok: true } | { ok: false; reason: string } {
  if (kindLabel !== LIVE_SIGNALS_KIND) {
    return { ok: false, reason: "disallowed_kind" };
  }
  // Traceability: docs/protocol/satsrover-v2.json -> event_model.kinds.30331.required_tags
  if (versionLabel !== SATSROVER_PROTOCOL_VERSION) {
    return { ok: false, reason: "missing_or_invalid_v" };
  }
  return { ok: true };
}

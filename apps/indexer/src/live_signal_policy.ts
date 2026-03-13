const LIVE_SIGNALS_KIND = "30331";

export function buildLiveSignalsReqFilter(since: number) {
  return {
    kinds: [30331],
    "#t": ["satsrover"],
    "#v": ["2"],
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
  if (versionLabel !== "2") {
    return { ok: false, reason: "missing_or_invalid_v" };
  }
  return { ok: true };
}


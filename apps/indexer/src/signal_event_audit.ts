export type SignalAuditStage =
  | "relay_event_observed"
  | "prefilter_rejected"
  | "sigverify_rejected"
  | "signals_v2_rejected"
  | "ledger_insert_attempt"
  | "ledger_insert_ok"
  | "ledger_insert_ignored"
  | "state_upsert_ok"
  | "materialized";

export type SignalAuditDecision = {
  accepted: boolean;
  stage:
    | "materialized"
    | "prefilter_rejected"
    | "sigverify_rejected"
    | "signals_v2_rejected";
  reasonCode: string | null;
  placeId: string | null;
  status: "success" | "failed" | "did_not_try" | null;
};

const HEX64_RE = /^[0-9a-fA-F]{64}$/;
const ALLOWED_STATUS = new Set(["success", "failed", "did_not_try"]);

function firstTagValue(tags: unknown, key: string): string | null {
  if (!Array.isArray(tags)) return null;
  for (const tag of tags) {
    if (
      Array.isArray(tag) &&
      tag.length >= 2 &&
      tag[0] === key &&
      typeof tag[1] === "string"
    ) {
      return tag[1];
    }
  }
  return null;
}

export function normalizeDebugSignalEventId(raw: string | undefined): string | null {
  if (!raw) return null;
  const normalized = raw.trim().toLowerCase();
  if (!HEX64_RE.test(normalized)) return null;
  return normalized;
}

export function shouldAuditSignalEvent(
  eventId: string | null | undefined,
  debugEventId: string | null,
): boolean {
  if (!debugEventId) return false;
  if (typeof eventId !== "string") return false;
  return eventId.toLowerCase() === debugEventId;
}

export function evaluateSignalsV2EventDecision(
  event: any,
  nowSec: number,
): SignalAuditDecision {
  const tags = event?.tags;
  const placeId = firstTagValue(tags, "place");
  const statusValue = firstTagValue(tags, "status");
  const kind = event?.kind;
  const eventId = event?.id;
  const pubkey = event?.pubkey;
  const createdAt = event?.created_at;

  if (typeof eventId !== "string" || !HEX64_RE.test(eventId)) {
    return {
      accepted: false,
      stage: "prefilter_rejected",
      reasonCode: "invalid_event_id_hex",
      placeId,
      status: null,
    };
  }
  if (typeof pubkey !== "string" || !HEX64_RE.test(pubkey)) {
    return {
      accepted: false,
      stage: "prefilter_rejected",
      reasonCode: "invalid_pubkey_hex",
      placeId,
      status: null,
    };
  }
  if (kind !== 30331) {
    return {
      accepted: false,
      stage: "signals_v2_rejected",
      reasonCode: "invalid_kind",
      placeId,
      status: null,
    };
  }
  if (
    typeof createdAt !== "number" ||
    !Number.isFinite(createdAt) ||
    !Number.isInteger(createdAt)
  ) {
    return {
      accepted: false,
      stage: "prefilter_rejected",
      reasonCode: "invalid_created_at",
      placeId,
      status: null,
    };
  }
  if (createdAt > nowSec + 600) {
    return {
      accepted: false,
      stage: "prefilter_rejected",
      reasonCode: "created_at_out_of_range",
      placeId,
      status: null,
    };
  }
  if (!placeId || placeId.trim().length === 0) {
    return {
      accepted: false,
      stage: "prefilter_rejected",
      reasonCode: "missing_place_tag",
      placeId: null,
      status: null,
    };
  }
  if (!statusValue) {
    return {
      accepted: false,
      stage: "signals_v2_rejected",
      reasonCode: "missing_or_invalid_status",
      placeId,
      status: null,
    };
  }
  if (!ALLOWED_STATUS.has(statusValue)) {
    return {
      accepted: false,
      stage: "signals_v2_rejected",
      reasonCode: "invalid_status",
      placeId,
      status: null,
    };
  }

  return {
    accepted: true,
    stage: "materialized",
    reasonCode: null,
    placeId,
    status: statusValue as "success" | "failed" | "did_not_try",
  };
}

export function buildSignalAuditRecord(input: {
  stage: SignalAuditStage;
  eventId: string;
  pubkey: string | null;
  relay: string;
  placeId?: string | null;
  status?: string | null;
  reasonCode?: string | null;
  seenInMemory?: boolean;
}): Record<string, unknown> {
  return {
    stage: input.stage,
    event_id: input.eventId,
    pubkey: input.pubkey,
    relay: input.relay,
    place_id: input.placeId ?? null,
    status: input.status ?? null,
    reason_code: input.reasonCode ?? null,
    seen_in_memory:
      typeof input.seenInMemory === "boolean" ? input.seenInMemory : undefined,
  };
}

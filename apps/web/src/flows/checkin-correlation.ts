// Canonical v2 check-in correlation is exact by event_id.
// Relay publish may succeed independently, but any mismatch across provisional,
// signed, published, or confirmed ids is treated as a hard failure.
export function resolveCanonicalCheckinEventId(input: {
  provisionalEventId?: string | null;
  signedEventId?: string | null;
  publishedEventId?: string | null;
}): string {
  const signedEventId = input.signedEventId || "";
  if (!signedEventId) {
    throw new Error("missing_signed_event_id");
  }
  const provisionalEventId = input.provisionalEventId || null;
  if (provisionalEventId && provisionalEventId !== signedEventId) {
    throw new Error("event_id_mismatch_pre_sign");
  }
  const publishedEventId = input.publishedEventId || null;
  if (publishedEventId && publishedEventId !== signedEventId) {
    throw new Error("event_id_mismatch_post_publish");
  }
  return signedEventId;
}

// The confirm payload carries the exact signed event_id forward to the backend.
// Backend acceptance of this payload is a durable handoff, not canonical ledger confirmation.
export function buildCheckinConfirmPayload(input: {
  eventId: string;
  placeId: string;
  pubkey: string;
  paymentEvidence?: object | null;
  rawEvent?: object | null;
}): {
  event_id: string;
  place_id: string;
  pubkey: string;
  payment_evidence: object | null;
  raw_event: object | null;
} {
  return {
    event_id: input.eventId,
    place_id: input.placeId,
    pubkey: input.pubkey,
    payment_evidence: input.paymentEvidence || null,
    raw_event: input.rawEvent || null,
  };
}

export function buildCheckinStatusParams(input: {
  checkinId: string;
  pubkey: string;
  placeId: string;
}): URLSearchParams {
  return new URLSearchParams({
    checkin_id: input.checkinId,
    pubkey: input.pubkey,
    place_id: input.placeId,
  });
}

// Polling may continue only after an exact event_id match on a durable confirm response.
// This preserves the separation between backend handoff and later canonical visibility.
export function evaluateConfirmResponseForPolling(input: {
  httpOk: boolean;
  status: string | null;
  reasonCode: string | null;
  expectedEventId: string;
  responseEventId: string | null;
}): {
  next: "ok" | "pending" | "failed";
  reasonCode: string | null;
} {
  const nonDurableReasons = new Set([
    "submission_persist_failed",
    "submission_commit_failed",
    "submission_not_durable",
  ]);
  if (!input.httpOk) {
    return { next: "failed", reasonCode: input.reasonCode || "confirm_failed" };
  }
  if (input.status === "ok") {
    return { next: "ok", reasonCode: input.reasonCode || "confirmed" };
  }
  if (input.status !== "pending") {
    return { next: "failed", reasonCode: input.reasonCode || "confirm_malformed_response" };
  }
  if (!input.responseEventId || input.responseEventId !== input.expectedEventId) {
    return { next: "failed", reasonCode: "confirm_event_id_mismatch" };
  }
  if (input.reasonCode && nonDurableReasons.has(input.reasonCode)) {
    return { next: "failed", reasonCode: input.reasonCode };
  }
  return { next: "pending", reasonCode: input.reasonCode || "indexing_delay" };
}

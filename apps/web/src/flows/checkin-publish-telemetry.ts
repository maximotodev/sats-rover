export type CheckinPublishStatus = "success" | "failed" | "did_not_try";

export type RelayPublishResult =
  | "partial_success"
  | "success"
  | "no_acceptance"
  | "unknown";

type CheckinPublishStartInput = {
  provisionalEventId?: string | null;
  pubkey?: string | null;
  placeId: string;
  status: CheckinPublishStatus;
};

type RelayOutcome = {
  relayResult: RelayPublishResult;
  acceptedRelayCount?: number;
  relayAttemptCount?: number;
  failedRelayCount?: number;
  errorName?: string;
  errorMessage?: string;
};

type RelayCountLike = {
  size?: unknown;
};

type RelayPublishErrorLike = {
  name?: unknown;
  message?: unknown;
  publishedToRelays?: RelayCountLike | null;
  intendedRelaySet?: RelayCountLike | null;
  errors?: RelayCountLike | null;
};

type CheckinPublishSummaryInput = {
  eventId?: string | null;
  pubkey?: string | null;
  placeId: string;
  status: CheckinPublishStatus;
  relayOutcome: RelayOutcome;
  backendConfirmStatus?: "ok" | "pending" | "failed" | null;
};

function readSize(value: unknown): number | undefined {
  if (!value || typeof value !== "object") return undefined;
  const size = (value as RelayCountLike).size;
  return typeof size === "number" && Number.isFinite(size) ? size : undefined;
}

export function buildCheckinPublishStartTelemetry(
  input: CheckinPublishStartInput,
): {
  provisional_event_id?: string;
  pubkey: string | null;
  place_id: string;
  status: CheckinPublishStatus;
} {
  const telemetry: {
    provisional_event_id?: string;
    pubkey: string | null;
    place_id: string;
    status: CheckinPublishStatus;
  } = {
    pubkey: input.pubkey || null,
    place_id: input.placeId,
    status: input.status,
  };

  if (input.provisionalEventId) {
    telemetry.provisional_event_id = input.provisionalEventId;
  }

  return telemetry;
}

export function summarizeRelayPublishSuccess(relays: RelayCountLike): RelayOutcome {
  const acceptedRelayCount = readSize(relays);

  return {
    relayResult:
      typeof acceptedRelayCount === "number" && acceptedRelayCount > 0
        ? "success"
        : "unknown",
    acceptedRelayCount,
  };
}

export function summarizeRelayPublishError(error: unknown): RelayOutcome {
  const relayError = error as RelayPublishErrorLike | null;
  const acceptedRelayCount = readSize(relayError?.publishedToRelays);
  const relayAttemptCount = readSize(relayError?.intendedRelaySet);
  const failedRelayCount = readSize(relayError?.errors);

  let relayResult: RelayPublishResult = "unknown";
  if (typeof acceptedRelayCount === "number" && acceptedRelayCount > 0) {
    relayResult =
      typeof relayAttemptCount === "number" && relayAttemptCount > acceptedRelayCount
        ? "partial_success"
        : "success";
  } else if (
    acceptedRelayCount === 0 ||
    typeof relayAttemptCount === "number" ||
    typeof failedRelayCount === "number"
  ) {
    relayResult = "no_acceptance";
  }

  return {
    relayResult,
    acceptedRelayCount,
    relayAttemptCount,
    failedRelayCount,
    errorName: typeof relayError?.name === "string" ? relayError.name : undefined,
    errorMessage:
      typeof relayError?.message === "string" ? relayError.message : undefined,
  };
}

export function buildCheckinPublishSummaryTelemetry(
  input: CheckinPublishSummaryInput,
): {
  event_id?: string;
  pubkey: string | null;
  place_id: string;
  status: CheckinPublishStatus;
  relay_result: RelayPublishResult;
  accepted_relay_count?: number;
  relay_attempt_count?: number;
  failed_relay_count?: number;
  backend_confirm_status?: "ok" | "pending" | "failed";
  error_name?: string;
  error_message?: string;
} {
  const telemetry: {
    event_id?: string;
    pubkey: string | null;
    place_id: string;
    status: CheckinPublishStatus;
    relay_result: RelayPublishResult;
    accepted_relay_count?: number;
    relay_attempt_count?: number;
    failed_relay_count?: number;
    backend_confirm_status?: "ok" | "pending" | "failed";
    error_name?: string;
    error_message?: string;
  } = {
    pubkey: input.pubkey || null,
    place_id: input.placeId,
    status: input.status,
    relay_result: input.relayOutcome.relayResult,
  };

  if (input.eventId) {
    telemetry.event_id = input.eventId;
  }
  if (typeof input.relayOutcome.acceptedRelayCount === "number") {
    telemetry.accepted_relay_count = input.relayOutcome.acceptedRelayCount;
  }
  if (typeof input.relayOutcome.relayAttemptCount === "number") {
    telemetry.relay_attempt_count = input.relayOutcome.relayAttemptCount;
  }
  if (typeof input.relayOutcome.failedRelayCount === "number") {
    telemetry.failed_relay_count = input.relayOutcome.failedRelayCount;
  }
  if (input.backendConfirmStatus) {
    telemetry.backend_confirm_status = input.backendConfirmStatus;
  }
  if (input.relayOutcome.errorName) {
    telemetry.error_name = input.relayOutcome.errorName;
  }
  if (input.relayOutcome.errorMessage) {
    telemetry.error_message = input.relayOutcome.errorMessage;
  }

  return telemetry;
}

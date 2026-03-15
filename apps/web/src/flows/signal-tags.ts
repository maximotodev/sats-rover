export type CheckinSignalStatus = "success" | "failed" | "did_not_try";

export function buildCheckinSignalTags(
  placeId: string,
  paymentStatus: CheckinSignalStatus,
): string[][] {
  return [
    ["t", "satsrover"],
    ["v", "2"],
    ["place", placeId],
    ["status", paymentStatus],
    ["client", "satsrover-web"],
  ];
}

export function buildMerchantClaimTags(placeId: string): string[][] {
  return [
    ["t", "satsrover-claim"],
    ["t", "satsrover"],
    ["v", "2"],
    ["d", `claim:${placeId}`],
    ["place", placeId],
    ["role", "owner"],
    ["client", "satsrover-web"],
  ];
}

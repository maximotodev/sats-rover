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

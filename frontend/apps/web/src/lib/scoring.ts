import { NDKEvent } from "@nostr-dev-kit/ndk";

export interface ScoreResult {
  totalScore: number;
  uniqueUsers: number;
  lightningSuccessCount: number;
  lightningRatio: number;
}

// ✅ CONFIGURATION (LOCKED)
const WEIGHT_STATUS = { success: 1.0, failed: 0.25, did_not_try: 0.1 };
const WEIGHT_METHOD = { lightning: 1.0, onchain: 0.8, none: 0.5 };
const USER_WEEKLY_CAP = 10;

/**
 * v1 User Weight Stub
 * Currently locked to 1.0.
 * In v2, this will check account age, WoT, and Zap history.
 */
function getUserWeight(pubkey: string, _events: NDKEvent[]): number {
  return 1.0;
}

/**
 * Calculates the City Pulse Score based on a set of check-in events.
 * Deterministic & Client-Side Verifiable.
 */
export function calculateCityPulse(events: NDKEvent[]): ScoreResult {
  const userScores: Record<string, number> = {};
  const seenPlacesByUser: Record<string, Set<string>> = {}; // Anti-Farming

  let totalScore = 0;
  let lightningSuccessCount = 0;
  let lightningTotalCount = 0;

  for (const event of events) {
    const pubkey = event.pubkey;

    // 1. Extract Tags
    const statusTag =
      (event.tags.find(
        (t) => t[0] === "status"
      )?.[1] as keyof typeof WEIGHT_STATUS) || "did_not_try";
    const methodTag =
      (event.tags.find(
        (t) => t[0] === "method"
      )?.[1] as keyof typeof WEIGHT_METHOD) || "none";
    const placeId = event.tags.find((t) => t[0] === "place")?.[1] || "unknown";

    // 2. Base Score Calculation
    let score =
      (WEIGHT_STATUS[statusTag] || 0.1) * (WEIGHT_METHOD[methodTag] || 0.5);

    // 3. Merchant Uniqueness (Batch-Local Anti-Farming)
    if (!seenPlacesByUser[pubkey]) seenPlacesByUser[pubkey] = new Set();
    const isFirstVisit = !seenPlacesByUser[pubkey].has(placeId);
    const merchantMultiplier = isFirstVisit ? 1.0 : 0.3; // Penalty for repeats

    seenPlacesByUser[pubkey].add(placeId);
    score *= merchantMultiplier;

    // 4. User Weighting (Sybil Resistance)
    const userWeight = getUserWeight(pubkey, events);
    score *= userWeight;

    // 5. Weekly Cap Enforcement
    const currentUserScore = userScores[pubkey] || 0;
    if (currentUserScore >= USER_WEEKLY_CAP) continue; // Hard Cap

    const effectiveScore = Math.min(score, USER_WEEKLY_CAP - currentUserScore);
    userScores[pubkey] = currentUserScore + effectiveScore;

    // Add to Aggregate
    totalScore += effectiveScore;

    // Stats
    if (methodTag === "lightning") {
      lightningTotalCount++;
      if (statusTag === "success") lightningSuccessCount++;
    }
  }

  const uniqueUsers = Object.keys(userScores).length;
  const lightningRatio =
    lightningTotalCount > 0 ? lightningSuccessCount / lightningTotalCount : 0;

  return {
    totalScore: parseFloat(totalScore.toFixed(1)),
    uniqueUsers,
    lightningSuccessCount,
    lightningRatio,
  };
}

/**
 * Calculates Signal Strength (0-1) for a single merchant based on history.
 * Prioritizes Lightning Success.
 */
export function calculateMerchantIntensity(events: NDKEvent[]): number {
  if (events.length === 0) return 0;

  const lightningSuccesses = events.filter(
    (e) =>
      e.tags.some((t) => t[0] === "status" && t[1] === "success") &&
      e.tags.some((t) => t[0] === "method" && t[1] === "lightning")
  ).length;

  const anySuccess = events.filter((e) =>
    e.tags.some((t) => t[0] === "status" && t[1] === "success")
  ).length;

  // Tiered Intensity
  if (lightningSuccesses >= 3) return 1.0; // High Certainty
  if (lightningSuccesses >= 1) return 0.7; // Validated
  if (anySuccess >= 1) return 0.4; // Non-LN Success
  return 0.2; // Unverified Activity
}

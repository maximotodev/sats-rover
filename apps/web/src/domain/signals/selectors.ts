import { dedupeAndSortSignalFeed } from "./normalize";
import type { SignalFeedItemUI } from "./types";

export function mergeSignalFeed(
  previous: SignalFeedItemUI[],
  incoming: SignalFeedItemUI[],
): SignalFeedItemUI[] {
  return dedupeAndSortSignalFeed([...incoming, ...previous]);
}

export function withOptimisticPending(
  previous: SignalFeedItemUI[],
  optimisticItem: SignalFeedItemUI,
): SignalFeedItemUI[] {
  return dedupeAndSortSignalFeed([optimisticItem, ...previous]);
}

export function successCount(items: SignalFeedItemUI[]): number {
  return items.filter((item) => item.status === "success").length;
}

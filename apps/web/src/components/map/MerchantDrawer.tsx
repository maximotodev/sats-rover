// apps/web/src/components/map/MerchantDrawer.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Merchant } from "@/lib/types";
import {
  AlertCircle,
  Bitcoin,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  KeyRound,
  Loader2,
  MapPin,
  Meh,
  Navigation,
  Share2,
  Signal,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIdentity } from "@/context/identity-context";
import { useTransmitSignalFlow } from "@/flows/transmit-signal-flow";
import { useFlowGates } from "@/flows/gates";
import { NDKUserProfile } from "@nostr-dev-kit/ndk";
import { buildAuthHeaders, randomNonce } from "@/lib/authProof";
import IdentityGateModal from "@/components/modals/IdentityGateModal";
import WalletGateModal from "@/components/modals/WalletGateModal";
import {
  createOptimisticSignalFeedItem,
  useSignalFeed,
} from "@/domain/signals/client";
import type { SignalFeedItemUI, SignalStatus } from "@/domain/signals/types";
import { successCount as countSuccessfulSignals } from "@/domain/signals/selectors";

interface MerchantDrawerProps {
  merchant: Merchant | null;
  onClose: () => void;
}

type ProfileMap = Record<string, NDKUserProfile>;

type CheckinLifecycleState =
  | "idle"
  | "intent_created"
  | "publishing"
  | "confirming"
  | "pending"
  | "ok"
  | "failed"
  | "not_found";
type ComposerStep = "broadcast" | "pay";

type FailedBroadcastMap = Record<string, string>;

function tagTruthy(v: unknown): boolean {
  if (v === true) return true;
  if (typeof v === "number") return v === 1;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    return s === "yes" || s === "true" || s === "1" || s === "y";
  }
  return false;
}

function formatRelative(ms: number): string {
  const diff = Math.max(0, Date.now() - ms);
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour}h ago`;
  return `${Math.floor(hour / 24)}d ago`;
}

function shortHex(value: string, left = 8, right = 6): string {
  if (!value || value.length <= left + right + 1) return value;
  return `${value.slice(0, left)}…${value.slice(-right)}`;
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

const POLL_BACKOFF_MS = [400, 700, 1200, 1800, 2500] as const;
const MAX_POLL_MS = 20_000;

function jitterDelay(ms: number): number {
  const jitter = Math.floor(Math.random() * 121) - 60;
  return Math.max(300, Math.min(2500, ms + jitter));
}

function pollDelayForAttempt(attempt: number): number {
  const idx = Math.min(attempt, POLL_BACKOFF_MS.length - 1);
  return jitterDelay(POLL_BACKOFF_MS[idx]);
}

// AI placeholder: intentionally local-only. Future hook may call /api/ai/place-summary.
function getFutureAiSummaryHint(placeId: string): string {
  return `AI summary for ${placeId} is not available yet.`;
}

function FeedStatusBadge({ status }: { status: SignalStatus }) {
  if (status === "success") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-[#00FF41]/40 bg-[#00FF41]/10 px-2 py-0.5 text-[10px] text-[#00FF41]">
        <CheckCircle2 className="h-3 w-3" /> Worked
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-red-500/40 bg-red-500/10 px-2 py-0.5 text-[10px] text-red-300">
        <AlertCircle className="h-3 w-3" /> Failed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/5 px-2 py-0.5 text-[10px] text-gray-300">
      <Meh className="h-3 w-3" /> No try
    </span>
  );
}

function FeedRow({
  item,
  profile,
  expanded,
  failedReason,
  onToggle,
  onCopy,
}: {
  item: SignalFeedItemUI;
  profile?: NDKUserProfile;
  expanded: boolean;
  failedReason?: string;
  onToggle: () => void;
  onCopy: (label: string, value: string) => void;
}) {
  const displayName =
    profile?.name || profile?.displayName || shortHex(item.pubkey, 10, 4);
  const content = item.content.trim();

  return (
    <article
      className={cn(
        "rounded-xl border bg-black/30 px-3 py-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)] transition",
        item.pending && !failedReason
          ? "border-[#F7931A]/45 bg-[#F7931A]/5"
          : "",
        failedReason ? "border-red-500/40 bg-red-950/10" : "border-white/10",
      )}
    >
      <button
        onClick={onToggle}
        className="flex w-full items-start gap-3 text-left"
      >
        {profile?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.image}
            alt={displayName}
            className="h-8 w-8 rounded-full border border-white/20 object-cover"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/40 text-[10px] text-gray-300">
            {displayName.slice(0, 2).toUpperCase()}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-xs font-semibold text-gray-100">
              {displayName}
            </p>
            <FeedStatusBadge status={item.status} />
            {item.pending && !failedReason && (
              <span className="rounded-full border border-[#F7931A]/40 bg-[#F7931A]/10 px-2 py-0.5 text-[10px] text-[#F7931A]">
                Pending…
              </span>
            )}
          </div>
          <p className="mt-1 font-mono text-[11px] text-gray-500">
            {formatRelative(item.createdAtMs)}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-gray-300">
            {content || <span className="text-gray-500">No note attached</span>}
          </p>
          {item.pending && !failedReason && (
            <div className="mt-2 rounded-md border border-[#F7931A]/35 bg-[#F7931A]/10 px-2 py-1 text-[11px] text-[#F7B267]">
              Pending relay/indexer confirmation...
            </div>
          )}
          {failedReason && (
            <div className="mt-2 rounded-md border border-red-500/30 bg-red-900/20 px-2 py-1 text-[11px] text-red-300">
              Failed to broadcast: {failedReason}
            </div>
          )}
        </div>

        {expanded ? (
          <ChevronUp className="mt-1 h-4 w-4 shrink-0 text-gray-500" />
        ) : (
          <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-gray-500" />
        )}
      </button>

      {expanded && (
        <div className="mt-3 space-y-2 rounded-lg border border-white/10 bg-black/30 p-2 text-[11px] text-gray-300">
          <div className="flex items-center justify-between gap-2">
            <span className="text-gray-500">event_id</span>
            <button
              onClick={() => onCopy("event_id", item.id)}
              className="inline-flex items-center gap-1 text-gray-300 hover:text-white"
            >
              <Copy className="h-3 w-3" /> {shortHex(item.id)}
            </button>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-gray-500">pubkey</span>
            <button
              onClick={() => onCopy("pubkey", item.pubkey)}
              className="inline-flex items-center gap-1 text-gray-300 hover:text-white"
            >
              <Copy className="h-3 w-3" /> {shortHex(item.pubkey)}
            </button>
          </div>
          <div className="text-gray-500">
            created_at: {new Date(item.createdAtMs).toISOString()}
          </div>
        </div>
      )}
    </article>
  );
}

export default function MerchantDrawer({
  merchant,
  onClose,
}: MerchantDrawerProps) {
  const identity = useIdentity();
  const { session, ndk } = identity;
  const { publishSignal } = identity.actions;
  const transmitSignalFlow = useTransmitSignalFlow();
  const gates = useFlowGates();

  const placeId = merchant?.id ?? null;
  const signerPreference =
    session.type === "local_nsec"
      ? "session_local_nsec"
      : session.type === "nip07"
        ? "session_nip07"
        : "auto";

  const placeFeed = useSignalFeed({
    mode: "place",
    placeId,
    enabled: Boolean(placeId),
  });

  const [profiles, setProfiles] = useState<ProfileMap>({});
  const hydratedPubkeysRef = useRef<Set<string>>(new Set());

  const [composerOpen, setComposerOpen] = useState(false);
  const [composerStep, setComposerStep] = useState<ComposerStep>("broadcast");
  const [paymentStatus, setPaymentStatus] = useState<SignalStatus>("success");
  const [comment, setComment] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [checkinStatus, setCheckinStatus] =
    useState<CheckinLifecycleState>("idle");
  const [checkinReason, setCheckinReason] = useState<string | null>(null);
  const [activeCheckinId, setActiveCheckinId] = useState<string | null>(null);
  const [failedBroadcastMap, setFailedBroadcastMap] =
    useState<FailedBroadcastMap>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(30);
  const [copiedHint, setCopiedHint] = useState<string | null>(null);

  const pollRunIdRef = useRef(0);
  const copiedHintTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      pollRunIdRef.current += 1;
      if (copiedHintTimerRef.current !== null) {
        window.clearTimeout(copiedHintTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    pollRunIdRef.current += 1;
    if (!placeId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset local drawer state when selected merchant changes
    setComposerOpen(false);
    setComposerStep("broadcast");
    setPaymentStatus("success");
    setComment("");
    setPublishError(null);
    setCheckinStatus("idle");
    setCheckinReason(null);
    setActiveCheckinId(null);
    setFailedBroadcastMap({});
    setExpandedId(null);
    setVisibleCount(30);
    setCopiedHint(null);
  }, [placeId]);

  useEffect(() => {
    const run = async () => {
      if (!ndk || placeFeed.items.length === 0) return;
      const uniquePubkeys = Array.from(
        new Set(placeFeed.items.map((n) => n.pubkey)),
      );
      const nextProfiles: ProfileMap = {};

      await Promise.all(
        uniquePubkeys.map(async (pk) => {
          if (hydratedPubkeysRef.current.has(pk)) return;
          hydratedPubkeysRef.current.add(pk);
          try {
            const user = ndk.getUser({ pubkey: pk });
            const profile = await user.fetchProfile();
            if (profile) nextProfiles[pk] = profile;
          } catch {
            // Keep feed rendering deterministic even if profile relay fetch fails.
          }
        }),
      );

      if (Object.keys(nextProfiles).length > 0) {
        setProfiles((prev) => ({ ...prev, ...nextProfiles }));
      }
    };

    void run();
  }, [ndk, placeFeed.items]);

  const categoryLabel =
    typeof merchant?.category === "string" && merchant.category
      ? merchant.category.replaceAll("_", " ")
      : "merchant";

  const hasLightning = tagTruthy(merchant?.tags?.["payment:lightning"]);
  const hasOnchain =
    tagTruthy(merchant?.tags?.["currency:XBT"]) ||
    tagTruthy(merchant?.tags?.["payment:onchain"]);

  const reliability = placeFeed.confidenceScore / 100;

  const feedItems = placeFeed.items;
  const visibleItems = useMemo(
    () => feedItems.slice(0, visibleCount),
    [feedItems, visibleCount],
  );

  const totalSignals = feedItems.length;
  const successSignals = countSuccessfulSignals(feedItems);
  const lastConfirmedAt = useMemo(() => {
    const first = feedItems.find((item) => item.status === "success");
    return first ? first.createdAtMs : null;
  }, [feedItems]);

  const successStreak = useMemo(() => {
    let streak = 0;
    for (const item of feedItems) {
      if (item.status === "success") streak += 1;
      else break;
    }
    return streak;
  }, [feedItems]);

  const latestEventId = feedItems[0]?.id || activeCheckinId || "";

  const copyValue = async (label: string, value: string) => {
    if (!value) return;
    const ok = await copyText(value);
    if (copiedHintTimerRef.current !== null) {
      window.clearTimeout(copiedHintTimerRef.current);
      copiedHintTimerRef.current = null;
    }
    if (ok) {
      setCopiedHint(`Copied ${label}`);
    } else {
      setCopiedHint(`Copy failed: ${label}`);
    }
    copiedHintTimerRef.current = window.setTimeout(() => {
      setCopiedHint(null);
      copiedHintTimerRef.current = null;
    }, 1200);
  };

  const handleShare = async () => {
    if (!merchant) return;
    const text = `Checking ${merchant.name} on SatsRover (${merchant.id})`;

    if (navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch {
        // fallback below
      }
    }

    await copyValue("share text", text);
  };

  const openComposer = () => {
    const nextAction = transmitSignalFlow.nextAction;
    if (nextAction.kind === "need_identity") {
      gates.openForAction(nextAction);
      return;
    }
    if (nextAction.kind === "need_wallet") {
      setPublishError("reason_code: flow_unexpected_wallet_gate");
      return;
    }
    if (nextAction.kind === "error") {
      setPublishError(`reason_code: ${nextAction.reason || "flow_error"}`);
      return;
    }
    setComposerStep("broadcast");
    setComposerOpen(true);
  };

  const pollCheckinStatus = async (
    checkinId: string,
    pubkey: string,
    placeId: string,
  ) => {
    const runId = ++pollRunIdRef.current;
    const startedAt = Date.now();
    let attempt = 0;
    setCheckinStatus("pending");
    setCheckinReason("indexing_delay");

    while (Date.now() - startedAt < MAX_POLL_MS) {
      if (pollRunIdRef.current !== runId) return;

      try {
        const params = new URLSearchParams({
          checkin_id: checkinId,
          pubkey,
          place_id: placeId,
        });
        const resp = await fetch(
          `/api/checkins/status?${params.toString()}`,
          { method: "GET" },
        );
        const data = await resp.json().catch(() => null);
        const status = (data?.status as CheckinLifecycleState | undefined) || "failed";
        const reason = (data?.reason_code as string | null | undefined) ?? null;

        if (status === "ok" || status === "failed" || status === "not_found") {
          setCheckinStatus(status);
          setCheckinReason(reason);
          return;
        }

        setCheckinStatus("pending");
        setCheckinReason(reason ?? "indexing_delay");
      } catch {
        // Keep retrying until timeout.
      }

      const nextDelay = pollDelayForAttempt(attempt);
      attempt += 1;
      await new Promise((resolve) => setTimeout(resolve, nextDelay));
    }

    if (pollRunIdRef.current === runId) {
      setCheckinStatus("failed");
      setCheckinReason("status_timeout");
    }
  };

  const handleSubmitReport = async () => {
    if (!merchant) return;
    const actorPubkey = session.pubkey;
    if (!actorPubkey) {
      gates.openForAction({
        kind: "need_identity",
        reason: "missing_identity",
      });
      return;
    }
    if (isPublishing || checkinStatus === "pending") return;

    const nextAction = transmitSignalFlow.nextAction;
    if (nextAction.kind !== "run") {
      if (nextAction.kind === "need_identity") gates.openForAction(nextAction);
      else setPublishError(`reason_code: ${nextAction.reason || "flow_error"}`);
      return;
    }

    setIsPublishing(true);
    setPublishError(null);
    setCheckinStatus("intent_created");
    setCheckinReason(null);

    let intentToken = "";
    let intentReasonCode = "missing_intent_token";
    try {
      const intentAuth = await buildAuthHeaders({
        pubkey: actorPubkey,
        method: "POST",
        path: "/v1/checkins/intent",
        nonce: randomNonce(),
        bodyBytes: new Uint8Array(),
        signerPreference,
      });

      const intentRes = await fetch("/api/checkins/intent", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-pubkey": actorPubkey,
          "x-auth-event": intentAuth.authEvent,
          "x-auth-nonce": intentAuth.nonce,
        },
        body: JSON.stringify({ placeId: merchant.id }),
      });

      const intentData = await intentRes.json().catch(() => ({}));
      intentReasonCode =
        typeof intentData?.reason_code === "string"
          ? intentData.reason_code
          : intentReasonCode;
      intentToken =
        typeof intentData?.intent_token === "string"
          ? intentData.intent_token
          : "";
      if (intentToken) {
        setCheckinStatus("publishing");
      }
    } catch (error) {
      intentReasonCode =
        error instanceof Error && error.message
          ? error.message
          : intentReasonCode;
      intentToken = "";
    }

    setCheckinStatus("publishing");
    const publishResult = await transmitSignalFlow.run(async () =>
      publishSignal(merchant.id, paymentStatus, comment),
    );

    if (!publishResult.ok || !publishResult.eventId) {
      const failedId = `failed-${Date.now()}`;
      placeFeed.addOptimistic(
        createOptimisticSignalFeedItem({
          id: failedId,
          placeId: merchant.id,
          pubkey: actorPubkey,
          status: paymentStatus,
          content: comment,
        }),
      );
      setFailedBroadcastMap((prev) => ({
        ...prev,
        [failedId]: "relay_publish_failed",
      }));
      setPublishError(
        "Signal failed to reach relays. You can retry this draft.",
      );
      setCheckinStatus("failed");
      setCheckinReason("relay_publish_failed");
      setIsPublishing(false);
      return;
    }

    const eventId = publishResult.eventId;
    setActiveCheckinId(eventId);

    placeFeed.addOptimistic(
      createOptimisticSignalFeedItem({
        id: eventId,
        placeId: merchant.id,
        pubkey: actorPubkey,
        status: paymentStatus,
        content: comment,
      }),
    );

    const actorProfile = session.profile;
    if (actorProfile) {
      setProfiles((prev) => ({
        ...prev,
        [actorPubkey]: actorProfile,
      }));
    }

    if (!intentToken) {
      setCheckinStatus("failed");
      setCheckinReason("missing_intent_token");
      setPublishError(
        `Intent creation failed (auth/signature). reason_code: ${intentReasonCode}`,
      );
      setIsPublishing(false);
      return;
    }

    try {
      setCheckinStatus("confirming");
      const confirmPayload = {
        event_id: eventId,
        place_id: merchant.id,
        pubkey: actorPubkey,
        payment_evidence: null,
      };
      const confirmBody = JSON.stringify(confirmPayload);
      const confirmAuth = await buildAuthHeaders({
        pubkey: actorPubkey,
        method: "POST",
        path: "/v1/checkins/confirm",
        nonce: randomNonce(),
        bodyBytes: new TextEncoder().encode(confirmBody),
        signerPreference,
      });

      await fetch("/api/checkins/confirm", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-checkin-intent": intentToken,
          "x-auth-event": confirmAuth.authEvent,
          "x-auth-nonce": confirmAuth.nonce,
        },
        body: confirmBody,
      });
    } catch {
      // Confirmation errors are reflected in poll status or follow-up refresh.
    }

    setCheckinStatus("pending");
    setCheckinReason("indexing_delay");
    await pollCheckinStatus(eventId, actorPubkey, merchant.id);

    setIsPublishing(false);
    setComposerStep("pay");
    setComposerOpen(true);

    setTimeout(() => {
      void placeFeed.refresh();
    }, 1200);

    setTimeout(() => {
      void placeFeed.refresh();
    }, 3000);
  };

  const showLoadMore = visibleCount < feedItems.length;
  const canRetryCheckin =
    !isPublishing &&
    (checkinStatus === "failed" ||
      checkinStatus === "not_found" ||
      Boolean(publishError));

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 transform transition-transform duration-300 ease-out",
        merchant ? "translate-y-0" : "translate-y-full",
      )}
    >
      <div className="h-px w-full bg-linear-to-r from-transparent via-[#00FF41] to-transparent shadow-[0_0_12px_#00FF41]" />

      <div className="max-h-[88vh] min-h-[52vh] overflow-y-auto border-t border-[#00FF41]/20 bg-[radial-gradient(circle_at_20%_-10%,rgba(0,255,65,0.14),transparent_40%),radial-gradient(circle_at_90%_-15%,rgba(247,147,26,0.16),transparent_38%),linear-gradient(to_bottom,#090b0c,#030304_72%)] px-4 pb-10 pt-4 text-gray-200 shadow-2xl backdrop-blur-md sm:px-5">
        <div className="mx-auto mb-5 h-1 w-16 rounded-full bg-white/25" />

        {merchant && (
          <>
            <header className="mb-5 rounded-2xl border border-[#00FF41]/25 bg-black/45 p-4 shadow-[inset_0_0_30px_rgba(0,255,65,0.08),0_0_20px_rgba(0,0,0,0.45)]">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-xl font-semibold tracking-tight text-white">
                    {merchant.name || "Bitcoin Merchant"}
                  </h2>
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                    <span className="inline-flex items-center gap-1 rounded-full border border-[#F7931A]/40 bg-[#F7931A]/12 px-2 py-0.5 text-[#F7B267]">
                      <MapPin className="h-3 w-3" />
                      {categoryLabel}
                    </span>
                    {hasLightning && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-[#00FF41]/35 bg-[#00FF41]/10 px-2 py-0.5 text-[#00FF41]">
                        <Zap className="h-3 w-3" /> LN
                      </span>
                    )}
                    {hasOnchain && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-white/20 px-2 py-0.5 text-gray-300">
                        <Bitcoin className="h-3 w-3" /> Onchain
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="rounded-full p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
                  aria-label="Close merchant drawer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between text-[11px] text-gray-400">
                  <span className="inline-flex items-center gap-1">
                    <Signal className="h-3.5 w-3.5" /> Confidence
                  </span>
                  <span>{Math.round(reliability * 100)}%</span>
                </div>
                <div className="h-2 rounded-full bg-black/40">
                  <div
                    className={cn(
                      "h-2 rounded-full transition-all",
                      reliability >= 0.7
                        ? "bg-[#00FF41]"
                        : reliability >= 0.4
                          ? "bg-[#F7931A]"
                          : "bg-gray-500",
                    )}
                    style={{
                      width: `${Math.max(4, Math.min(100, reliability * 100))}%`,
                    }}
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  onClick={openComposer}
                  className="col-span-2 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-[#00FF41]/45 bg-[#00FF41]/90 px-3 py-2 text-[13px] font-semibold text-black shadow-[0_0_18px_rgba(0,255,65,0.35)] transition hover:bg-[#67ff92]"
                >
                  <Zap className="h-4 w-4" /> Check in
                </button>
                <button
                  onClick={() => copyValue("event id", latestEventId)}
                  className="inline-flex min-h-[42px] items-center justify-center gap-1 rounded-lg border border-white/15 bg-black/35 px-3 py-2 text-[11px] text-gray-300 hover:bg-white/5"
                >
                  <Copy className="h-3.5 w-3.5" /> Copy event
                </button>
                <button
                  onClick={() => copyValue("place id", merchant.id)}
                  className="inline-flex min-h-[42px] items-center justify-center gap-1 rounded-lg border border-white/15 bg-black/35 px-3 py-2 text-[11px] text-gray-300 hover:bg-white/5"
                >
                  <Copy className="h-3.5 w-3.5" /> Copy place
                </button>
                <button
                  onClick={handleShare}
                  className="inline-flex min-h-[42px] items-center justify-center gap-1 rounded-lg border border-white/15 bg-black/35 px-3 py-2 text-[11px] text-gray-300 hover:bg-white/5"
                >
                  <Share2 className="h-3.5 w-3.5" /> Share
                </button>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${merchant.lat},${merchant.lon}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-[42px] items-center justify-center gap-1 rounded-lg border border-white/15 bg-black/35 px-3 py-2 text-[11px] text-gray-300 hover:bg-white/5"
                >
                  <Navigation className="h-3.5 w-3.5" /> Maps
                </a>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 rounded-xl border border-white/10 bg-black/35 p-3 text-[11px] sm:grid-cols-4">
                <div>
                  <p className="text-gray-500">Total signals</p>
                  <p className="mt-1 font-semibold text-gray-100">
                    {totalSignals}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Success count</p>
                  <p className="mt-1 font-semibold text-[#00FF41]">
                    {successSignals}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Current streak</p>
                  <p className="mt-1 font-semibold text-[#F7931A]">
                    {successStreak}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Last confirmed</p>
                  <p className="mt-1 font-semibold text-gray-100">
                    {lastConfirmedAt ? formatRelative(lastConfirmedAt) : "n/a"}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-[11px] text-gray-400">
                <span className="inline-flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" /> AI Summary (soon)
                </span>
                <span
                  className="cursor-help"
                  title={getFutureAiSummaryHint(merchant.id)}
                >
                  coming soon
                </span>
              </div>

              <div className="mt-3 rounded-lg border border-white/10 bg-black/40 px-3 py-2 font-mono text-[11px] text-gray-400">
                <div className="flex items-center justify-between gap-2">
                  <span>place_id</span>
                  <button
                    onClick={() => copyValue("place_id", merchant.id)}
                    className="inline-flex items-center gap-1 text-gray-300 hover:text-white"
                  >
                    <Copy className="h-3 w-3" /> {shortHex(merchant.id, 12, 6)}
                  </button>
                </div>
                {activeCheckinId && (
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <span>event_id</span>
                    <button
                      onClick={() => copyValue("event_id", activeCheckinId)}
                      className="inline-flex items-center gap-1 text-gray-300 hover:text-white"
                    >
                      <Copy className="h-3 w-3" /> {shortHex(activeCheckinId)}
                    </button>
                  </div>
                )}
              </div>
            </header>

            {copiedHint && (
              <div className="mb-3 inline-flex items-center gap-1 rounded-md border border-[#00FF41]/35 bg-[#00FF41]/10 px-2 py-1 text-[11px] font-medium text-[#9affbc]">
                <CheckCircle2 className="h-3.5 w-3.5" /> {copiedHint}
              </div>
            )}

            {publishError && (
              <div className="mb-4 rounded-lg border border-red-500/30 bg-red-900/20 px-3 py-2 text-xs text-red-300">
                {publishError}
              </div>
            )}

            {(checkinStatus !== "idle" || publishError) && (
              <div
                className={cn(
                  "mb-4 rounded-xl border px-3 py-3 text-xs shadow-[inset_0_0_18px_rgba(255,255,255,0.04)]",
                  checkinStatus === "ok"
                    ? "border-[#00FF41]/35 bg-[#00FF41]/10"
                    : checkinStatus === "failed" || checkinStatus === "not_found"
                      ? "border-red-500/35 bg-red-950/20"
                      : "border-[#F7931A]/35 bg-[#F7931A]/10",
                )}
              >
                {(checkinStatus === "intent_created" ||
                  checkinStatus === "publishing" ||
                  checkinStatus === "confirming" ||
                  checkinStatus === "pending") && (
                  <div className="inline-flex items-center gap-2 text-[#F7B267]">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {checkinStatus === "intent_created" && "Preparing intent…"}
                    {checkinStatus === "publishing" && "Publishing signal…"}
                    {checkinStatus === "confirming" && "Confirming check-in…"}
                    {checkinStatus === "pending" && "Indexing… pending"}
                  </div>
                )}
                {checkinStatus === "ok" && (
                  <div className="inline-flex items-center gap-2 text-[#8cffb0]">
                    <CheckCircle2 className="h-4 w-4" /> Confirmed
                  </div>
                )}
                {(checkinStatus === "failed" || checkinStatus === "not_found") && (
                  <div className="inline-flex items-center gap-2 text-red-300">
                    <AlertCircle className="h-4 w-4" />
                    {checkinStatus === "not_found" ? "Not found yet" : "Verification failed"}
                    {checkinReason ? ` (${checkinReason})` : ""}
                  </div>
                )}
                {activeCheckinId && (
                  <div className="mt-1 font-mono text-[11px] text-gray-300/90">
                    event {shortHex(activeCheckinId)}
                  </div>
                )}
                {canRetryCheckin && (
                  <button
                    onClick={handleSubmitReport}
                    disabled={isPublishing || checkinStatus === "pending"}
                    className="mt-2 inline-flex min-h-[38px] items-center gap-2 rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-red-200 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <AlertCircle className="h-3.5 w-3.5" /> Retry check-in
                  </button>
                )}
              </div>
            )}

            {composerOpen && (
              <section className="mb-4 rounded-xl border border-[#F7931A]/35 bg-black/35 p-4 shadow-[inset_0_0_18px_rgba(247,147,26,0.1)]">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-[#F7B267]">
                    Check-in Composer
                  </h3>
                  <button
                    onClick={() => setComposerOpen(false)}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    Close
                  </button>
                </div>

                {session.type === "anon" ? (
                  <button
                    onClick={() =>
                      gates.openForAction({
                        kind: "need_identity",
                        reason: "missing_identity",
                      })
                    }
                    className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-xs text-gray-200"
                  >
                    <KeyRound className="h-4 w-4" /> Login to continue
                  </button>
                ) : (
                  <>
                    {composerStep === "broadcast" ? (
                      <>
                        <p className="mb-2 text-[11px] text-gray-400">
                          Step 1: broadcast your Nostr check-in proof.
                        </p>
                        <div className="mb-3 grid grid-cols-3 gap-2">
                          <button
                            onClick={() => setPaymentStatus("success")}
                            className={cn(
                              "rounded-lg border px-2 py-2 text-[11px]",
                              paymentStatus === "success"
                                ? "border-[#00FF41]/50 bg-[#00FF41]/10 text-[#00FF41]"
                                : "border-white/20 bg-black/30 text-gray-300",
                            )}
                          >
                            <ThumbsUp className="mx-auto mb-1 h-4 w-4" /> Worked
                          </button>
                          <button
                            onClick={() => setPaymentStatus("failed")}
                            className={cn(
                              "rounded-lg border px-2 py-2 text-[11px]",
                              paymentStatus === "failed"
                                ? "border-red-500/50 bg-red-500/10 text-red-300"
                                : "border-white/20 bg-black/30 text-gray-300",
                            )}
                          >
                            <ThumbsDown className="mx-auto mb-1 h-4 w-4" />{" "}
                            Failed
                          </button>
                          <button
                            onClick={() => setPaymentStatus("did_not_try")}
                            className={cn(
                              "rounded-lg border px-2 py-2 text-[11px]",
                              paymentStatus === "did_not_try"
                                ? "border-white/50 bg-white/10 text-white"
                                : "border-white/20 bg-black/30 text-gray-300",
                            )}
                          >
                            <Meh className="mx-auto mb-1 h-4 w-4" /> No try
                          </button>
                        </div>

                        <textarea
                          className="mb-3 h-24 w-full resize-none rounded-lg border border-white/20 bg-black/40 p-3 text-sm text-gray-200 placeholder:text-gray-600 focus:border-[#F7931A] focus:outline-none"
                          placeholder="Optional note for future rovers..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                        />

                        <button
                          onClick={handleSubmitReport}
                          disabled={isPublishing || checkinStatus === "pending"}
                          className="inline-flex w-full min-h-[46px] items-center justify-center gap-2 rounded-xl border border-[#00FF41]/40 bg-[#00FF41] px-3 py-2 text-sm font-semibold uppercase tracking-[0.16em] text-black shadow-[0_0_22px_rgba(0,255,65,0.35)] transition hover:bg-[#6cff96] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isPublishing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Zap className="h-4 w-4" />
                          )}
                          {isPublishing ? "Checking in..." : "Check in"}
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="mb-2 text-[11px] text-gray-400">
                          Step 2 (optional): add payment proof or boost. This
                          step never runs unless you trigger it.
                        </p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <button
                            onClick={() =>
                              gates.openForAction({
                                kind: "need_wallet",
                                reason: "optional_payment",
                              })
                            }
                            className="rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-xs text-gray-200 hover:bg-white/5"
                          >
                            Open wallet / NWC
                          </button>
                          <button
                            onClick={() => setComposerOpen(false)}
                            className="rounded-lg border border-[#F7931A]/30 bg-[#F7931A]/10 px-3 py-2 text-xs text-[#F7931A] hover:bg-[#F7931A]/20"
                          >
                            Done
                          </button>
                        </div>
                      </>
                    )}
                  </>
                )}
              </section>
            )}

            <section className="pt-2">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-[11px] uppercase tracking-[0.2em] text-gray-500">
                  Place timeline
                </h3>
                {placeFeed.loading && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-[#F7931A]">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Syncing
                  </span>
                )}
              </div>

              {feedItems.length === 0 && !placeFeed.loading ? (
                <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-3 text-xs text-gray-500">
                  No signals detected in this sector.
                </div>
              ) : (
                <div className="space-y-3">
                  {visibleItems.map((item) => (
                    <FeedRow
                      key={item.id}
                      item={item}
                      profile={profiles[item.pubkey]}
                      expanded={expandedId === item.id}
                      failedReason={failedBroadcastMap[item.id]}
                      onToggle={() =>
                        setExpandedId((prev) =>
                          prev === item.id ? null : item.id,
                        )
                      }
                      onCopy={(label, value) => {
                        void copyValue(label, value);
                      }}
                    />
                  ))}
                </div>
              )}

              {showLoadMore && (
                <button
                  onClick={() => setVisibleCount((prev) => prev + 30)}
                  className="mt-3 w-full rounded-lg border border-white/15 bg-black/30 py-2 text-xs text-gray-300 hover:bg-white/5"
                >
                  Load more
                </button>
              )}
            </section>
          </>
        )}
      </div>

      <IdentityGateModal
        isOpen={gates.identityOpen}
        onClose={gates.closeIdentity}
      />
      <WalletGateModal isOpen={gates.walletOpen} onClose={gates.closeWallet} />
    </div>
  );
}

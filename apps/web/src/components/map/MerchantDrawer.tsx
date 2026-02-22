import React, { useState, useEffect, useRef } from "react";
import { Merchant } from "@/lib/types";
import {
  X,
  MapPin,
  Zap,
  Bitcoin,
  Navigation,
  KeyRound,
  ThumbsUp,
  ThumbsDown,
  Meh,
  Activity,
  Signal,
  Loader2,
  AlertCircle,
  CheckCircle2,
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
import { successCount as countSuccessfulSignals } from "@/domain/signals/selectors";

interface MerchantDrawerProps {
  merchant: Merchant | null;
  onClose: () => void;
}

type ProfileMap = Record<string, NDKUserProfile>;

type CheckinStatusState = "idle" | "pending" | "ok" | "failed" | "not_found";

function tagTruthy(v: unknown): boolean {
  if (v === true) return true;
  if (typeof v === "number") return v === 1;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    return s === "yes" || s === "true" || s === "1" || s === "y";
  }
  return false;
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
  const placeFeed = useSignalFeed({
    mode: "place",
    placeId: merchant?.id ?? null,
    enabled: Boolean(merchant?.id),
  });

  // Data State
  const [profiles, setProfiles] = useState<ProfileMap>({});
  const hydratedPubkeysRef = useRef<Set<string>>(new Set());

  // Reporting State
  const [isReporting, setIsReporting] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "success" | "failed" | "did_not_try"
  >("success");
  const [comment, setComment] = useState("");

  // UX State
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [checkinStatus, setCheckinStatus] = useState<CheckinStatusState>("idle");
  const [checkinReason, setCheckinReason] = useState<string | null>(null);
  const [activeCheckinId, setActiveCheckinId] = useState<string | null>(null);
  const pollRunIdRef = useRef(0);

  // Scroll Ref
  const feedTopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      pollRunIdRef.current += 1;
    };
  }, []);

  // 1. Feed + profile hydration (index-backed API first, relay only for profiles)
  useEffect(() => {
    const run = async () => {
      if (!merchant) {
        return;
      }

      setIsReporting(false);
      setPaymentStatus("success");
      setComment("");
      setPublishError(null);
      setCheckinStatus("idle");
      setCheckinReason(null);
      setActiveCheckinId(null);
    };

    void run();
  }, [merchant]);

  const reliability = placeFeed.confidenceScore / 100;

  useEffect(() => {
    const run = async () => {
      if (!ndk || placeFeed.items.length === 0) return;
      const uniquePubkeys = Array.from(new Set(placeFeed.items.map((n) => n.pubkey)));
      const newProfiles: ProfileMap = {};
      await Promise.all(
        uniquePubkeys.map(async (pk) => {
          if (hydratedPubkeysRef.current.has(pk)) return;
          const user = ndk.getUser({ pubkey: pk });
          const profile = await user.fetchProfile();
          hydratedPubkeysRef.current.add(pk);
          if (profile) newProfiles[pk] = profile;
        }),
      );
      if (Object.keys(newProfiles).length > 0) {
        setProfiles((prev) => ({ ...prev, ...newProfiles }));
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

  // Handlers
  const handleLoginStart = () => {
    gates.openForAction({ kind: "need_identity", reason: "missing_identity" });
  };

  const handleSubmitReport = async () => {
    if (!merchant) return;
    if (checkinStatus === "pending") return;

    const nextAction = transmitSignalFlow.nextAction;
    if (nextAction.kind !== "run") {
      if (nextAction.kind === "need_wallet") {
        setPublishError("reason_code: flow_unexpected_wallet_gate");
        return;
      }
      if (nextAction.kind === "need_identity") {
        gates.openForAction(nextAction);
      }
      setPublishError(`reason_code: ${nextAction.reason || "flow_error"}`);
      return;
    }

    setIsPublishing(true);
    setPublishError(null);
    setCheckinStatus("pending");
    setCheckinReason(null);
    setActiveCheckinId(null);

    const pollCheckinStatus = async (checkinId: string) => {
      const runId = ++pollRunIdRef.current;
      const startedAt = Date.now();

      while (Date.now() - startedAt < 20_000) {
        if (pollRunIdRef.current !== runId) return;
        try {
          const resp = await fetch(
            `/api/checkins/status?checkin_id=${encodeURIComponent(checkinId)}`,
            { method: "GET" },
          );
          const data = await resp.json().catch(() => null);
          const status = (data?.status as CheckinStatusState | undefined) || "failed";
          const reason = (data?.reason_code as string | null | undefined) ?? null;
          if (status === "ok" || status === "failed" || status === "not_found") {
            setCheckinStatus(status);
            setCheckinReason(reason);
            return;
          }
          setCheckinStatus("pending");
        } catch {
          // Keep retrying until timeout.
        }
        await new Promise((resolve) => setTimeout(resolve, 800));
      }

      if (pollRunIdRef.current === runId) {
        setCheckinStatus("failed");
        setCheckinReason("status_timeout");
      }
    };

    // 1) Create check-in intent
    let intentToken = "";
    try {
      const intentAuth = await buildAuthHeaders({
        pubkey: session.pubkey || "",
        method: "POST",
        path: "/v1/checkins/intent",
        nonce: randomNonce(),
        bodyBytes: new Uint8Array(),
      });
      const intentRes = await fetch("/api/checkins/intent", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-pubkey": session.pubkey || "",
          "x-auth-event": intentAuth.authEvent,
          "x-auth-nonce": intentAuth.nonce,
        },
        body: JSON.stringify({ placeId: merchant.id }),
      });
      const intentData = await intentRes.json();
      intentToken = intentData.intent_token || "";
    } catch (e: unknown) {
      if (e instanceof Error && e.message === "missing_signer") {
        setPublishError("Missing signer for check-in ownership proof");
      }
      intentToken = "";
    }

    // 2) Publish to relays
    const publishResult = await transmitSignalFlow.run(async () =>
      publishSignal(merchant.id, paymentStatus, comment),
    );

    // 3) Confirm lifecycle with backend
    if (publishResult.ok && intentToken) {
      const checkinId = publishResult.eventId || "";
      const confirmPayload = {
        event_id: checkinId,
        place_id: merchant.id,
        pubkey: session.pubkey,
        payment_evidence: null,
      };
      const confirmBody = JSON.stringify(confirmPayload);
      const confirmAuth = await buildAuthHeaders({
        pubkey: session.pubkey || "",
        method: "POST",
        path: "/v1/checkins/confirm",
        nonce: randomNonce(),
        bodyBytes: new TextEncoder().encode(confirmBody),
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
      if (!checkinId) {
        setCheckinStatus("failed");
        setCheckinReason("missing_checkin_id");
      } else {
        placeFeed.addOptimistic(
          createOptimisticSignalFeedItem({
            id: checkinId,
            placeId: merchant.id,
            pubkey: session.pubkey || "unknown",
            status: paymentStatus,
            content: comment,
          }),
        );
        setActiveCheckinId(checkinId);
        await pollCheckinStatus(checkinId);
      }
    } else if (publishResult.ok) {
      setCheckinStatus("failed");
      setCheckinReason("missing_intent_token");
    }

    setIsPublishing(false);

    if (publishResult.ok) {
      // Add current user profile to map if missing
      if (session.profile && session.pubkey) {
        setProfiles((prev) => ({
          ...prev,
          [session.pubkey!]: session.profile!,
        }));
      }

      setIsReporting(false);

      // Scroll to top
      setTimeout(() => {
        feedTopRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);

      // Indexer catch-up: refresh feed after confirm roundtrip.
      setTimeout(() => {
        void placeFeed.refresh();
      }, 1200);
    } else {
      setPublishError("Signal failed to reach relays. Please retry.");
      setCheckinStatus("failed");
      setCheckinReason("relay_publish_failed");
    }
  };

  const successCount = countSuccessfulSignals(placeFeed.items);

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 transform transition-transform duration-300 ease-out",
        merchant ? "translate-y-0" : "translate-y-full",
      )}
    >
      {/* Neon Top Border */}
      <div className="h-px w-full bg-linear-to-r from-transparent via-[#F7931A] to-transparent shadow-[0_0_10px_#F7931A]" />

      <div className="bg-[#050505] border-t border-white/10 pb-10 pt-4 px-6 shadow-2xl min-h-[50vh] max-h-[85vh] overflow-y-auto font-mono text-gray-200">
        {/* Drag Handle */}
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6" />

        {merchant && (
          <>
            {/* Header Section */}
            <div className="flex justify-between items-start mb-2">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight uppercase">
                  {merchant.name || "Bitcoin Merchant"}
                </h2>
                <div className="flex items-center text-[#F7931A] text-xs mt-1 uppercase tracking-widest font-bold">
                  <MapPin className="w-3 h-3 mr-1" />
                  <span>{categoryLabel}</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-500 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Signal Strength Indicator */}
            <div className="mb-6 flex items-center">
              {reliability >= 0.7 ? (
                <div className="inline-flex items-center gap-2 text-[#00FF41] text-[10px] border border-[#00FF41]/30 bg-[#00FF41]/5 px-3 py-1.5 rounded uppercase tracking-widest shadow-[0_0_8px_rgba(0,255,65,0.1)]">
                  <Activity className="w-3 h-3" />
                  <span className="font-bold">VERIFIED: HIGH CONFIDENCE</span>
                </div>
              ) : reliability >= 0.4 ? (
                <div className="inline-flex items-center gap-2 text-[#F7931A] text-[10px] border border-[#F7931A]/30 bg-[#F7931A]/5 px-3 py-1.5 rounded uppercase tracking-widest">
                  <Signal className="w-3 h-3" />
                  <span className="font-bold">
                    PARTIALLY VERIFIED ({successCount})
                  </span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 text-gray-500 text-[10px] border border-white/10 bg-white/5 px-3 py-1.5 rounded uppercase tracking-widest">
                  <Signal className="w-3 h-3" />
                  <span className="font-bold">UNVERIFIED SIGNAL</span>
                </div>
              )}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-8">
              {hasLightning && (
                <span className="inline-flex items-center px-2 py-1 rounded border border-[#F7931A]/40 text-[#F7931A] text-[9px] font-bold uppercase tracking-wider bg-[#F7931A]/5">
                  <Zap className="w-3 h-3 mr-1 fill-[#F7931A]" /> Lightning
                </span>
              )}
              {hasOnchain && (
                <span className="inline-flex items-center px-2 py-1 rounded border border-white/20 text-gray-400 text-[9px] font-bold uppercase tracking-wider bg-white/5">
                  <Bitcoin className="w-3 h-3 mr-1" /> On-Chain
                </span>
              )}
            </div>

            {/* ACTION AREA */}
            <div className="mb-8 p-1 bg-white/5 rounded-xl border border-white/5">
              {session.type === "anon" ? (
                // 1. LOGIN REQUIRED
                <button
                  onClick={handleLoginStart}
                  className="w-full py-6 flex flex-col items-center justify-center gap-2 group"
                >
                  <KeyRound className="w-6 h-6 text-gray-500 group-hover:text-[#F7931A] transition-colors" />
                  <span className="text-xs uppercase tracking-widest font-bold text-gray-400 group-hover:text-white">
                    Login to Broadcast
                  </span>
                </button>
              ) : !isReporting ? (
                // 2. ACTIONS (LOGGED IN)
                <div className="grid grid-cols-2 gap-1">
                  <button
                    onClick={() => setIsReporting(true)}
                    className="bg-[#F7931A] text-black font-bold py-4 rounded-lg flex items-center justify-center gap-2 hover:brightness-110 transition-all uppercase tracking-wide text-xs"
                  >
                    <Zap className="w-4 h-4 fill-black" /> Report Status
                  </button>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${merchant.lat},${merchant.lon}`}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-black/40 text-gray-300 font-bold py-4 rounded-lg flex items-center justify-center gap-2 hover:bg-white/10 transition-all uppercase tracking-wide text-xs"
                  >
                    <Navigation className="w-4 h-4" /> Navigate
                  </a>
                </div>
              ) : (
                // 3. REPORTING FORM
                <div className="p-4 animate-in zoom-in-95">
                  <h4 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-widest text-center">
                    Confirm Payment Status
                  </h4>

                  {publishError && (
                    <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded text-red-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {publishError}
                    </div>
                  )}

                  {checkinStatus === "pending" && (
                    <div className="mb-4 p-3 bg-[#F7931A]/10 border border-[#F7931A]/30 rounded text-[#F7931A] text-xs flex items-center gap-2">
                      <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
                      <div>
                        <div className="font-bold">Verifying check-in...</div>
                        {activeCheckinId && (
                          <div className="text-[10px] text-[#F7931A]/80 font-mono mt-1">
                            {activeCheckinId.slice(0, 12)}...
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {checkinStatus === "ok" && (
                    <div className="mb-4 p-3 bg-[#00FF41]/10 border border-[#00FF41]/30 rounded text-[#00FF41] text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      Check-in confirmed.
                    </div>
                  )}

                  {(checkinStatus === "failed" || checkinStatus === "not_found") && (
                    <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded text-red-300 text-xs">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span className="font-bold">
                          Check-in verification {checkinStatus === "not_found" ? "not found" : "failed"}.
                        </span>
                      </div>
                      {checkinReason && (
                        <div className="mt-2 text-[10px] text-red-300/80 font-mono">
                          reason_code: {checkinReason}
                        </div>
                      )}
                      <button
                        onClick={handleSubmitReport}
                        disabled={isPublishing}
                        className="mt-3 bg-red-500/20 border border-red-500/40 text-red-200 px-3 py-1.5 rounded text-[10px] uppercase tracking-widest hover:bg-red-500/30 disabled:opacity-50"
                      >
                        Retry Check-in
                      </button>
                    </div>
                  )}

                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setPaymentStatus("success")}
                      className={cn(
                        "flex-1 py-3 rounded border flex flex-col items-center gap-1 transition-all",
                        paymentStatus === "success"
                          ? "bg-[#00FF41]/10 border-[#00FF41] text-[#00FF41]"
                          : "bg-black border-white/10 text-gray-500 hover:border-white/30",
                      )}
                    >
                      <ThumbsUp className="w-4 h-4" />{" "}
                      <span className="text-[9px] font-bold uppercase">
                        Worked
                      </span>
                    </button>
                    <button
                      onClick={() => setPaymentStatus("failed")}
                      className={cn(
                        "flex-1 py-3 rounded border flex flex-col items-center gap-1 transition-all",
                        paymentStatus === "failed"
                          ? "bg-[#FF3B30]/10 border-[#FF3B30] text-[#FF3B30]"
                          : "bg-black border-white/10 text-gray-500 hover:border-white/30",
                      )}
                    >
                      <ThumbsDown className="w-4 h-4" />{" "}
                      <span className="text-[9px] font-bold uppercase">
                        Failed
                      </span>
                    </button>
                    <button
                      onClick={() => setPaymentStatus("did_not_try")}
                      className={cn(
                        "flex-1 py-3 rounded border flex flex-col items-center gap-1 transition-all",
                        paymentStatus === "did_not_try"
                          ? "bg-white/10 border-white text-white"
                          : "bg-black border-white/10 text-gray-500 hover:border-white/30",
                      )}
                    >
                      <Meh className="w-4 h-4" />{" "}
                      <span className="text-[9px] font-bold uppercase">
                        No Try
                      </span>
                    </button>
                  </div>

                  <textarea
                    className="w-full p-3 bg-[#050505] text-sm text-gray-300 border border-white/20 rounded mb-4 h-24 resize-none focus:outline-none focus:border-[#F7931A] font-mono placeholder:text-gray-700"
                    placeholder="Add intel (e.g. 'Terminal behind counter')..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={handleSubmitReport}
                      disabled={isPublishing || checkinStatus === "pending"}
                      className="flex-1 bg-[#F7931A] text-black font-bold py-3 rounded text-xs uppercase tracking-widest hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isPublishing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Zap className="w-4 h-4 fill-black" />
                      )}
                      {isPublishing ? "Broadcasting..." : checkinStatus === "pending" ? "Verifying..." : "Transmit Signal"}
                    </button>
                    <button
                      onClick={() => setIsReporting(false)}
                      disabled={isPublishing}
                      className="px-4 border border-white/20 text-gray-400 font-bold py-3 rounded text-xs uppercase tracking-widest hover:bg-white/5 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* FEED SECTION */}
            <div className="border-t border-white/10 pt-6">
              <div ref={feedTopRef} />
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">
                Signal Feed
              </h3>

              {placeFeed.loading ? (
                <div className="text-xs text-[#F7931A] animate-pulse font-mono">
                  Loading indexed signal feed...
                </div>
              ) : placeFeed.items.length === 0 ? (
                <div className="text-xs text-gray-600 font-mono">
                  No signals detected in this sector.
                </div>
              ) : (
                <div className="space-y-3">
                  {placeFeed.items.map((note) => {
                    const profile = profiles[note.pubkey];
                    const name =
                      profile?.name ||
                      profile?.displayName ||
                      note.pubkey.slice(0, 8);
                    const image = profile?.image;

                    const isSuccess = note.status === "success";
                    const isFail = note.status === "failed";

                    return (
                      <div
                        key={note.id}
                        className="bg-white/5 border border-white/5 p-3 rounded hover:border-white/10 transition-colors animate-in fade-in slide-in-from-top-2"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          {image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={image}
                              alt={name}
                              className="w-6 h-6 rounded-full object-cover grayscale opacity-80"
                            />
                          ) : (
                            <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-[8px] text-gray-400 font-bold">
                              {name.slice(0, 2).toUpperCase()}
                            </div>
                          )}

                          <span className="font-bold text-gray-300 text-xs truncate max-w-37.5">
                            {name}
                          </span>

                          <span className="text-[9px] text-gray-600 ml-auto font-mono">
                            {new Date(note.createdAtMs).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex gap-2 items-start">
                          {isSuccess && (
                            <CheckCircle2 className="w-3 h-3 text-[#00FF41] mt-0.5 shrink-0" />
                          )}
                          {isFail && (
                            <AlertCircle className="w-3 h-3 text-[#FF3B30] mt-0.5 shrink-0" />
                          )}
                          <p className="text-gray-400 text-xs leading-relaxed wrap-break-word w-full">
                            {note.content
                              .replace(/Checking in at .* ⚡ #SatsRover/, "")
                              .replace(/✅|❌|👀/, "")
                              .trim()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <IdentityGateModal
        isOpen={gates.identityOpen}
        onClose={gates.closeIdentity}
      />
      <WalletGateModal
        isOpen={gates.walletOpen}
        onClose={gates.closeWallet}
      />
    </div>
  );
}

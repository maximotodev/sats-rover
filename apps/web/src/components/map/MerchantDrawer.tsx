import React, { useState, useEffect, useRef } from "react";
import { Merchant } from "@/lib/types";
import {
  X,
  MapPin,
  Zap,
  Bitcoin,
  Navigation,
  KeyRound,
  Eye,
  EyeOff,
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
import { useSession } from "@/contexts/NostrSessionContext";
import { NDKEvent, NDKUserProfile } from "@nostr-dev-kit/ndk";
import { calculateMerchantIntensity } from "@/lib/scoring";

interface MerchantDrawerProps {
  merchant: Merchant | null;
  onClose: () => void;
}

type ProfileMap = Record<string, NDKUserProfile>;

function tagTruthy(v: any): boolean {
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
  const { session, loginWithExtension, loginWithNsec, publishSignal, ndk } =
    useSession();

  // Data State
  const [reviews, setReviews] = useState<NDKEvent[]>([]);
  const [profiles, setProfiles] = useState<ProfileMap>({});
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Login UI State
  const [showNsecInput, setShowNsecInput] = useState(false);
  const [nsec, setNsec] = useState("");
  const [showSecret, setShowSecret] = useState(false);

  // Reporting State
  const [isReporting, setIsReporting] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "success" | "failed" | "did_not_try"
  >("success");
  const [comment, setComment] = useState("");

  // UX State
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  // Reliability Score
  const [reliability, setReliability] = useState(0);

  // Scroll Ref
  const feedTopRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Logic
  useEffect(() => {
    if (merchant && ndk) {
      setLoadingReviews(true);
      setIsReporting(false);
      setPaymentStatus("success");
      setComment("");
      setPublishError(null);

      // Fetch by place ID
      const filter = {
        kinds: [1],
        "#place": [merchant.id],
        "#t": ["satsrover"],
        limit: 50,
      };

      ndk.fetchEvents(filter).then(async (events) => {
        const notes = Array.from(events).sort(
          (a, b) => b.created_at! - a.created_at!,
        );
        setReviews(notes);

        const score = calculateMerchantIntensity(notes);
        setReliability(score);

        if (notes.length > 0) {
          const uniquePubkeys = Array.from(new Set(notes.map((n) => n.pubkey)));
          const newProfiles: ProfileMap = {};
          await Promise.all(
            uniquePubkeys.map(async (pk) => {
              const user = ndk.getUser({ pubkey: pk });
              const profile = await user.fetchProfile();
              if (profile) newProfiles[pk] = profile;
            }),
          );
          setProfiles((prev) => ({ ...prev, ...newProfiles }));
        }

        setLoadingReviews(false);
      });
    } else {
      setReviews([]);
      setReliability(0);
    }
  }, [merchant, ndk]);

  const categoryLabel =
    typeof merchant?.category === "string" && merchant.category
      ? merchant.category.replaceAll("_", " ")
      : "merchant";

  const hasLightning = tagTruthy(merchant?.tags?.["payment:lightning"]);
  const hasOnchain =
    tagTruthy(merchant?.tags?.["currency:XBT"]) ||
    tagTruthy(merchant?.tags?.["payment:onchain"]);

  // Handlers
  const handleLoginStart = async () => {
    if ((window as any).nostr) {
      try {
        await loginWithExtension();
      } catch (e) {
        setShowNsecInput(true);
      }
    } else {
      setShowNsecInput(true);
    }
  };

  const handleNsecSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nsec.startsWith("nsec1")) {
      alert("Invalid format");
      return;
    }
    await loginWithNsec(nsec);
    setShowNsecInput(false);
  };

  const handleSubmitReport = async () => {
    if (!merchant) return;

    setIsPublishing(true);
    setPublishError(null);

    // 1. Publish to Network
    const success = await publishSignal(
      merchant.name,
      merchant.id,
      merchant.lat,
      merchant.lon,
      paymentStatus,
      "lightning",
      comment,
    );

    setIsPublishing(false);

    if (success) {
      // 2. Optimistic UI Update (Show immediately without refetch)
      const statusEmoji =
        paymentStatus === "success"
          ? "✅"
          : paymentStatus === "failed"
            ? "❌"
            : "👀";

      const optimisticNote = {
        id: `opt-${Date.now()}`,
        pubkey: session.pubkey || "unknown",
        created_at: Math.floor(Date.now() / 1000),
        content: `${statusEmoji} ${comment}`,
        tags: [["status", paymentStatus]],
      } as NDKEvent;

      setReviews((prev) => [optimisticNote, ...prev]);

      // Add current user profile to map if missing
      if (session.user?.profile && session.pubkey) {
        setProfiles((prev) => ({
          ...prev,
          [session.pubkey!]: session.user!.profile!,
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
    } else {
      setPublishError("Signal failed to reach relays. Please retry.");
    }
  };

  const successCount = reviews.filter((r) =>
    r.tags.some((t) => t[0] === "status" && t[1] === "success"),
  ).length;

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
                showNsecInput ? (
                  <form
                    onSubmit={handleNsecSubmit}
                    className="p-4 animate-in fade-in"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <label className="text-[10px] font-bold text-[#F7931A] uppercase tracking-widest">
                        Manual Uplink
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowNsecInput(false)}
                      >
                        <X className="w-4 h-4 text-gray-500 hover:text-white" />
                      </button>
                    </div>
                    <div className="relative mb-3">
                      <input
                        type={showSecret ? "text" : "password"}
                        placeholder="nsec1..."
                        className="w-full bg-black text-sm text-white p-3 pr-10 border border-white/20 rounded focus:border-[#F7931A] focus:outline-none transition-colors font-mono"
                        value={nsec}
                        onChange={(e) => setNsec(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSecret(!showSecret)}
                        className="absolute right-3 top-3.5 text-gray-500 hover:text-white"
                      >
                        {showSecret ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-[#F7931A] text-black text-xs font-bold py-3 rounded uppercase tracking-widest hover:brightness-110"
                    >
                      Authenticate
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={handleLoginStart}
                    className="w-full py-6 flex flex-col items-center justify-center gap-2 group"
                  >
                    <KeyRound className="w-6 h-6 text-gray-500 group-hover:text-[#F7931A] transition-colors" />
                    <span className="text-xs uppercase tracking-widest font-bold text-gray-400 group-hover:text-white">
                      Login to Broadcast
                    </span>
                  </button>
                )
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
                      disabled={isPublishing}
                      className="flex-1 bg-[#F7931A] text-black font-bold py-3 rounded text-xs uppercase tracking-widest hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isPublishing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Zap className="w-4 h-4 fill-black" />
                      )}
                      {isPublishing ? "Broadcasting..." : "Transmit Signal"}
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

              {loadingReviews ? (
                <div className="text-xs text-[#F7931A] animate-pulse font-mono">
                  Scanning relays for telemetry...
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-xs text-gray-600 font-mono">
                  No signals detected in this sector.
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.map((note) => {
                    const profile = profiles[note.pubkey];
                    const name =
                      profile?.name ||
                      profile?.displayName ||
                      note.pubkey.slice(0, 8);
                    const image = profile?.image;

                    const statusTag = note.tags.find(
                      (t) => t[0] === "status",
                    )?.[1];
                    const isSuccess = statusTag === "success";
                    const isFail = statusTag === "failed";

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
                            {new Date(
                              note.created_at! * 1000,
                            ).toLocaleDateString()}
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
    </div>
  );
}

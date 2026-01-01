import React, { useEffect, useState } from "react";
import { Trophy, Map, Zap, X, Loader2, Shield, Target } from "lucide-react";
import { useSession } from "@/contexts/NostrSessionContext";
import { cn } from "@/lib/utils";
import { Share2 } from "lucide-react";

interface EarnDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EarnDrawer({ isOpen, onClose }: EarnDrawerProps) {
  const { ndk, session } = useSession();
  const [checkInCount, setCheckInCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch real user stats from Nostr when drawer opens
  useEffect(() => {
    if (isOpen && session.type !== "anon" && session.pubkey && ndk) {
      setLoading(true);
      // Query: "How many kind 1 events has this user published with #satsrover tag?"
      ndk
        .fetchEvents({
          authors: [session.pubkey],
          kinds: [1],
          "#t": ["satsrover"],
        })
        .then((events) => {
          setCheckInCount(events.size);
          setLoading(false);
        });
    }
  }, [isOpen, session, ndk]);

  if (!isOpen) return null;

  // Calculate Rank based on check-ins
  const rankLevel = Math.floor(checkInCount / 3) + 1;
  const rankTitle =
    rankLevel === 1
      ? "NOVICE SCOUT"
      : rankLevel === 2
        ? "FIELD AGENT"
        : rankLevel === 3
          ? "NODE RUNNER"
          : "CYPHERPUNK";
  // NEW: Share Function
  const handleShare = () => {
    const text = `I'm exploring the sovereign web with #SatsRover 🌍⚡\n\nRank: ${rankTitle}\nCheck-ins: ${checkInCount}\n\nJoin the hunt: https://satsrover.vercel.app`;
    if (navigator.share) {
      navigator
        .share({
          title: "SatsRover Status",
          text,
          url: "https://satsrover.vercel.app",
        })
        .catch(console.error);
    } else {
      navigator.clipboard.writeText(text);
      alert("Stats copied to clipboard! Paste it on Nostr.");
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md pointer-events-auto"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-[#121212] border border-white/10 rounded-t-2xl sm:rounded-2xl p-6 pointer-events-auto shadow-2xl animate-in slide-in-from-bottom text-white font-mono">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-bitcoin">
            <Trophy className="w-5 h-5" />
            PROOF_OF_PRESENCE
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {session.type === "anon" ? (
          <div className="text-center py-12 border border-dashed border-white/20 rounded-xl">
            <Shield className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">IDENTITY_REQUIRED</p>
            <p className="text-[10px] text-gray-600 mt-1">
              Connect Nostr to track reputation.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Check-in Counter */}
              <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-bitcoin/5 transform scale-0 group-hover:scale-100 transition-transform duration-500" />
                <span className="text-4xl font-bold text-bitcoin z-10">
                  {loading ? (
                    <Loader2 className="animate-spin w-8 h-8 opacity-50" />
                  ) : (
                    checkInCount
                  )}
                </span>
                <span className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mt-2 z-10">
                  Check-ins
                </span>
              </div>

              {/* Rank Display */}
              <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center relative overflow-hidden">
                <span className="text-3xl font-bold text-matrix z-10">
                  LVL {rankLevel}
                </span>
                <span className="text-[9px] text-matrix/70 uppercase tracking-widest mt-2 z-10">
                  {rankTitle}
                </span>
              </div>
            </div>

            {/* Missions List */}
            <div>
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Target className="w-3 h-3" /> Active Missions
              </h3>

              <div className="space-y-2">
                <MissionRow
                  icon={Map}
                  title="First Contact"
                  desc="Post your 1st Check-in"
                  completed={checkInCount >= 1}
                />
                <MissionRow
                  icon={Zap}
                  title="Signal Booster"
                  desc="Post 3 Check-ins"
                  completed={checkInCount >= 3}
                />
                <MissionRow
                  icon={Shield}
                  title="Trust Anchor"
                  desc="Post 10 Check-ins"
                  completed={checkInCount >= 10}
                />
              </div>
            </div>
            {/* Add this button below the Missions List */}
            <button
              onClick={handleShare}
              className="w-full mt-6 py-4 border border-bitcoin/30 bg-bitcoin/5 text-bitcoin rounded-xl flex items-center justify-center gap-2 hover:bg-bitcoin/10 transition-all group"
            >
              <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-widest">
                Share Protocol Status
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function MissionRow({ icon: Icon, title, desc, completed }: any) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 p-3 rounded-lg border transition-all duration-300",
        completed
          ? "bg-bitcoin/10 border-bitcoin/30"
          : "bg-white/5 border-white/5 opacity-60 hover:opacity-100"
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center border",
          completed
            ? "bg-bitcoin text-black border-bitcoin shadow-[0_0_10px_#F7931A]"
            : "bg-white/5 text-gray-500 border-white/10"
        )}
      >
        <Icon className="w-5 h-5" />
      </div>

      <div className="flex-1">
        <div className="flex justify-between items-center">
          <p
            className={cn(
              "text-xs font-bold uppercase tracking-wide",
              completed ? "text-bitcoin" : "text-gray-300"
            )}
          >
            {title}
          </p>
          {completed && (
            <span className="text-[8px] bg-bitcoin/20 text-bitcoin px-1.5 py-0.5 rounded border border-bitcoin/30">
              DONE
            </span>
          )}
        </div>
        <p className="text-[10px] text-gray-500 mt-0.5 font-sans">{desc}</p>
      </div>
    </div>
  );
}

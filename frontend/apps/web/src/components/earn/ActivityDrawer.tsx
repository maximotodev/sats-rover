import React, { useEffect, useState } from "react";
import { Activity, Radio, X, Loader2, Zap, MapPin } from "lucide-react";
import { useSession } from "@/contexts/NostrSessionContext";
import { NDKUserProfile } from "@nostr-dev-kit/ndk";

interface ActivityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SignalEvent {
  id: string;
  pubkey: string;
  content: string;
  created_at: number;
  profile?: NDKUserProfile;
  location?: string;
}

// Helper for dynamic date
function getNextFriday() {
  const d = new Date();
  const day = d.getDay();
  const diff = 5 - day;
  const daysToAdd = diff >= 0 ? diff : 6 + diff;
  d.setDate(d.getDate() + daysToAdd);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ActivityDrawer({
  isOpen,
  onClose,
}: ActivityDrawerProps) {
  const { ndk } = useSession();
  const [signals, setSignals] = useState<SignalEvent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && ndk) {
      setLoading(true);
      ndk
        .fetchEvents({
          kinds: [1],
          "#t": ["satsrover"],
          limit: 50,
        })
        .then(async (events) => {
          const sorted = Array.from(events).sort(
            (a, b) => b.created_at! - a.created_at!
          );

          const enriched = await Promise.all(
            sorted.slice(0, 20).map(async (e) => {
              const user = ndk.getUser({ pubkey: e.pubkey });
              // Safe profile fetch
              const profileData = await user.fetchProfile();
              const profile = profileData || undefined;

              // ✅ ROBUST PARSING
              let location = "Unknown Location";
              const cityTag = e.tags.find((t) => t[0] === "city")?.[1];
              const countryTag = e.tags.find((t) => t[0] === "country")?.[1];

              if (cityTag) {
                location = countryTag ? `${cityTag}, ${countryTag}` : cityTag;
              } else {
                const match = e.content.match(/Checking in at (.*?) ⚡/);
                if (match) location = match[1];
              }

              return {
                id: e.id,
                pubkey: e.pubkey,
                content: e.content,
                created_at: e.created_at!,
                profile,
                location,
              };
            })
          );

          setSignals(enriched);
          setLoading(false);
        });
    }
  }, [isOpen, ndk]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md pointer-events-auto"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-[#121212] border border-white/10 rounded-t-2xl sm:rounded-2xl p-6 pointer-events-auto shadow-2xl animate-in slide-in-from-bottom text-white font-mono h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4 shrink-0">
          <h2 className="text-lg font-bold flex items-center gap-2 text-bitcoin">
            <Radio className="w-5 h-5 text-[#00FF41] animate-pulse" />
            GLOBAL_FEED
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Banner */}
        <div className="mb-6 bg-linear-to-r from-bitcoin/20 to-transparent p-4 rounded-xl border border-bitcoin/30 shrink-0 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-bitcoin/20 rounded-full blur-xl group-hover:bg-bitcoin/40 transition-all" />
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-[10px] font-bold text-bitcoin uppercase tracking-widest mb-1">
                Weekly Reward Pool
              </p>
              <p className="text-3xl font-bold text-white">
                2,100{" "}
                <span className="text-sm font-normal text-gray-400">sats</span>
              </p>
            </div>
            <Zap className="w-8 h-8 text-bitcoin fill-bitcoin" />
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="px-2 py-0.5 rounded bg-bitcoin/20 border border-bitcoin/30 text-[9px] font-bold text-bitcoin uppercase">
              Next Draw: {getNextFriday()}
            </div>
            <p className="text-[10px] text-gray-400">Draws every Friday</p>
          </div>
        </div>

        {/* Feed List */}
        <div className="flex-1 overflow-y-auto min-h-0 space-y-4 pr-1 scrollbar-hide">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3 text-bitcoin">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-xs uppercase tracking-widest">
                Scanning Frequencies...
              </span>
            </div>
          ) : (
            signals.map((signal) => (
              <div
                key={signal.id}
                className="relative pl-4 border-l border-white/10 pb-4 last:border-0 last:pb-0"
              >
                <div className="absolute -left-1.25 top-0 w-2.5 h-2.5 rounded-full bg-[#121212] border border-white/30" />
                <div className="flex items-start gap-3">
                  {signal.profile?.image ? (
                    <img
                      src={signal.profile.image}
                      className="w-8 h-8 rounded bg-gray-800 object-cover border border-white/10"
                      alt=""
                    />
                  ) : (
                    <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-[10px] font-bold border border-white/10">
                      {signal.pubkey.slice(0, 2)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <p className="text-xs font-bold text-gray-300 truncate">
                        {signal.profile?.name || "Anon Scout"}
                      </p>
                      <span className="text-[9px] text-gray-600">
                        {timeAgo(signal.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-bitcoin text-[10px] mt-0.5 mb-1 truncate">
                      <MapPin className="w-3 h-3" />
                      <span className="uppercase tracking-wide">
                        {signal.location}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {signal.content
                        .replace(/Checking in at .* ⚡ #SatsRover/, "")
                        .replace(/✅|❌|👀/, "")
                        .trim()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function timeAgo(timestamp: number) {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

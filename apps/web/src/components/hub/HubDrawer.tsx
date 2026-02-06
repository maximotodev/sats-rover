import React, { useState, useEffect } from "react";
import { BITCOIN_HUBS } from "@/lib/constants";
import { Plane, Search, X, Signal, Loader2, MapPin } from "lucide-react";
import { useSession } from "@/contexts/NostrSessionContext";
import { calculateCityPulse } from "@/lib/scoring";
import { generateCityId } from "@/lib/geoutils";

interface HubDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (lat: number, lon: number, name: string) => void;
}

export default function HubDrawer({
  isOpen,
  onClose,
  onSelect,
}: HubDrawerProps) {
  const { ndk } = useSession();
  const [query, setQuery] = useState("");
  const [hubStats, setHubStats] = useState<Record<string, number>>({});
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    if (isOpen && ndk) {
      setLoadingStats(true);

      Promise.all(
        BITCOIN_HUBS.map(async (hub) => {
          // 1. Generate Canonical ID for the Hub coordinates
          // This ensures we are querying the exact ID the app produces
          const { cityId } = generateCityId(hub.lat, hub.lon);

          try {
            // 2. Query via NIP-12 Generic Tag Search
            const events = await ndk.fetchEvents({
              kinds: [1],
              "#t": ["satsrover"],
              // We filter by city_id tag.
              // Note: Not all relays support generic tag queries, so we rely on #t satsrover first
              // and filter client-side if needed, but optimally the relay handles this.
              "#city_id": [cityId],
              limit: 50,
            });

            const stats = calculateCityPulse(Array.from(events));
            return { name: hub.name, score: stats.totalScore };
          } catch (e) {
            return { name: hub.name, score: 0 };
          }
        })
      ).then((results) => {
        const statsMap: Record<string, number> = {};
        results.forEach((r) => (statsMap[r.name] = r.score));
        setHubStats(statsMap);
        setLoadingStats(false);
      });
    }
  }, [isOpen, ndk]);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`,
        { headers: { "User-Agent": "SatsRover" } }
      );
      const data = await res.json();
      if (data && data.length > 0) {
        onSelect(parseFloat(data[0].lat), parseFloat(data[0].lon), query);
        onClose();
      }
    } catch (e) {
      alert("Search failed");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md pointer-events-auto"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-[#121212] border border-white/10 rounded-t-2xl sm:rounded-2xl p-6 pointer-events-auto shadow-2xl animate-in slide-in-from-bottom text-white font-mono h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4 shrink-0">
          <h2 className="text-lg font-bold flex items-center gap-2 text-bitcoin">
            <Plane className="w-5 h-5" />
            TELEPORT_UPLINK
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSearch} className="mb-6 relative shrink-0">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
          <input
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 text-sm text-white focus:border-bitcoin outline-none transition-colors"
            placeholder="Search global coordinates..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>

        <div className="flex justify-between items-end mb-3 shrink-0">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Active Sectors
          </h3>
          {loadingStats && (
            <Loader2 className="w-3 h-3 animate-spin text-bitcoin" />
          )}
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 space-y-2 pr-1 scrollbar-hide">
          {BITCOIN_HUBS.map((hub) => {
            const signalScore = hubStats[hub.name] || 0;
            const isHot = signalScore > 10;

            return (
              <button
                key={hub.name}
                onClick={() => {
                  onSelect(hub.lat, hub.lon, hub.name);
                  onClose();
                }}
                className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 border border-transparent hover:border-bitcoin/30 transition-all group"
              >
                <div className="flex flex-col items-start">
                  <span className="text-sm font-bold text-white group-hover:text-bitcoin transition-colors flex items-center gap-2">
                    {hub.name}{" "}
                    <span className="opacity-50 text-xs font-normal">
                      {hub.country}
                    </span>
                  </span>
                  <span className="text-[10px] text-gray-500 mt-0.5">
                    {hub.desc}
                  </span>
                </div>

                <div
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border ${isHot ? "bg-bitcoin/10 border-bitcoin/30 text-bitcoin" : "bg-white/5 border-white/5 text-gray-600"}`}
                >
                  <Signal
                    className={`w-3 h-3 ${isHot ? "animate-pulse" : ""}`}
                  />
                  <span className="text-xs font-bold font-mono">
                    {signalScore.toFixed(1)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-white/10 text-center shrink-0">
          <p className="text-[9px] text-gray-600 uppercase tracking-widest">
            City Pulse v1.0 // Deterministic Signal Aggregation
          </p>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { BITCOIN_HUBS } from "@/lib/constants";
import { Plane, Search, X } from "lucide-react";

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
  const [query, setQuery] = useState("");

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
        className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-surface border border-dim rounded-t-2xl sm:rounded-2xl p-6 pointer-events-auto shadow-2xl animate-in slide-in-from-bottom text-white font-mono">
        <div className="flex justify-between items-center mb-6 border-b border-dim pb-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-bitcoin">
            <Plane className="w-5 h-5" />
            TELEPORT_UPLINK
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dim rounded-full text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSearch} className="mb-6 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
          <input
            className="w-full bg-dim/30 border border-dim rounded-xl py-3 pl-10 text-sm text-white focus:border-bitcoin outline-none"
            placeholder="Search coordinates or city..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>

        <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">
          Known Citadels
        </h3>
        <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
          {BITCOIN_HUBS.map((hub) => (
            <button
              key={hub.name}
              onClick={() => {
                onSelect(hub.lat, hub.lon, hub.name);
                onClose();
              }}
              className="flex flex-col items-start p-3 bg-dim/20 rounded-lg hover:bg-dim/50 border border-transparent hover:border-dim transition-all text-left"
            >
              <span className="text-xs font-bold text-white">
                {hub.name} {hub.country}
              </span>
              <span className="text-[10px] text-gray-500">{hub.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

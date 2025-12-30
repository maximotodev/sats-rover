// src/components/map/HubSelector.tsx
import React, { useState } from "react";
import { BITCOIN_HUBS } from "@/lib/constants";
import { Plane, Search } from "lucide-react";

interface HubSelectorProps {
  onSelect: (lat: number, lon: number) => void;
}

export default function HubSelector({ onSelect }: HubSelectorProps) {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      // SENIOR FIX: Add User-Agent header to identify our app
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`,
        {
          headers: {
            "User-Agent": "SatsRover/1.0 (Education Project)",
          },
        }
      );

      const data = await res.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        onSelect(parseFloat(lat), parseFloat(lon));
        setQuery("");
      } else {
        alert("City not found. Try a major city name.");
      }
    } catch (err) {
      console.error("Geocoding failed", err);
      alert("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="absolute top-16 left-0 right-0 z-10 flex flex-col gap-2 px-4 pointer-events-none">
      {/* 1. SEARCH BAR */}
      <form
        onSubmit={handleSearch}
        className="pointer-events-auto w-full max-w-sm mx-auto shadow-lg"
      >
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {isSearching ? (
              <div className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full" />
            ) : (
              <Search className="h-4 w-4 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
            )}
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border-none rounded-xl bg-white/95 backdrop-blur-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 sm:text-sm transition-shadow"
            placeholder="Search city (e.g. Kyoto, London)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </form>

      {/* 2. HUBS LIST */}
      <div className="pointer-events-auto flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x">
        <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-white/90 backdrop-blur rounded-full shadow-sm border border-gray-100">
          <Plane className="w-5 h-5 text-purple-600" />
        </div>

        {BITCOIN_HUBS.map((hub) => (
          <button
            key={hub.name}
            onClick={() => onSelect(hub.lat, hub.lon)}
            className="flex-shrink-0 snap-center flex flex-col items-start bg-white/90 backdrop-blur-md border border-gray-200 shadow-sm rounded-xl px-4 py-2 hover:bg-white active:scale-95 transition-all"
          >
            <span className="text-xs font-bold text-gray-800 flex items-center gap-1">
              {hub.name}{" "}
              <span className="text-[10px] opacity-70">{hub.country}</span>
            </span>
            <span className="text-[10px] text-purple-600 font-medium">
              {hub.desc}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

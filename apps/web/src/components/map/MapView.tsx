"use client";
import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { Merchant } from "@/lib/types";
import MerchantDrawer from "./MerchantDrawer";

const MAP_STYLE_DARK =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

interface MapViewProps {
  flyToCoords: { lat: number; lon: number } | null;
  onInteract: () => void;
}

// ✅ Visual Signal State Definition
interface VisualSignalState {
  intensity: number; // 0.0 to 1.0
  glow: boolean;
  opacity: number;
}

export default function MapView({ flyToCoords, onInteract }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(
    null
  );

  // FlyTo Logic
  useEffect(() => {
    if (map.current && flyToCoords) {
      map.current.flyTo({
        center: [flyToCoords.lon, flyToCoords.lat],
        zoom: 14,
        speed: 1.5,
      });
    }
  }, [flyToCoords]);

  // Init Map
  useEffect(() => {
    if (map.current || !mapContainer.current) return;
    const container = mapContainer.current;
    container.style.width = "100%";
    container.style.height = "100%";

    map.current = new maplibregl.Map({
      container,
      style: MAP_STYLE_DARK,
      center: [-89.42, 13.49], // El Zonte
      zoom: 15,
      attributionControl: false,
    });

    map.current.on("load", () => {
      setTimeout(() => map.current?.resize(), 0);
      fetchMerchants();
    });
    map.current.on("moveend", () => fetchMerchants());
    map.current.on("click", () => {
      setSelectedMerchant(null);
      onInteract();
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  const fetchMerchants = async () => {
    if (!map.current || map.current.getZoom() < 12) {
      setMerchants([]);
      return;
    }
    const bounds = map.current.getBounds();
    const bbox = [
      bounds.getSouth(),
      bounds.getWest(),
      bounds.getNorth(),
      bounds.getEast(),
    ]
      .map((c) => c.toFixed(4))
      .join(",");

    try {
      const res = await fetch(`/api/merchants?bbox=${bbox}`);
      const json = await res.json();
      if (json.data) setMerchants(json.data);
    } catch (e) {
      console.error(e);
    }
  };

  // ✅ DERIVE VISUAL STATE (The "Signal" Logic)
  const deriveVisualState = (merchant: Merchant): VisualSignalState => {
    // 1. Bootstrap (Source)
    const isVerified = merchant.source === "btcmap";

    // 2. Visual Logic
    // Verified = 100% Opacity, Strong Glow
    // Unverified = 40% Opacity, No Glow
    return {
      intensity: isVerified ? 1.0 : 0.2,
      glow: isVerified,
      opacity: isVerified ? 1.0 : 0.4,
    };
  };

  // ✅ RENDER MARKERS (All Orange)
  useEffect(() => {
    if (!map.current) return;
    markers.current.forEach((m) => m.remove());
    markers.current = [];

    merchants.forEach((merchant) => {
      const container = document.createElement("div");
      container.className = "cursor-pointer p-3";

      const dot = document.createElement("div");
      const state = deriveVisualState(merchant);

      // ✅ UNIFIED ORANGE LOGIC
      const baseStyle =
        "rounded-full bg-[#F7931A] transition-all duration-300 hover:scale-150 hover:opacity-100 hover:shadow-[0_0_10px_#F7931A]";
      const glowStyle = state.glow
        ? "shadow-[0_0_15px_#F7931A] border-2 border-white z-30"
        : "border border-white/10 z-10";
      const sizeStyle = state.glow ? "w-4 h-4" : "w-2 h-2";

      dot.className = `${baseStyle} ${glowStyle} ${sizeStyle}`;
      dot.style.opacity = state.opacity.toString();

      container.appendChild(dot);

      container.addEventListener("click", (e) => {
        e.stopPropagation();
        setSelectedMerchant(merchant);
        onInteract();
        map.current?.flyTo({ center: [merchant.lon, merchant.lat], zoom: 16 });
      });

      markers.current.push(
        new maplibregl.Marker({ element: container })
          .setLngLat([merchant.lon, merchant.lat])
          .addTo(map.current!)
      );
    });
  }, [merchants]);

  return (
    <div className="relative w-full h-full bg-[#050505]">
      <div ref={mapContainer} className="absolute inset-0" />
      <MerchantDrawer
        merchant={selectedMerchant}
        onClose={() => setSelectedMerchant(null)}
      />
    </div>
  );
}

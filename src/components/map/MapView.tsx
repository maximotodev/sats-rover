"use client";

import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { Merchant } from "@/lib/types";
import MerchantDrawer from "./MerchantDrawer";

export default function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]);

  // STATE
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(
    null
  );
  const [loading, setLoading] = useState(false); // ✅ Implemented

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    // Fix B: Explicitly size container
    const container = mapContainer.current;
    container.style.width = "100%";
    container.style.height = "100%";

    // Carto Style (Reliable)
    const MAP_STYLE =
      "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

    map.current = new maplibregl.Map({
      container: container,
      style: MAP_STYLE,
      center: [-89.42, 13.49], // El Zonte
      zoom: 15,
      attributionControl: false,
    });

    map.current.on("load", () => {
      // Fix C: Force resize
      setTimeout(() => {
        map.current?.resize();
      }, 0);

      fetchMerchants();
    });

    // We use 'moveend' to avoid spamming the API while dragging
    map.current.on("moveend", () => fetchMerchants());
    map.current.on("click", () => setSelectedMerchant(null));

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  const fetchMerchants = async () => {
    if (!map.current) return;

    // OPTIMIZATION 1: Zoom Gate
    // Don't fetch if user is zoomed out too far (country level)
    const zoom = map.current.getZoom();
    if (zoom < 13) {
      setMerchants([]); // Optional: Clear markers to reduce clutter
      return;
    }

    // OPTIMIZATION 2: BBox Rounding
    // Round to 4 decimals to help client-side consistency
    const bounds = map.current.getBounds();
    const bbox = [
      bounds.getSouth().toFixed(4),
      bounds.getWest().toFixed(4),
      bounds.getNorth().toFixed(4),
      bounds.getEast().toFixed(4),
    ].join(",");

    setLoading(true); // ✅ Start loading

    try {
      const res = await fetch(`/api/merchants?bbox=${bbox}`);
      const json = await res.json();
      if (json.data) setMerchants(json.data);
    } catch (err) {
      console.error("Failed to load merchants", err);
    } finally {
      setLoading(false); // ✅ Stop loading (always runs)
    }
  };

  // Marker Synchronization
  useEffect(() => {
    if (!map.current) return;

    // Clear old markers
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];

    merchants.forEach((merchant) => {
      // 1. Create a container for MapLibre to position
      // This element gets the 'transform: translate(x,y)' from the map
      const container = document.createElement("div");
      container.className = "cursor-pointer p-1"; // Add padding to increase click area slightly

      // 2. Create the visual dot that scales on hover
      // This element handles the color and animation
      const dot = document.createElement("div");
      dot.className =
        "w-6 h-6 bg-blue-600 rounded-full border-2 border-white shadow-lg transform transition-transform duration-200 hover:scale-125";

      container.appendChild(dot);

      // 3. Attach click listener to the CONTAINER
      container.addEventListener("click", (e) => {
        e.stopPropagation();
        setSelectedMerchant(merchant);
        map.current?.flyTo({ center: [merchant.lon, merchant.lat], zoom: 16 });
      });

      // 4. Add to map
      const marker = new maplibregl.Marker({ element: container })
        .setLngLat([merchant.lon, merchant.lat])
        .addTo(map.current!);

      markers.current.push(marker);
    });
  }, [merchants]);

  return (
    <div className="relative w-full h-full bg-gray-200">
      <div ref={mapContainer} className="absolute inset-0" />

      {/* ✅ LOADING INDICATOR */}
      {loading && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md z-10 flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-gray-700">
            Scanning for Sats...
          </span>
        </div>
      )}

      <MerchantDrawer
        merchant={selectedMerchant}
        onClose={() => setSelectedMerchant(null)}
      />
    </div>
  );
}

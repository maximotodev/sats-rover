"use client";

import React, { useEffect, useRef, useCallback, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import MerchantDrawer from "./MerchantDrawer";
import type { Merchant } from "@/lib/types";

const MAP_STYLE_DARK =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

const SOURCE_ID = "merchants";
const LAYER_CLUSTERS = "clusters";
const LAYER_CLUSTER_COUNT = "cluster-count";
const LAYER_POINTS = "unclustered-point";

// UI constants
const ORANGE = "#F7931A";
const EMPTY_FC: GeoJSON.FeatureCollection<GeoJSON.Point> = {
  type: "FeatureCollection",
  features: [],
};

type FlyToCoords = { lat: number; lon: number } | null;

export default function MapView({
  flyToCoords,
  onInteract,
}: {
  flyToCoords: FlyToCoords;
  onInteract: () => void;
}) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(
    null,
  );

  const merchantsToFC = (
    merchants: Merchant[],
  ): GeoJSON.FeatureCollection<GeoJSON.Point, any> => ({
    type: "FeatureCollection",
    features: merchants.map((m) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [m.lon, m.lat] },
      properties: {
        id: m.id,
        name: m.name,
        category: m.category ?? "merchant",
        source: m.source ?? "btcmap",
        signalStrength: m.signalStrength ?? 0.5,
        // Store tags as object in-memory, but MapLibre feature properties must be JSON-serializable.
        tags: JSON.stringify(m.tags ?? {}),
      },
    })),
  });

  const fetchMerchants = useCallback(async () => {
    const map = mapRef.current;
    if (!map) return;

    // Avoid calling getSource() before style/source exist
    if (!map.isStyleLoaded()) return;

    const src = map.getSource(SOURCE_ID) as
      | maplibregl.GeoJSONSource
      | undefined;
    if (!src) return;

    // Optional: zoom gate (prevents huge bbox queries)
    // If you want to still show "something", the source already exists and clusters work,
    // but no data means no clusters. So only gate if you’re okay with that UX.
    // if (map.getZoom() < 9) return;

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    const b = map.getBounds();
    const bbox = `${b.getWest().toFixed(4)},${b
      .getSouth()
      .toFixed(4)},${b.getEast().toFixed(4)},${b.getNorth().toFixed(4)}`;

    try {
      const res = await fetch(`/api/merchants?bbox=${bbox}`, {
        signal: abortRef.current.signal,
        cache: "no-store",
        headers: { accept: "application/json" },
      });

      if (!res.ok) return;

      const json = await res.json();
      const merchants: Merchant[] = json?.data ?? [];

      src.setData(merchantsToFC(merchants));
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        console.error("fetchMerchants error:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: MAP_STYLE_DARK,
      center: [-89.42, 13.49],
      zoom: 14,
      attributionControl: false,
    });

    mapRef.current = map;

    const onLoad = () => {
      // Source
      if (!map.getSource(SOURCE_ID)) {
        map.addSource(SOURCE_ID, {
          type: "geojson",
          data: EMPTY_FC,
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50,
        });
      }

      // CLUSTERS (explicit orange styling)
      if (!map.getLayer(LAYER_CLUSTERS)) {
        map.addLayer({
          id: LAYER_CLUSTERS,
          type: "circle",
          source: SOURCE_ID,
          filter: ["has", "point_count"],
          paint: {
            "circle-color": ORANGE,
            "circle-opacity": 0.9,
            "circle-stroke-color": "#FFFFFF",
            "circle-stroke-width": 2,
            "circle-stroke-opacity": 0.7,
            "circle-radius": [
              "step",
              ["get", "point_count"],
              14,
              20,
              18,
              50,
              22,
              100,
              28,
            ],
            "circle-blur": 0.2,
          },
        });
      }

      // CLUSTER COUNT (black text so it’s readable on orange)
      if (!map.getLayer(LAYER_CLUSTER_COUNT)) {
        map.addLayer({
          id: LAYER_CLUSTER_COUNT,
          type: "symbol",
          source: SOURCE_ID,
          filter: ["has", "point_count"],
          layout: {
            "text-field": ["to-string", ["get", "point_count_abbreviated"]],
            "text-size": 12,
            "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
          },
          paint: {
            "text-color": "#000000",
          },
        });
      }

      // UNCLUSTERED POINTS (orange dots)
      if (!map.getLayer(LAYER_POINTS)) {
        map.addLayer({
          id: LAYER_POINTS,
          type: "circle",
          source: SOURCE_ID,
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-color": ORANGE,
            "circle-opacity": 0.95,
            "circle-radius": 6,
            "circle-stroke-color": "#FFFFFF",
            "circle-stroke-width": 2,
            "circle-stroke-opacity": 0.85,
          },
        });
      }

      // Click cluster -> zoom in
      map.on("click", LAYER_CLUSTERS, async (e) => {
        const f = e.features?.[0];
        if (!f) return;

        const clusterId = f.properties?.cluster_id;
        if (clusterId == null) return;

        const source = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource;
        try {
          const zoom = await source.getClusterExpansionZoom(clusterId);
          const [lng, lat] = (f.geometry as any).coordinates as [
            number,
            number,
          ];
          map.easeTo({ center: [lng, lat], zoom });
        } catch (err) {
          console.error("getClusterExpansionZoom error:", err);
        }
      });

      // Click point -> open drawer
      map.on("click", LAYER_POINTS, (e) => {
        const f = e.features?.[0];
        if (!f) return;

        const [lon, lat] = (f.geometry as any).coordinates as [number, number];

        const tags = (() => {
          try {
            return JSON.parse(f.properties?.tags ?? "{}");
          } catch {
            return {};
          }
        })();

        const m: Merchant = {
          id: String(f.properties?.id ?? ""),
          name: String(f.properties?.name ?? "Bitcoin Merchant"),
          lat,
          lon,
          category: String(f.properties?.category ?? "merchant"),
          source: (f.properties?.source ?? "btcmap") as any,
          signalStrength: Number(f.properties?.signalStrength ?? 0.5),
          tags,
        };

        setSelectedMerchant(m);
        onInteract();
      });

      // Cursor affordance
      const setPointer = () => (map.getCanvas().style.cursor = "pointer");
      const clearPointer = () => (map.getCanvas().style.cursor = "");

      map.on("mouseenter", LAYER_CLUSTERS, setPointer);
      map.on("mouseleave", LAYER_CLUSTERS, clearPointer);
      map.on("mouseenter", LAYER_POINTS, setPointer);
      map.on("mouseleave", LAYER_POINTS, clearPointer);

      // Important: only attach moveend AFTER load & after the source exists
      map.on("moveend", fetchMerchants);

      // Initial load
      fetchMerchants();
    };

    map.on("load", onLoad);

    return () => {
      // abort any in-flight fetch
      abortRef.current?.abort();

      if (mapRef.current) {
        // Remove handlers safely
        map.off("load", onLoad);
        map.off("moveend", fetchMerchants);
        map.remove();
        mapRef.current = null;
      }
    };
  }, [fetchMerchants, onInteract]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !flyToCoords) return;

    map.flyTo({
      center: [flyToCoords.lon, flyToCoords.lat],
      zoom: 15,
      essential: true,
    });
  }, [flyToCoords]);

  return (
    <div className="w-full h-full relative bg-[#050505]">
      <div
        ref={mapContainer}
        className="absolute inset-0"
        style={{ width: "100vw", height: "100vh" }}
      />
      <MerchantDrawer
        merchant={selectedMerchant}
        onClose={() => setSelectedMerchant(null)}
      />
    </div>
  );
}

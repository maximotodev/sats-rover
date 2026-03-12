//  apps/web/src/components/map/MapView.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import MerchantDrawer from "./MerchantDrawer";
import type { Merchant } from "@/lib/types";

const MAP_STYLE_DARK =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

const SOURCE_ID = "merchants";
const SOURCE_USER_ID = "user-location";
const LAYER_CLUSTERS = "clusters";
const LAYER_CLUSTER_COUNT = "cluster-count";
const LAYER_POINTS = "unclustered-point";
const LAYER_SELECTED = "selected-point";
const LAYER_USER_DOT = "user-location-dot";
const LAYER_USER_RING = "user-location-ring";

const ORANGE = "#F7931A";
const MERCHANT_LIMIT = 600;
const FETCH_TIMEOUT_MS = 5000;
const BBOX_DEBOUNCE_MS = 250;
const MICRO_CACHE_TTL_MS = 5000;

const EMPTY_POINT_FC: GeoJSON.FeatureCollection<GeoJSON.Point> = {
  type: "FeatureCollection",
  features: [],
};

type FlyToCoords = { lat: number; lon: number } | null;
type MerchantSource = "sr" | "btcmap" | "osm";

type MerchantFeatureProps = {
  id: string;
  name: string;
  category: string;
  source: MerchantSource;
  signalStrength: number;
};

type HoverTooltip = {
  x: number;
  y: number;
  merchant: Merchant;
};

type CacheEntry = {
  expiresAt: number;
  merchants: Merchant[];
  dataSig: string;
};

type LocationPermission = "idle" | "granted" | "denied" | "dismissed";

function normalizeSource(source: unknown): MerchantSource {
  return source === "sr" || source === "osm" || source === "btcmap"
    ? source
    : "btcmap";
}

function normalizeBbox(bounds: maplibregl.LngLatBounds): string {
  return `${bounds.getWest().toFixed(3)},${bounds
    .getSouth()
    .toFixed(
      3,
    )},${bounds.getEast().toFixed(3)},${bounds.getNorth().toFixed(3)}`;
}

function zoomBucket(zoom: number): string {
  return (Math.round(zoom * 2) / 2).toFixed(1);
}

function makeDataSig(merchants: Merchant[]): string {
  let hash = merchants.length * 31;
  for (let i = 0; i < merchants.length; i += 1) {
    const m = merchants[i];
    hash =
      (hash * 33 + m.id.length + Math.floor((m.signalStrength ?? 0) * 100)) %
      2147483647;
  }
  return `${merchants.length}:${hash}`;
}

function merchantsToFC(
  merchants: Merchant[],
): GeoJSON.FeatureCollection<GeoJSON.Point, MerchantFeatureProps> {
  return {
    type: "FeatureCollection",
    features: merchants.map((m) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [m.lon, m.lat] },
      properties: {
        id: m.id,
        name: m.name,
        category: m.category ?? "merchant",
        source: m.source ?? "btcmap",
        signalStrength: m.signalStrength ?? 0,
      },
    })),
  };
}

function userLocationFC(
  location: { lat: number; lon: number } | null,
): GeoJSON.FeatureCollection<GeoJSON.Point> {
  if (!location) return EMPTY_POINT_FC;
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [location.lon, location.lat],
        },
        properties: {},
      },
    ],
  };
}

function distanceKm(
  aLat: number,
  aLon: number,
  bLat: number,
  bLon: number,
): number {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLon = toRad(bLon - aLon);
  const rLat1 = toRad(aLat);
  const rLat2 = toRad(bLat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rLat1) * Math.cos(rLat2) * Math.sin(dLon / 2) ** 2;
  return 6371 * (2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)));
}

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit,
  timeoutMs: number,
  externalSignal?: AbortSignal,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const onAbort = () => controller.abort();
  if (externalSignal) {
    if (externalSignal.aborted) controller.abort();
    else externalSignal.addEventListener("abort", onAbort, { once: true });
  }
  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
    if (externalSignal) externalSignal.removeEventListener("abort", onAbort);
  }
}

function ensureMapSourcesAndLayers(map: maplibregl.Map): void {
  if (!map.getSource(SOURCE_ID)) {
    map.addSource(SOURCE_ID, {
      type: "geojson",
      data: EMPTY_POINT_FC,
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 48,
    });
  }

  if (!map.getSource(SOURCE_USER_ID)) {
    map.addSource(SOURCE_USER_ID, {
      type: "geojson",
      data: EMPTY_POINT_FC,
    });
  }

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

  if (!map.getLayer(LAYER_SELECTED)) {
    map.addLayer({
      id: LAYER_SELECTED,
      type: "circle",
      source: SOURCE_ID,
      filter: ["all", ["!", ["has", "point_count"]], ["==", ["get", "id"], ""]],
      paint: {
        "circle-color": "#00FF41",
        "circle-opacity": 0.35,
        "circle-radius": 14,
        "circle-blur": 0.8,
      },
    });
  }

  if (!map.getLayer(LAYER_USER_RING)) {
    map.addLayer({
      id: LAYER_USER_RING,
      type: "circle",
      source: SOURCE_USER_ID,
      paint: {
        "circle-color": "#3B82F6",
        "circle-opacity": 0.2,
        "circle-radius": 14,
      },
    });
  }

  if (!map.getLayer(LAYER_USER_DOT)) {
    map.addLayer({
      id: LAYER_USER_DOT,
      type: "circle",
      source: SOURCE_USER_ID,
      paint: {
        "circle-color": "#60A5FA",
        "circle-stroke-color": "#FFFFFF",
        "circle-stroke-width": 2,
        "circle-radius": 6,
      },
    });
  }
}

export default function MapView({
  flyToCoords,
  onInteract,
  onBboxChange,
}: {
  flyToCoords: FlyToCoords;
  onInteract: () => void;
  onBboxChange?: (bbox: string) => void;
}) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const onInteractRef = useRef(onInteract);
  const onBboxChangeRef = useRef(onBboxChange);
  const abortRef = useRef<AbortController | null>(null);
  const bboxTimerRef = useRef<number | null>(null);
  const lastBboxRef = useRef<string>("");
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());
  const latestRequestIdRef = useRef(0);
  const lastDataSigRef = useRef<string>("");
  const merchantsByIdRef = useRef<Map<string, Merchant>>(new Map());
  const mapMerchantsRef = useRef<Merchant[]>([]);
  const userLocationRef = useRef<{ lat: number; lon: number } | null>(null);
  const selectedMerchantRef = useRef<Merchant | null>(null);
  const geolocWatchIdRef = useRef<number | null>(null);
  const lastFlyKeyRef = useRef<string>("");

  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(
    null,
  );
  const [hoverTooltip, setHoverTooltip] = useState<HoverTooltip | null>(null);
  const [isSearchingArea, setIsSearchingArea] = useState(false);
  const [mapMerchants, setMapMerchants] = useState<Merchant[]>([]);

  const [locationPermission, setLocationPermission] =
    useState<LocationPermission>("idle");
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [followMe, setFollowMe] = useState(false);

  useEffect(() => {
    onInteractRef.current = onInteract;
  }, [onInteract]);

  useEffect(() => {
    onBboxChangeRef.current = onBboxChange;
  }, [onBboxChange]);

  const applyMerchantDataToMap = (
    map: maplibregl.Map,
    merchants: Merchant[],
  ): void => {
    merchantsByIdRef.current = new Map(merchants.map((m) => [m.id, m]));
    mapMerchantsRef.current = merchants;
    setMapMerchants(merchants);

    const dataSig = makeDataSig(merchants);
    if (lastDataSigRef.current === dataSig) return;

    const src = map.getSource(SOURCE_ID) as
      | maplibregl.GeoJSONSource
      | undefined;
    if (!src) return;

    src.setData(merchantsToFC(merchants));
    lastDataSigRef.current = dataSig;
  };

  const emitBboxIfChanged = (bbox: string): void => {
    if (bbox === lastBboxRef.current) return;
    lastBboxRef.current = bbox;
    onBboxChangeRef.current?.(bbox);
  };

  const fetchMerchantsForCurrentView = async (reason: "move" | "init") => {
    const map = mapRef.current;
    if (!map) return;
    if (map.isStyleLoaded()) {
      ensureMapSourcesAndLayers(map);
    }

    const bounds = map.getBounds();
    const bbox = normalizeBbox(bounds);
    const zoomKey = zoomBucket(map.getZoom());
    const cacheKey = `${bbox}|z${zoomKey}|l${MERCHANT_LIMIT}`;
    emitBboxIfChanged(bbox);

    const now = Date.now();
    const cached = cacheRef.current.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      applyMerchantDataToMap(map, cached.merchants);
      setIsSearchingArea(false);
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const requestId = ++latestRequestIdRef.current;
    setIsSearchingArea(true);

    try {
      const response = await fetchWithTimeout(
        `/api/merchants?bbox=${bbox}`,
        {
          method: "GET",
          cache: "no-store",
          headers: { accept: "application/json" },
        },
        FETCH_TIMEOUT_MS,
        controller.signal,
      );

      if (!response.ok) {
        console.warn("fetchMerchantsForCurrentView non-ok response", {
          requestId,
          bbox,
          status: response.status,
        });
        return;
      }
      const raw = await response.json().catch(() => ({}));
      const merchantsRaw =
        typeof raw === "object" &&
        raw !== null &&
        Array.isArray((raw as { data?: unknown }).data)
          ? ((raw as { data: Merchant[] }).data ?? [])
          : [];

      if (requestId !== latestRequestIdRef.current) return;

      cacheRef.current.set(cacheKey, {
        expiresAt: now + MICRO_CACHE_TTL_MS,
        merchants: merchantsRaw,
        dataSig: makeDataSig(merchantsRaw),
      });

      if (map.isStyleLoaded()) {
        ensureMapSourcesAndLayers(map);
      }
      applyMerchantDataToMap(map, merchantsRaw);
    } catch (error) {
      if (!(error instanceof Error) || error.name !== "AbortError") {
        console.error("fetchMerchantsForCurrentView failed", { reason, error });
      }
    } finally {
      if (requestId === latestRequestIdRef.current) {
        setIsSearchingArea(false);
      }
    }
  };

  const scheduleFetch = (reason: "move" | "init"): void => {
    if (bboxTimerRef.current) {
      window.clearTimeout(bboxTimerRef.current);
    }

    const delay = reason === "init" ? 0 : BBOX_DEBOUNCE_MS;
    bboxTimerRef.current = window.setTimeout(() => {
      void fetchMerchantsForCurrentView(reason);
    }, delay);
  };

  const openMerchantByFeature = (f: maplibregl.MapGeoJSONFeature): void => {
    const merchantId =
      typeof f.properties?.id === "string" ? f.properties.id : "";
    const fromCache = merchantId
      ? merchantsByIdRef.current.get(merchantId)
      : undefined;

    const geometry = f.geometry as GeoJSON.Point;
    const [lon, lat] = geometry.coordinates as [number, number];

    const merchant: Merchant = fromCache ?? {
      id: merchantId,
      name: String(f.properties?.name ?? "Bitcoin Merchant"),
      lat,
      lon,
      category: String(f.properties?.category ?? "merchant"),
      source: normalizeSource(f.properties?.source),
      signalStrength: Number(f.properties?.signalStrength ?? 0),
      tags: {},
    };

    setSelectedMerchant(merchant);
    onInteractRef.current();
  };

  const closeMerchantDrawer = (): void => {
    setSelectedMerchant(null);
  };

  const requestGeolocation = (): void => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationPermission("denied");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        };
        setLocationPermission("granted");
        setUserLocation(next);
        setFollowMe(true);

        const map = mapRef.current;
        if (map) {
          map.easeTo({
            center: [next.lon, next.lat],
            zoom: Math.max(map.getZoom(), 14),
            duration: 700,
            essential: true,
          });
        }
      },
      () => {
        setLocationPermission("denied");
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 30000,
      },
    );
  };

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

    const handleLoad = () => {
      ensureMapSourcesAndLayers(map);
      scheduleFetch("init");
    };

    const handleStyleData = () => {
      if (!map.isStyleLoaded()) return;
      ensureMapSourcesAndLayers(map);
      const userSrc = map.getSource(SOURCE_USER_ID) as
        | maplibregl.GeoJSONSource
        | undefined;
      if (userSrc) {
        userSrc.setData(userLocationFC(userLocationRef.current));
      }
      if (mapMerchantsRef.current.length > 0) {
        applyMerchantDataToMap(map, mapMerchantsRef.current);
      }
      const selectedId = selectedMerchantRef.current?.id ?? "";
      if (map.getLayer(LAYER_SELECTED)) {
        map.setFilter(LAYER_SELECTED, [
          "all",
          ["!", ["has", "point_count"]],
          ["==", ["get", "id"], selectedId],
        ]);
      }
    };

    const handleMoveEnd = () => {
      setHoverTooltip(null);
      scheduleFetch("move");
    };

    const handleClusterClick = async (
      e: maplibregl.MapMouseEvent & {
        features?: maplibregl.MapGeoJSONFeature[];
      },
    ) => {
      const f = e.features?.[0];
      if (!f) return;
      const clusterId = f.properties?.cluster_id;
      if (clusterId == null) return;
      const source = map.getSource(SOURCE_ID) as
        | maplibregl.GeoJSONSource
        | undefined;
      if (!source) return;

      try {
        const zoom = await source.getClusterExpansionZoom(clusterId);
        const [lng, lat] = (f.geometry as GeoJSON.Point).coordinates as [
          number,
          number,
        ];
        map.easeTo({ center: [lng, lat], zoom, duration: 350 });
      } catch (err) {
        console.error("cluster zoom failed", err);
      }
    };

    const handlePointClick = (
      e: maplibregl.MapMouseEvent & {
        features?: maplibregl.MapGeoJSONFeature[];
      },
    ) => {
      const f = e.features?.[0];
      if (!f) return;
      openMerchantByFeature(f);
    };

    const handlePointMove = (
      e: maplibregl.MapMouseEvent & {
        features?: maplibregl.MapGeoJSONFeature[];
      },
    ) => {
      const f = e.features?.[0];
      if (!f) {
        setHoverTooltip(null);
        return;
      }

      const merchantId =
        typeof f.properties?.id === "string" ? f.properties.id : "";
      const merchant = merchantId
        ? merchantsByIdRef.current.get(merchantId)
        : undefined;
      if (!merchant) {
        setHoverTooltip(null);
        return;
      }

      setHoverTooltip({
        x: e.point.x,
        y: e.point.y,
        merchant,
      });
    };

    const setPointer = () => {
      map.getCanvas().style.cursor = "pointer";
    };

    const clearPointer = () => {
      map.getCanvas().style.cursor = "";
      setHoverTooltip(null);
    };

    map.on("load", handleLoad);
    map.on("styledata", handleStyleData);
    map.on("moveend", handleMoveEnd);

    map.on("click", LAYER_CLUSTERS, handleClusterClick);
    map.on("click", LAYER_POINTS, handlePointClick);
    map.on("mousemove", LAYER_POINTS, handlePointMove);
    map.on("mouseenter", LAYER_CLUSTERS, setPointer);
    map.on("mouseleave", LAYER_CLUSTERS, clearPointer);
    map.on("mouseenter", LAYER_POINTS, setPointer);
    map.on("mouseleave", LAYER_POINTS, clearPointer);

    return () => {
      abortRef.current?.abort();
      if (bboxTimerRef.current) {
        window.clearTimeout(bboxTimerRef.current);
        bboxTimerRef.current = null;
      }
      if (geolocWatchIdRef.current != null && navigator.geolocation) {
        navigator.geolocation.clearWatch(geolocWatchIdRef.current);
        geolocWatchIdRef.current = null;
      }

      map.off("load", handleLoad);
      map.off("styledata", handleStyleData);
      map.off("moveend", handleMoveEnd);

      map.off("click", LAYER_CLUSTERS, handleClusterClick);
      map.off("click", LAYER_POINTS, handlePointClick);
      map.off("mousemove", LAYER_POINTS, handlePointMove);
      map.off("mouseenter", LAYER_CLUSTERS, setPointer);
      map.off("mouseleave", LAYER_CLUSTERS, clearPointer);
      map.off("mouseenter", LAYER_POINTS, setPointer);
      map.off("mouseleave", LAYER_POINTS, clearPointer);

      map.remove();
      mapRef.current = null;
    };
    // map lifecycle must initialize exactly once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !flyToCoords) return;

    const flyKey = `${flyToCoords.lat.toFixed(5)},${flyToCoords.lon.toFixed(5)}`;
    if (lastFlyKeyRef.current === flyKey) return;
    lastFlyKeyRef.current = flyKey;

    map.flyTo({
      center: [flyToCoords.lon, flyToCoords.lat],
      zoom: Math.max(map.getZoom(), 15),
      essential: true,
      duration: 650,
    });
  }, [flyToCoords]);

  useEffect(() => {
    selectedMerchantRef.current = selectedMerchant;
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const selectedId = selectedMerchant?.id ?? "";
    if (map.getLayer(LAYER_SELECTED)) {
      map.setFilter(LAYER_SELECTED, [
        "all",
        ["!", ["has", "point_count"]],
        ["==", ["get", "id"], selectedId],
      ]);
    }
  }, [selectedMerchant]);

  useEffect(() => {
    userLocationRef.current = userLocation;
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const src = map.getSource(SOURCE_USER_ID) as
      | maplibregl.GeoJSONSource
      | undefined;
    if (src) {
      src.setData(userLocationFC(userLocation));
    }
  }, [userLocation]);

  useEffect(() => {
    if (!followMe) {
      if (geolocWatchIdRef.current != null && navigator.geolocation) {
        navigator.geolocation.clearWatch(geolocWatchIdRef.current);
        geolocWatchIdRef.current = null;
      }
      return;
    }

    if (typeof navigator === "undefined" || !navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const next = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        };
        setUserLocation(next);
        const map = mapRef.current;
        if (map) {
          map.easeTo({
            center: [next.lon, next.lat],
            duration: 600,
            essential: true,
          });
        }
      },
      () => {
        setFollowMe(false);
        setLocationPermission("denied");
      },
      {
        enableHighAccuracy: true,
        timeout: 7000,
        maximumAge: 10000,
      },
    );

    geolocWatchIdRef.current = watchId;
    return () => {
      if (navigator.geolocation && geolocWatchIdRef.current != null) {
        navigator.geolocation.clearWatch(geolocWatchIdRef.current);
        geolocWatchIdRef.current = null;
      }
    };
  }, [followMe]);

  const nearbyCount = useMemo(() => {
    if (!userLocation) return 0;
    return mapMerchants.filter(
      (m) =>
        distanceKm(userLocation.lat, userLocation.lon, m.lat, m.lon) <= 2.0,
    ).length;
  }, [mapMerchants, userLocation]);

  const smartTop3 = useMemo(() => {
    if (mapMerchants.length === 0) return [] as Merchant[];

    const map = mapRef.current;
    const center = map?.getCenter();

    return [...mapMerchants]
      .map((m) => {
        const distancePenalty = center
          ? distanceKm(center.lat, center.lng, m.lat, m.lon) * 3
          : 0;
        const score = (m.signalStrength ?? 0) * 100 - distancePenalty;
        return { merchant: m, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((x) => x.merchant);
  }, [mapMerchants]);

  const showGeoBanner =
    locationPermission === "idle" &&
    userLocation === null &&
    selectedMerchant === null;

  const handleLocateMe = () => {
    if (userLocation) {
      const map = mapRef.current;
      if (map) {
        map.easeTo({
          center: [userLocation.lon, userLocation.lat],
          zoom: Math.max(map.getZoom(), 14),
          duration: 600,
          essential: true,
        });
      }
      return;
    }
    requestGeolocation();
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === "Escape") {
      closeMerchantDrawer();
      setHoverTooltip(null);
      return;
    }

    if (e.key === "Enter") {
      const target = hoverTooltip?.merchant ?? smartTop3[0];
      if (target) {
        setSelectedMerchant(target);
        onInteractRef.current();
      }
    }
  };

  const aiNearbyHint =
    "AI Nearby Picks will summarize nearby high-signal merchants in a future update.";

  return (
    <div
      className="w-full h-full relative bg-[#050505]"
      onKeyDown={handleKeyDown}
    >
      <div
        ref={mapContainer}
        className="absolute inset-0"
        style={{ width: "100vw", height: "100vh" }}
        tabIndex={0}
        aria-label="SatsRover map"
      />

      {showGeoBanner && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-black/80 border border-white/15 text-gray-200 rounded-lg px-3 py-2 text-xs font-mono flex items-center gap-2">
          <span>Use your location to find nearby merchants</span>
          <button
            onClick={requestGeolocation}
            className="px-2 py-1 rounded bg-[#F7931A] text-black font-bold uppercase tracking-wide"
          >
            Allow
          </button>
          <button
            onClick={() => setLocationPermission("dismissed")}
            className="px-2 py-1 rounded border border-white/20"
          >
            Not now
          </button>
        </div>
      )}

      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={handleLocateMe}
          className="px-3 py-2 rounded-md bg-black/75 border border-white/15 text-xs text-white hover:bg-black/90"
        >
          Locate Me
        </button>
        <button
          onClick={() => setFollowMe((prev) => !prev)}
          className={`px-3 py-2 rounded-md border text-xs ${
            followMe
              ? "bg-[#00FF41]/20 border-[#00FF41]/50 text-[#00FF41]"
              : "bg-black/75 border-white/15 text-white"
          }`}
        >
          Follow Me {followMe ? "On" : "Off"}
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => mapRef.current?.zoomIn({ duration: 250 })}
            className="w-10 h-10 rounded-md bg-black/75 border border-white/15 text-white"
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            onClick={() => mapRef.current?.zoomOut({ duration: 250 })}
            className="w-10 h-10 rounded-md bg-black/75 border border-white/15 text-white"
            aria-label="Zoom out"
          >
            -
          </button>
        </div>
      </div>

      {isSearchingArea && (
        <div className="absolute top-4 left-4 z-20 px-3 py-2 rounded-md bg-black/75 border border-white/15 text-xs text-gray-200 font-mono animate-pulse">
          Searching this area...
        </div>
      )}

      {userLocation && (
        <div className="absolute bottom-24 left-4 z-20 px-3 py-2 rounded-md bg-black/75 border border-[#60A5FA]/30 text-xs text-[#93C5FD] font-mono">
          You are here • {nearbyCount} nearby merchants
        </div>
      )}

      {smartTop3.length > 0 && (
        <div className="absolute bottom-24 right-4 z-20 w-64 rounded-lg bg-black/80 border border-white/15 p-3 text-xs font-mono text-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="uppercase tracking-widest text-[10px] text-[#F7931A]">
              Smart Explore
            </p>
            <button
              disabled
              title={aiNearbyHint}
              className="text-[10px] px-2 py-1 rounded border border-white/15 text-gray-500 cursor-not-allowed"
            >
              AI Nearby Picks (coming soon)
            </button>
          </div>
          <div className="space-y-2">
            {smartTop3.map((merchant, idx) => (
              <button
                key={merchant.id}
                onClick={() => {
                  setSelectedMerchant(merchant);
                  onInteractRef.current();
                  mapRef.current?.easeTo({
                    center: [merchant.lon, merchant.lat],
                    duration: 400,
                  });
                }}
                className="w-full text-left p-2 rounded border border-white/10 hover:border-[#F7931A]/50 hover:bg-white/5"
              >
                <div className="flex items-center justify-between">
                  <span className="truncate">
                    {idx + 1}. {merchant.name}
                  </span>
                  <span className="text-[#F7931A]">
                    {Math.round((merchant.signalStrength ?? 0) * 100)}
                  </span>
                </div>
                <p className="text-[10px] text-gray-500 truncate">
                  {(merchant.category ?? "merchant").replaceAll("_", " ")}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {hoverTooltip && (
        <div
          className="absolute z-20 pointer-events-none px-2 py-1 rounded-md bg-black/90 border border-white/20 text-[10px] text-gray-100 max-w-52"
          style={{ left: hoverTooltip.x + 12, top: hoverTooltip.y + 12 }}
        >
          <p className="font-bold truncate">{hoverTooltip.merchant.name}</p>
          <p className="text-gray-400 truncate">
            {(hoverTooltip.merchant.category ?? "merchant").replaceAll(
              "_",
              " ",
            )}
          </p>
          <p className="text-[#F7931A]">
            Signal{" "}
            {Math.round((hoverTooltip.merchant.signalStrength ?? 0) * 100)}
          </p>
        </div>
      )}

      <MerchantDrawer
        merchant={selectedMerchant}
        onClose={closeMerchantDrawer}
      />
    </div>
  );
}

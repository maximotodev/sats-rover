// src/app/api/merchants/route.ts
import { NextResponse } from "next/server";
import { Merchant } from "@/lib/types";

export const revalidate = 3600;

const OVERPASS_INSTANCE = "https://overpass-api.de/api/interpreter";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawBbox = searchParams.get("bbox");

  if (!rawBbox)
    return NextResponse.json({ error: "Missing bbox" }, { status: 400 });

  // SENIOR FIX: Normalize BBox
  // We round to 3 decimal places (~110m precision).
  // This drastically increases cache hit rates on the edge.
  const bbox = rawBbox
    .split(",")
    .map((coord) => Number(coord).toFixed(3))
    .join(",");

  const query = `
    [out:json][timeout:25];
    (
      node["payment:lightning"="yes"](${bbox});
      way["payment:lightning"="yes"](${bbox});
      node["currency:XBT"="yes"](${bbox});
      way["currency:XBT"="yes"](${bbox});
    );
    out center;
  `;

  try {
    const controller = new AbortController();

    // UPDATED: Increased hard timeout to 25 seconds
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const response = await fetch(OVERPASS_INSTANCE, {
      method: "POST",
      body: query,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "SatsRover/1.0",
      },
    });

    clearTimeout(timeoutId);

    // If Overpass is down, throw specific error
    if (!response.ok) {
      throw new Error(`Overpass API responded with ${response.status}`);
    }

    const data = await response.json();

    const merchants: Merchant[] = data.elements.map((el: any) => ({
      id: el.id.toString(),
      name: el.tags.name || "Unknown Merchant",
      lat: el.lat || el.center.lat,
      lon: el.lon || el.center.lon,
      category: el.tags.shop || el.tags.amenity || "other",
      tags: el.tags,
    }));

    return NextResponse.json({ data: merchants });
  } catch (error: any) {
    console.error("Merchant Fetch Error:", error);

    // Return empty data on error so the map doesn't crash, just shows nothing
    // This is "Graceful Degradation"
    return NextResponse.json(
      { data: [], error: "Upstream API slow", details: error.message },
      { status: 200 } // Return 200 with empty data to prevent UI errors
    );
  }
}

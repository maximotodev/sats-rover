import { NextResponse } from "next/server";
import { Merchant } from "@/lib/types";

// CONFIGURATION
// Cache for 1 hour (3600s) on Vercel's Edge Network.
// This prevents us from hammering the Overpass API if multiple users view the same city.
export const revalidate = 3600;

const OVERPASS_INSTANCE = "https://overpass-api.de/api/interpreter";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bbox = searchParams.get("bbox"); // Expected format: south,west,north,east

  // 1. INPUT VALIDATION
  // We strictly validate the Bounding Box to prevent injection attacks or malformed queries.
  if (!bbox) {
    return NextResponse.json(
      { error: "Missing bbox parameter" },
      { status: 400 }
    );
  }

  // Regex to ensure it's just 4 comma-separated numbers (floats allowed)
  const bboxRegex = /^-?\d+(\.\d+)?,-?\d+(\.\d+)?,-?\d+(\.\d+)?,-?\d+(\.\d+)?$/;
  if (!bboxRegex.test(bbox)) {
    return NextResponse.json(
      { error: "Invalid bbox format. Expected: s,w,n,e" },
      { status: 400 }
    );
  }

  // 2. QUERY CONSTRUCTION
  // We ask for nodes/ways that accept Lightning OR Bitcoin.
  // [out:json][timeout:10] sets a strict timeout on their server side.
  const query = `
    [out:json][timeout:10];
    (
      node["payment:lightning"="yes"](${bbox});
      way["payment:lightning"="yes"](${bbox});
      node["currency:XBT"="yes"](${bbox});
      way["currency:XBT"="yes"](${bbox});
    );
    out center;
  `;

  try {
    // 3. UPSTREAM FETCH WITH CIRCUIT BREAKER
    // If Overpass hangs, we want to fail fast so our UI doesn't freeze.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s hard timeout

    const response = await fetch(OVERPASS_INSTANCE, {
      method: "POST",
      body: query,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent":
          "SatsRover/1.0 (Bitcoin Travel App; +https://github.com/yourusername/sats-rover)",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Overpass API responded with ${response.status}`);
    }

    const data = await response.json();

    // 4. DATA TRANSFORMATION & SANITIZATION
    // We convert the raw OSM structure into our clean 'Merchant' application model.
    const merchants: Merchant[] = data.elements.map((el: any) => ({
      id: el.id.toString(),
      name: el.tags.name || "Unknown Merchant",
      // OSM "Ways" (buildings) have a center, "Nodes" have lat/lon
      lat: el.lat || el.center.lat,
      lon: el.lon || el.center.lon,
      // Simple heuristic for category based on OSM tags
      category: el.tags.shop || el.tags.amenity || el.tags.tourism || "other",
      tags: el.tags,
    }));

    // 5. SUCCESS RESPONSE
    return NextResponse.json({ data: merchants });
  } catch (error: any) {
    console.error("Merchant Fetch Error:", error);

    const isTimeout = error.name === "AbortError";
    const status = isTimeout ? 504 : 502;
    const message = isTimeout
      ? "Upstream request timed out"
      : "Failed to fetch merchant data";

    return NextResponse.json(
      { error: message, details: error.message },
      { status }
    );
  }
}

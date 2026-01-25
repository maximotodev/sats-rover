import ngeohash from "ngeohash";
import { BITCOIN_HUBS } from "./constants";

// Canonical precisions (DO NOT CHANGE once live)
export const GEOHASH_EXACT = 7; // ~150m (User Location)
export const GEOHASH_CITY = 3; // ~150km (City Aggregation)

export function getExactGeohash(lat: number, lon: number): string {
  return ngeohash.encode(lat, lon, GEOHASH_EXACT);
}

/**
 * Generates a Deterministic City ID: country-geohashPrefix
 * Example: cz-u2f
 * This ID is stable forever, even if we rename "Prague" to "Praha".
 */
export function generateCityId(
  lat: number,
  lon: number
): { cityId: string; cityName: string; country: string } {
  // 1. Calculate the math-based ID
  const prefix = ngeohash.encode(lat, lon, GEOHASH_CITY);

  // 2. Try to resolve human-readable names (UI Layer only)
  // We check if this geohash is near a known hub to get the correct Country Code
  let countryCode = "xx";
  let readableName = "Wilderness";

  for (const hub of BITCOIN_HUBS) {
    const dist = getDistanceFromLatLonInKm(lat, lon, hub.lat, hub.lon);
    if (dist < 100) {
      // Broad city match
      countryCode = getCountryCode(hub.country);
      readableName = hub.name;
      break;
    }
  }

  return {
    cityId: `${countryCode}-${prefix}`, // e.g. "cz-u2f"
    cityName: readableName,
    country: countryCode.toUpperCase(),
  };
}

// Helper: Haversine Distance
function getDistanceFromLatLonInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

// Helper: Map Emoji to ISO Code
function getCountryCode(countryStr: string) {
  const map: Record<string, string> = {
    "🇸🇻": "sv",
    "🇨🇭": "ch",
    "🇨🇿": "cz",
    "🇵🇹": "pt",
    "🇩🇪": "de",
    "🇺🇸": "us",
    "🇱🇻": "lv",
    "🇭🇳": "hn",
  };
  return map[countryStr] || "xx";
}

import "server-only";
import { config } from "./config";

export type LocationType = "office" | "remote" | "unverified";

export type GeoReading = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  /** Epoch ms reported by the browser's Geolocation API. */
  positionTimestamp: number | null;
};

export type IpGeo = { latitude: number; longitude: number } | null;

export type LocationVerdict =
  | { ok: false; error: string }
  | { ok: true; distanceMeters: number | null; locationType: LocationType; flags: string[] };

const EARTH_RADIUS_M = 6_371_000;
/** Accepted fixes less precise than this are flagged for admin review. */
const LOW_ACCURACY_FLAG_M = 75;

export function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(a));
}

function decimals(n: number): number {
  const s = String(n);
  const i = s.indexOf(".");
  return i === -1 ? 0 : s.length - i - 1;
}

/** Approximate client location that Vercel attaches to every request. */
export function readIpGeo(h: Headers): IpGeo {
  const rawLat = h.get("x-vercel-ip-latitude");
  const rawLng = h.get("x-vercel-ip-longitude");
  if (!rawLat || !rawLng) return null;
  const lat = Number(rawLat);
  const lng = Number(rawLng);
  return Number.isFinite(lat) && Number.isFinite(lng) ? { latitude: lat, longitude: lng } : null;
}

export function readClientIp(h: Headers): string | null {
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || null;
}

/**
 * Server-side validation of a browser GPS reading. The client never supplies the
 * timestamp or the geofence result; obviously forged readings are rejected and
 * suspicious ones are flagged for admin review.
 */
export function verifyLocation(reading: GeoReading, now: Date, ipGeo: IpGeo): LocationVerdict {
  const { latitude, longitude, accuracy, positionTimestamp } = reading;
  const flags: string[] = [];

  if (Math.abs(latitude) < 1e-6 && Math.abs(longitude) < 1e-6) {
    return { ok: false, error: "Invalid location reading. Please enable precise location and try again." };
  }
  const maxAccuracy = config.security.maxAccuracyMeters;
  if (accuracy == null || accuracy > maxAccuracy) {
    const got = accuracy == null ? "unknown" : `±${Math.round(accuracy)} m`;
    return {
      ok: false,
      error:
        `Your location isn't precise enough (${got}; needs ±${maxAccuracy} m or better). ` +
        "Turn on precise location / GPS, or use your phone, move near a window, and try again.",
    };
  }
  if (positionTimestamp != null) {
    const ageMs = Math.abs(now.getTime() - positionTimestamp);
    if (ageMs > 10 * 60_000) {
      return { ok: false, error: "Location reading is outdated. Refresh your location and try again." };
    }
    if (ageMs > 2 * 60_000) flags.push("stale_position");
  }

  if (accuracy > LOW_ACCURACY_FLAG_M) flags.push("low_accuracy");
  // Real GPS fixes carry high-precision decimals and non-zero accuracy; hand-typed values rarely do.
  if (accuracy === 0 || (decimals(latitude) <= 3 && decimals(longitude) <= 3)) flags.push("suspicious_precision");

  if (ipGeo) {
    const km = haversineMeters(latitude, longitude, ipGeo.latitude, ipGeo.longitude) / 1000;
    if (km > config.security.ipMismatchKm) flags.push("ip_location_mismatch");
  }

  if (!config.office.configured) {
    flags.push("geofence_not_configured");
    return { ok: true, distanceMeters: null, locationType: "unverified", flags };
  }

  const distance = Math.round(haversineMeters(latitude, longitude, config.office.lat, config.office.lng));
  return {
    ok: true,
    distanceMeters: distance,
    locationType: distance <= config.office.radiusMeters ? "office" : "remote",
    flags,
  };
}

/** Flags check-in → check-out movement faster than a commercial flight. */
export function isImpossibleTravel(
  from: { lat: number; lng: number; at: Date },
  to: { lat: number; lng: number; at: Date },
): boolean {
  const meters = haversineMeters(from.lat, from.lng, to.lat, to.lng);
  const hours = Math.max((to.at.getTime() - from.at.getTime()) / 3_600_000, 1 / 60);
  return meters > 50_000 && meters / 1000 / hours > 900;
}

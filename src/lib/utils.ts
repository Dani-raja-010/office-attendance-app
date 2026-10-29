import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

export function mapsUrl(lat: number | null, lng: number | null) {
  if (lat == null || lng == null) return null;
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

export function formatDistance(meters: number | null) {
  if (meters == null) return "—";
  return meters < 1000 ? `${meters} m` : `${(meters / 1000).toFixed(1)} km`;
}

export const FLAG_LABELS: Record<string, string> = {
  low_accuracy: "Low GPS accuracy",
  stale_position: "Stale GPS reading",
  ip_location_mismatch: "IP / GPS mismatch",
  impossible_travel: "Impossible travel",
  suspicious_precision: "Suspicious coordinates",
  geofence_not_configured: "Geofence not configured",
};

export const TASK_STATUS_LABELS = {
  todo: "To do",
  in_progress: "In progress",
  completed: "Completed",
  blocked: "Blocked",
} as const;

export type TaskStatus = keyof typeof TASK_STATUS_LABELS;
export const TASK_STATUSES = Object.keys(TASK_STATUS_LABELS) as TaskStatus[];

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

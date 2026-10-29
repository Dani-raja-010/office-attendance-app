import "server-only";
import { config } from "./config";

type Parts = { year: string; month: string; day: string; hour: string; minute: string; second: string };

function parts(date: Date, timeZone = config.timezone): Parts {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const out = {} as Record<string, string>;
  for (const p of fmt.formatToParts(date)) out[p.type] = p.value;
  return out as Parts;
}

/** Office-local calendar date (YYYY-MM-DD) for an instant. */
export function officeDate(date = new Date()): string {
  const p = parts(date);
  return `${p.year}-${p.month}-${p.day}`;
}

/** Office-local wall-clock timestamp, e.g. "2026-10-29 09:03:12". */
export function officeLocalTimestamp(date = new Date()): string {
  const p = parts(date);
  return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}:${p.second}`;
}

export function isLate(date: Date): boolean {
  const p = parts(date);
  const minutes = Number(p.hour) * 60 + Number(p.minute);
  return minutes > config.shift.startMinutes + config.shift.graceMinutes;
}

export function isWorkDay(dateStr: string): boolean {
  const day = new Date(`${dateStr}T12:00:00Z`).getUTCDay() || 7; // ISO weekday
  return config.shift.workDays.includes(day);
}

export function shiftDate(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function isDateStr(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

export function formatTime(value: Date | string | null): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: config.timezone,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatDate(dateStr: string, style: "short" | "long" = "short"): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: style === "long" ? "long" : "short",
    month: style === "long" ? "long" : "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${dateStr}T12:00:00Z`));
}

export function durationHours(start: Date | string, end: Date | string | null): number | null {
  if (!end) return null;
  return Math.max(0, (new Date(end).getTime() - new Date(start).getTime()) / 3_600_000);
}

export function formatHours(hours: number | null): string {
  if (hours == null) return "—";
  const total = Math.round(hours * 60);
  return `${Math.floor(total / 60)}h ${String(total % 60).padStart(2, "0")}m`;
}

export function shiftStartLabel(): string {
  const h = Math.floor(config.shift.startMinutes / 60);
  const m = config.shift.startMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

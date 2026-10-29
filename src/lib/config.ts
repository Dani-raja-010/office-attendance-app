import "server-only";

function num(value: string | undefined, fallback: number): number {
  if (value === undefined || value.trim() === "") return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function list(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);
}

const [startHour, startMinute] = (process.env.OFFICE_START_TIME || "09:00").split(":").map(Number);
const officeLat = num(process.env.OFFICE_LAT, NaN);
const officeLng = num(process.env.OFFICE_LNG, NaN);

export const config = {
  timezone: process.env.OFFICE_TIMEZONE || "UTC",
  office: {
    name: process.env.OFFICE_NAME || "Head Office",
    lat: officeLat,
    lng: officeLng,
    radiusMeters: num(process.env.OFFICE_RADIUS_METERS, 200),
    configured: Number.isFinite(officeLat) && Number.isFinite(officeLng),
  },
  shift: {
    startMinutes: (startHour || 0) * 60 + (startMinute || 0),
    graceMinutes: num(process.env.LATE_GRACE_MINUTES, 15),
    workDays: (process.env.WORK_DAYS || "1,2,3,4,5").split(",").map(Number),
  },
  security: {
    allowedDomains: list(process.env.ALLOWED_EMAIL_DOMAINS),
    adminEmails: list(process.env.ADMIN_EMAILS),
    maxAccuracyMeters: num(process.env.MAX_GPS_ACCURACY_METERS, 3000),
    ipMismatchKm: num(process.env.IP_MISMATCH_KM, 300),
  },
};

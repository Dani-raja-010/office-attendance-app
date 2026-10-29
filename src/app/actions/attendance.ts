"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { sql } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { getOpenAttendance } from "@/lib/attendance";
import { isImpossibleTravel, readClientIp, readIpGeo, verifyLocation } from "@/lib/geo";
import { isLate, officeDate, officeLocalTimestamp, formatTime } from "@/lib/time";
import type { ActionResult } from "@/lib/utils";

const readingSchema = z.object({
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
  accuracy: z.number().finite().nonnegative().nullable(),
  positionTimestamp: z.number().finite().nullable(),
  timezone: z.string().max(64).nullable(),
});

export type GeoInput = z.infer<typeof readingSchema>;

async function prepare(input: unknown) {
  const parsed = readingSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid location data received." } as const;
  const h = await headers();
  const now = new Date(); // Server clock is the only source of truth for timestamps.
  const verdict = verifyLocation(parsed.data, now, readIpGeo(h));
  if (!verdict.ok) return { error: verdict.error } as const;
  return {
    reading: parsed.data,
    verdict,
    now,
    ip: readClientIp(h),
    userAgent: h.get("user-agent")?.slice(0, 500) ?? null,
  } as const;
}

function refresh() {
  revalidatePath("/dashboard");
  revalidatePath("/history");
  revalidatePath("/admin");
}

export async function checkIn(input: GeoInput): Promise<ActionResult> {
  const user = await requireUser();
  const ctx = await prepare(input);
  if ("error" in ctx) return { ok: false, error: ctx.error! };

  const { reading, verdict, now } = ctx;
  const status = isLate(now) ? "late" : "present";
  const rows = await sql`
    INSERT INTO attendance (
      user_id, date, status, check_in_time, check_in_local,
      check_in_lat, check_in_lng, check_in_accuracy, check_in_distance_m, check_in_location_type,
      client_timezone, flags, ip_address, user_agent
    ) VALUES (
      ${user.id}, ${officeDate(now)}, ${status}, ${now}, ${officeLocalTimestamp(now)},
      ${reading.latitude}, ${reading.longitude}, ${reading.accuracy}, ${verdict.distanceMeters}, ${verdict.locationType},
      ${reading.timezone}, ${verdict.flags}, ${ctx.ip}, ${ctx.userAgent}
    )
    ON CONFLICT (user_id, date) DO NOTHING
    RETURNING id`;

  if (rows.length === 0) return { ok: false, error: "You have already checked in today." };
  refresh();
  return {
    ok: true,
    message: `Checked in at ${formatTime(now)}${status === "late" ? " (late)" : ""} — ${verdict.locationType}.`,
  };
}

export async function checkOut(input: GeoInput): Promise<ActionResult> {
  const user = await requireUser();
  const ctx = await prepare(input);
  if ("error" in ctx) return { ok: false, error: ctx.error! };

  const open = await getOpenAttendance(user.id);
  if (!open) return { ok: false, error: "No open check-in found. Please check in first." };

  const { reading, verdict, now } = ctx;
  const flags = new Set([...open.flags, ...verdict.flags]);
  if (
    open.check_in_lat != null &&
    open.check_in_lng != null &&
    isImpossibleTravel(
      { lat: open.check_in_lat, lng: open.check_in_lng, at: new Date(open.check_in_time) },
      { lat: reading.latitude, lng: reading.longitude, at: now },
    )
  ) {
    flags.add("impossible_travel");
  }

  const rows = await sql`
    UPDATE attendance SET
      check_out_time = ${now},
      check_out_local = ${officeLocalTimestamp(now)},
      check_out_lat = ${reading.latitude},
      check_out_lng = ${reading.longitude},
      check_out_accuracy = ${reading.accuracy},
      check_out_distance_m = ${verdict.distanceMeters},
      check_out_location_type = ${verdict.locationType},
      flags = ${[...flags]}
    WHERE id = ${open.id} AND user_id = ${user.id} AND check_out_time IS NULL
    RETURNING id`;

  if (rows.length === 0) return { ok: false, error: "You have already checked out." };
  refresh();
  return { ok: true, message: `Checked out at ${formatTime(now)}. Have a good evening!` };
}

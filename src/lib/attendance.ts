import "server-only";
import { sql } from "./db";
import type { LocationType } from "./geo";
import type { User } from "./users";

export type AttendanceRecord = {
  id: string;
  user_id: string;
  date: string;
  status: "present" | "late";
  check_in_time: Date;
  check_in_local: string;
  check_in_lat: number | null;
  check_in_lng: number | null;
  check_in_accuracy: number | null;
  check_in_distance_m: number | null;
  check_in_location_type: LocationType | null;
  check_out_time: Date | null;
  check_out_local: string | null;
  check_out_lat: number | null;
  check_out_lng: number | null;
  check_out_accuracy: number | null;
  check_out_distance_m: number | null;
  check_out_location_type: LocationType | null;
  client_timezone: string | null;
  flags: string[];
  ip_address: string | null;
  user_agent: string | null;
};

export type AttendanceWithUser = AttendanceRecord & Pick<User, "name" | "email" | "employee_id" | "image">;

export async function getAttendanceForDate(userId: string, date: string) {
  const [row] = await sql<AttendanceRecord[]>`
    SELECT * FROM attendance WHERE user_id = ${userId} AND date = ${date}`;
  return row ?? null;
}

/** Latest record still awaiting check-out (supports shifts that cross midnight). */
export async function getOpenAttendance(userId: string) {
  const [row] = await sql<AttendanceRecord[]>`
    SELECT * FROM attendance
     WHERE user_id = ${userId}
       AND check_out_time IS NULL
       AND check_in_time > now() - interval '20 hours'
     ORDER BY check_in_time DESC
     LIMIT 1`;
  return row ?? null;
}

export async function listUserAttendance(userId: string, limit = 30) {
  return sql<AttendanceRecord[]>`
    SELECT * FROM attendance WHERE user_id = ${userId} ORDER BY date DESC LIMIT ${limit}`;
}

export async function listAttendanceRange(from: string, to: string, search?: string) {
  const term = search?.trim() ? `%${search.trim()}%` : null;
  return sql<AttendanceWithUser[]>`
    SELECT a.*, u.name, u.email, u.employee_id, u.image
      FROM attendance a
      JOIN users u ON u.id = a.user_id
     WHERE a.date BETWEEN ${from} AND ${to}
       ${term ? sql`AND (u.name ILIKE ${term} OR u.email ILIKE ${term} OR u.employee_id ILIKE ${term})` : sql``}
     ORDER BY a.date DESC, a.check_in_time ASC`;
}

export type DailyOverview = {
  date: string;
  totalEmployees: number;
  present: number;
  late: number;
  absent: number;
  remote: number;
  checkedOut: number;
  flagged: number;
  records: AttendanceWithUser[];
  absentees: Pick<User, "id" | "name" | "email" | "employee_id" | "image">[];
};

export async function getDailyOverview(date: string): Promise<DailyOverview> {
  const [records, absentees, [{ count }]] = await Promise.all([
    listAttendanceRange(date, date),
    sql<DailyOverview["absentees"]>`
      SELECT u.id, u.name, u.email, u.employee_id, u.image
        FROM users u
       WHERE u.is_active
         AND NOT EXISTS (SELECT 1 FROM attendance a WHERE a.user_id = u.id AND a.date = ${date})
       ORDER BY u.name`,
    sql<{ count: number }[]>`SELECT count(*)::int AS count FROM users WHERE is_active`,
  ]);

  return {
    date,
    totalEmployees: count,
    present: records.length,
    late: records.filter((r) => r.status === "late").length,
    absent: absentees.length,
    remote: records.filter((r) => r.check_in_location_type === "remote").length,
    checkedOut: records.filter((r) => r.check_out_time).length,
    flagged: records.filter((r) => r.flags.length > 0).length,
    records,
    absentees,
  };
}

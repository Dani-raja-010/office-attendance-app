import "server-only";
import ExcelJS from "exceljs";
import { listAttendanceRange } from "./attendance";
import { listReportsRange, listTasksRange } from "./work";
import { durationHours } from "./time";
import { config } from "./config";
import { FLAG_LABELS, TASK_STATUS_LABELS } from "./utils";

export type Dataset = "attendance" | "reports" | "tasks";
type Cell = string | number | null;
type Sheet = { title: string; columns: { header: string; width: number }[]; rows: Cell[][] };

export async function buildDataset(dataset: Dataset, from: string, to: string): Promise<Sheet> {
  if (dataset === "attendance") {
    const records = await listAttendanceRange(from, to);
    return {
      title: "Attendance",
      columns: [
        { header: "Date", width: 12 },
        { header: "Employee ID", width: 12 },
        { header: "Name", width: 24 },
        { header: "Email", width: 30 },
        { header: "Status", width: 10 },
        { header: "Check-in (UTC)", width: 22 },
        { header: `Check-in (${config.timezone})`, width: 22 },
        { header: "Check-in Lat", width: 13 },
        { header: "Check-in Lng", width: 13 },
        { header: "Check-in Accuracy (m)", width: 12 },
        { header: "Check-in Distance (m)", width: 12 },
        { header: "Check-in Location", width: 12 },
        { header: "Check-in Map", width: 40 },
        { header: "Check-out (UTC)", width: 22 },
        { header: `Check-out (${config.timezone})`, width: 22 },
        { header: "Check-out Lat", width: 13 },
        { header: "Check-out Lng", width: 13 },
        { header: "Check-out Location", width: 12 },
        { header: "Hours Worked", width: 10 },
        { header: "Verification Flags", width: 30 },
      ],
      rows: records.map((r) => {
        const hours = durationHours(r.check_in_time, r.check_out_time);
        return [
          r.date,
          r.employee_id,
          r.name,
          r.email,
          r.status,
          new Date(r.check_in_time).toISOString(),
          r.check_in_local,
          r.check_in_lat,
          r.check_in_lng,
          r.check_in_accuracy != null ? Math.round(r.check_in_accuracy) : null,
          r.check_in_distance_m,
          r.check_in_location_type,
          r.check_in_lat != null ? `https://www.google.com/maps?q=${r.check_in_lat},${r.check_in_lng}` : null,
          r.check_out_time ? new Date(r.check_out_time).toISOString() : null,
          r.check_out_local,
          r.check_out_lat,
          r.check_out_lng,
          r.check_out_location_type,
          hours != null ? Number(hours.toFixed(2)) : null,
          r.flags.map((f) => FLAG_LABELS[f] ?? f).join("; "),
        ];
      }),
    };
  }

  if (dataset === "reports") {
    const reports = await listReportsRange(from, to);
    return {
      title: "EOD Reports",
      columns: [
        { header: "Date", width: 12 },
        { header: "Employee ID", width: 12 },
        { header: "Name", width: 24 },
        { header: "Email", width: 30 },
        { header: "Progress %", width: 10 },
        { header: "Achievements", width: 60 },
        { header: "Blockers", width: 40 },
        { header: "Next Day Plan", width: 40 },
        { header: "Submitted (UTC)", width: 22 },
      ],
      rows: reports.map((r) => [
        r.report_date,
        r.employee_id,
        r.name,
        r.email,
        r.progress_percentage,
        r.tasks_summary,
        r.blockers,
        r.next_day_plan,
        new Date(r.updated_at).toISOString(),
      ]),
    };
  }

  const tasks = await listTasksRange(from, to);
  return {
    title: "Tasks",
    columns: [
      { header: "Date", width: 12 },
      { header: "Employee ID", width: 12 },
      { header: "Name", width: 24 },
      { header: "Task", width: 60 },
      { header: "Status", width: 12 },
      { header: "Hours Spent", width: 10 },
      { header: "Progress %", width: 10 },
    ],
    rows: tasks.map((t) => [
      t.task_date,
      t.employee_id,
      t.name,
      t.description,
      TASK_STATUS_LABELS[t.status],
      Number(t.hours_spent),
      t.progress_percentage,
    ]),
  };
}

/** Neutralizes spreadsheet formula injection (cells starting with = + - @ etc.). */
function safeText(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

export function toCsv(sheet: Sheet): string {
  const escape = (v: Cell) => {
    if (v == null) return "";
    const s = typeof v === "number" ? String(v) : safeText(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [sheet.columns.map((c) => escape(c.header)), ...sheet.rows.map((r) => r.map(escape))];
  // BOM so Excel opens UTF-8 correctly
  return "﻿" + lines.map((l) => l.join(",")).join("\r\n");
}

export async function toXlsx(sheet: Sheet): Promise<ArrayBuffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "WorkTrack";
  wb.created = new Date();
  const ws = wb.addWorksheet(sheet.title, { views: [{ state: "frozen", ySplit: 1 }] });
  ws.columns = sheet.columns.map((c) => ({ header: c.header, width: c.width }));
  for (const row of sheet.rows) ws.addRow(row.map((v) => (typeof v === "string" ? safeText(v) : v)));
  const header = ws.getRow(1);
  header.font = { bold: true, color: { argb: "FFFFFFFF" } };
  header.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A8A" } };
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: sheet.columns.length } };
  return wb.xlsx.writeBuffer() as Promise<ArrayBuffer>;
}

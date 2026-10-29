import "server-only";
import { sql } from "./db";
import type { TaskStatus } from "./utils";
import type { User } from "./users";

export type Task = {
  id: string;
  user_id: string;
  task_date: string;
  description: string;
  status: TaskStatus;
  hours_spent: number;
  progress_percentage: number;
  created_at: Date;
  updated_at: Date;
};

export type DailyReport = {
  id: string;
  user_id: string;
  report_date: string;
  tasks_summary: string;
  progress_percentage: number;
  blockers: string | null;
  next_day_plan: string | null;
  created_at: Date;
  updated_at: Date;
};

type UserInfo = Pick<User, "name" | "email" | "employee_id" | "image">;
export type TaskWithUser = Task & UserInfo;
export type ReportWithUser = DailyReport & UserInfo;

export async function listTasks(userId: string, date: string) {
  return sql<Task[]>`
    SELECT * FROM tasks WHERE user_id = ${userId} AND task_date = ${date} ORDER BY created_at`;
}

export function summarizeTasks(tasks: Pick<Task, "hours_spent" | "progress_percentage" | "status">[]) {
  const totalHours = tasks.reduce((sum, t) => sum + Number(t.hours_spent), 0);
  const avgProgress = tasks.length
    ? Math.round(tasks.reduce((sum, t) => sum + t.progress_percentage, 0) / tasks.length)
    : 0;
  return {
    count: tasks.length,
    completed: tasks.filter((t) => t.status === "completed").length,
    blocked: tasks.filter((t) => t.status === "blocked").length,
    totalHours,
    avgProgress,
  };
}

export async function getReport(userId: string, date: string) {
  const [row] = await sql<DailyReport[]>`
    SELECT * FROM daily_reports WHERE user_id = ${userId} AND report_date = ${date}`;
  return row ?? null;
}

export async function listUserReports(userId: string, limit = 14) {
  return sql<DailyReport[]>`
    SELECT * FROM daily_reports WHERE user_id = ${userId} ORDER BY report_date DESC LIMIT ${limit}`;
}

export async function listTasksRange(from: string, to: string) {
  return sql<TaskWithUser[]>`
    SELECT t.*, u.name, u.email, u.employee_id, u.image
      FROM tasks t JOIN users u ON u.id = t.user_id
     WHERE t.task_date BETWEEN ${from} AND ${to}
     ORDER BY t.task_date DESC, u.name, t.created_at`;
}

export async function listReportsRange(from: string, to: string) {
  return sql<ReportWithUser[]>`
    SELECT r.*, u.name, u.email, u.employee_id, u.image
      FROM daily_reports r JOIN users u ON u.id = r.user_id
     WHERE r.report_date BETWEEN ${from} AND ${to}
     ORDER BY r.report_date DESC, u.name`;
}

/** Count of active employees who submitted an EOD report on a date (compliance KPI). */
export async function reportCompliance(date: string) {
  const [row] = await sql<{ submitted: number; total: number }[]>`
    SELECT
      (SELECT count(*)::int FROM daily_reports r JOIN users u ON u.id = r.user_id
        WHERE r.report_date = ${date} AND u.is_active) AS submitted,
      (SELECT count(*)::int FROM users WHERE is_active) AS total`;
  return row!;
}

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { sql } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { officeDate } from "@/lib/time";
import { TASK_STATUSES, type ActionResult } from "@/lib/utils";

const taskSchema = z.object({
  description: z.string().trim().min(3, "Describe the task (at least 3 characters).").max(2000),
  status: z.enum(TASK_STATUSES as [string, ...string[]]),
  hours_spent: z.coerce.number().min(0, "Hours can't be negative.").max(24, "Hours can't exceed 24."),
  progress_percentage: z.coerce.number().int().min(0).max(100),
});

function normalize(data: z.infer<typeof taskSchema>) {
  // A completed task is 100% by definition.
  return data.status === "completed" ? { ...data, progress_percentage: 100 } : data;
}

function firstError(error: z.ZodError) {
  return error.issues[0]?.message ?? "Invalid input.";
}

function refresh() {
  revalidatePath("/tasks");
  revalidatePath("/report");
  revalidatePath("/dashboard");
  revalidatePath("/admin/reports");
}

export async function createTask(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = taskSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  const t = normalize(parsed.data);

  await sql`
    INSERT INTO tasks (user_id, task_date, description, status, hours_spent, progress_percentage)
    VALUES (${user.id}, ${officeDate()}, ${t.description}, ${t.status}, ${t.hours_spent}, ${t.progress_percentage})`;
  refresh();
  return { ok: true, message: "Task added." };
}

const idSchema = z.string().uuid();

export async function updateTask(id: string, input: unknown): Promise<ActionResult> {
  const user = await requireUser();
  if (!idSchema.safeParse(id).success) return { ok: false, error: "Invalid task." };
  const parsed = taskSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  const t = normalize(parsed.data);

  // Only today's tasks are editable, and only by their owner.
  const rows = await sql`
    UPDATE tasks SET
      description = ${t.description}, status = ${t.status}, hours_spent = ${t.hours_spent},
      progress_percentage = ${t.progress_percentage}, updated_at = now()
    WHERE id = ${id} AND user_id = ${user.id} AND task_date = ${officeDate()}
    RETURNING id`;
  if (rows.length === 0) return { ok: false, error: "Task not found or no longer editable." };
  refresh();
  return { ok: true, message: "Task updated." };
}

export async function deleteTask(id: string): Promise<ActionResult> {
  const user = await requireUser();
  if (!idSchema.safeParse(id).success) return { ok: false, error: "Invalid task." };
  const rows = await sql`
    DELETE FROM tasks WHERE id = ${id} AND user_id = ${user.id} AND task_date = ${officeDate()} RETURNING id`;
  if (rows.length === 0) return { ok: false, error: "Task not found or no longer editable." };
  refresh();
  return { ok: true, message: "Task deleted." };
}

const reportSchema = z.object({
  tasks_summary: z.string().trim().min(10, "Summarize your achievements (at least 10 characters).").max(5000),
  blockers: z.string().trim().max(3000).optional().default(""),
  next_day_plan: z.string().trim().max(3000).optional().default(""),
  progress_percentage: z.coerce.number().int().min(0).max(100),
});

export async function submitReport(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = reportSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  const r = parsed.data;

  await sql`
    INSERT INTO daily_reports (user_id, report_date, tasks_summary, progress_percentage, blockers, next_day_plan)
    VALUES (${user.id}, ${officeDate()}, ${r.tasks_summary}, ${r.progress_percentage},
            ${r.blockers || null}, ${r.next_day_plan || null})
    ON CONFLICT (user_id, report_date) DO UPDATE SET
      tasks_summary = EXCLUDED.tasks_summary,
      progress_percentage = EXCLUDED.progress_percentage,
      blockers = EXCLUDED.blockers,
      next_day_plan = EXCLUDED.next_day_plan,
      updated_at = now()`;
  refresh();
  return { ok: true, message: "End-of-day report saved." };
}

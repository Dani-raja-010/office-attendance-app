"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { issueSetupCode } from "@/lib/passwords";
import { getUserByEmail, isAllowedEmail } from "@/lib/users";
import type { ActionResult } from "@/lib/utils";

const updateSchema = z.object({
  role: z.enum(["employee", "admin"]).optional(),
  is_active: z.boolean().optional(),
});

export async function updateEmployee(userId: string, input: unknown): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success || !z.string().uuid().safeParse(userId).success) {
    return { ok: false, error: "Invalid request." };
  }
  if (userId === admin.id) return { ok: false, error: "You can't change your own role or status." };

  const { role, is_active } = parsed.data;
  const rows = await sql`
    UPDATE users SET
      role = COALESCE(${role ?? null}, role),
      is_active = COALESCE(${is_active ?? null}, is_active)
    WHERE id = ${userId}
    RETURNING id`;
  if (rows.length === 0) return { ok: false, error: "Employee not found." };
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Employee updated." };
}

const emailSchema = z.string().trim().toLowerCase().email().max(255);

export type SetupCodeResult = { ok: true; email: string; code: string } | { ok: false; error: string };

/**
 * Approves an individual email (e.g. a personal Gmail), reactivating any existing
 * account, and returns a setup code the admin shares so the person can set a password.
 */
export async function addAllowedEmail(_prev: SetupCodeResult | null, formData: FormData): Promise<SetupCodeResult> {
  const admin = await requireAdmin();
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) return { ok: false, error: "Enter a valid email address." };
  const email = parsed.data;

  await sql`INSERT INTO allowed_emails (email, added_by) VALUES (${email}, ${admin.id}) ON CONFLICT (email) DO NOTHING`;
  await sql`UPDATE users SET is_active = true WHERE email = ${email}`;
  const code = await issueSetupCode(email, admin.id);
  revalidatePath("/admin", "layout");
  return { ok: true, email, code };
}

/** Issues a new setup code so an approved person can set or reset their password. */
export async function createSetupCode(email: string): Promise<SetupCodeResult> {
  const admin = await requireAdmin();
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) return { ok: false, error: "Invalid request." };
  if (!(await isAllowedEmail(parsed.data)) && !(await getUserByEmail(parsed.data))) {
    return { ok: false, error: "Add this email to the approved list first." };
  }
  return { ok: true, email: parsed.data, code: await issueSetupCode(parsed.data, admin.id) };
}

/** Revokes an approved email and deactivates its account so open sessions stop working too. */
export async function removeAllowedEmail(email: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) return { ok: false, error: "Invalid request." };
  if (parsed.data === admin.email.toLowerCase()) return { ok: false, error: "You can't remove your own access." };

  const rows = await sql`DELETE FROM allowed_emails WHERE email = ${parsed.data} RETURNING email`;
  if (rows.length === 0) return { ok: false, error: "Email not found." };
  await sql`UPDATE users SET is_active = false WHERE email = ${parsed.data} AND role <> 'admin'`;
  revalidatePath("/admin", "layout");
  return { ok: true, message: `${parsed.data} removed.` };
}

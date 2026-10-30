"use server";

import { AuthError } from "next-auth";
import { z } from "zod";
import { signIn, signOut } from "@/auth";
import { sql } from "@/lib/db";
import { MIN_PASSWORD_LENGTH, consumeSetupCode, hashPassword } from "@/lib/passwords";
import { isAllowedEmail, upsertUserOnLogin } from "@/lib/users";

export type FormState = { error: string } | null;

export async function signInWithGoogle() {
  await signIn("google", { redirectTo: "/dashboard" });
}

export async function passwordSignIn(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    await signIn("password", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/dashboard",
    });
    return null;
  } catch (err) {
    // signIn() redirects by throwing; only Auth.js failures are handled here.
    if (err instanceof AuthError) {
      return {
        error:
          "Wrong email or password. After 5 wrong attempts the account is locked for 15 minutes. " +
          "Forgot your password? Ask your admin for a new setup code.",
      };
    }
    throw err;
  }
}

const setupSchema = z
  .object({
    email: z.string().trim().toLowerCase().email("Enter a valid email address."),
    code: z.string().trim().min(1, "Enter the setup code from your admin."),
    name: z.string().trim().min(2, "Enter your full name.").max(100),
    password: z.string().min(MIN_PASSWORD_LENGTH, `Use at least ${MIN_PASSWORD_LENGTH} characters.`).max(200),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { message: "The two passwords don't match.", path: ["confirm"] });

/** Sets (or resets) a password using a one-time setup code, then signs the person in. */
export async function setupAccount(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = setupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]!.message };
  const { email, code, name, password } = parsed.data;

  const invalid = { error: "That email and setup code don't match, or the code has expired. Ask your admin for a new one." };
  if (!(await isAllowedEmail(email))) return invalid;
  if (!(await consumeSetupCode(email, code))) return invalid;

  const user = await upsertUserOnLogin({ email, name });
  if (!user.is_active) return { error: "This account is deactivated. Contact your admin." };
  await sql`
    UPDATE users SET password_hash = ${await hashPassword(password)}, failed_logins = 0, locked_until = NULL
    WHERE id = ${user.id}`;

  await signIn("password", { email, password, redirectTo: "/dashboard" });
  return null;
}

export async function devSignIn(formData: FormData) {
  await signIn("dev-login", {
    email: formData.get("email"),
    name: formData.get("name"),
    redirectTo: "/dashboard",
  });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}

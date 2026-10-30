import "server-only";
import { createHash, randomBytes, randomInt, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { sql } from "./db";
import { config } from "./config";
import type { User } from "./users";

const scryptAsync = promisify(scrypt) as (password: string, salt: Buffer, keylen: number) => Promise<Buffer>;

const KEY_LENGTH = 64;
const MAX_FAILED_LOGINS = 5;
const LOCK_MINUTES = 15;
const SETUP_CODE_DAYS = 7;
// No 0/O, 1/I/L: codes are read aloud and typed from chat messages.
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export const MIN_PASSWORD_LENGTH = 8;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scryptAsync(password, salt, KEY_LENGTH);
  return `scrypt$${salt.toString("base64")}$${key.toString("base64")}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64");
  const actual = await scryptAsync(password, Buffer.from(salt, "base64"), expected.length);
  return timingSafeEqual(actual, expected);
}

/**
 * Checks an email + password sign-in. Five wrong passwords lock the account
 * for 15 minutes to slow down guessing.
 */
export async function verifyLogin(email: string, password: string): Promise<User | null> {
  const [user] = await sql<(User & { password_hash: string | null; locked_until: Date | null })[]>`
    SELECT * FROM users WHERE email = ${email.toLowerCase()}`;
  if (!user?.password_hash || !user.is_active) return null;
  if (user.locked_until && user.locked_until > new Date()) return null;

  if (!(await verifyPassword(password, user.password_hash))) {
    await sql`
      UPDATE users SET
        failed_logins = CASE WHEN failed_logins + 1 >= ${MAX_FAILED_LOGINS} THEN 0 ELSE failed_logins + 1 END,
        locked_until = CASE WHEN failed_logins + 1 >= ${MAX_FAILED_LOGINS}
                            THEN now() + make_interval(mins => ${LOCK_MINUTES}) ELSE locked_until END
      WHERE id = ${user.id}`;
    return null;
  }

  await sql`UPDATE users SET failed_logins = 0, locked_until = NULL, last_login_at = now() WHERE id = ${user.id}`;
  return user;
}

function hashCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

function normalizeCode(code: string): string {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/** Creates a fresh setup code for an email (replacing any earlier one) and returns it for the admin to share. */
export async function issueSetupCode(email: string, createdBy: string): Promise<string> {
  const raw = Array.from({ length: 8 }, () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]).join("");
  await sql`
    INSERT INTO setup_codes (email, code_hash, expires_at, created_by)
    VALUES (${email}, ${hashCode(raw)}, now() + make_interval(days => ${SETUP_CODE_DAYS}), ${createdBy})
    ON CONFLICT (email) DO UPDATE SET
      code_hash = EXCLUDED.code_hash, expires_at = EXCLUDED.expires_at,
      created_by = EXCLUDED.created_by, created_at = now()`;
  return `${raw.slice(0, 4)}-${raw.slice(4)}`;
}

/**
 * Accepts a setup code issued by an admin, or ADMIN_SETUP_CODE for addresses in
 * ADMIN_EMAILS (how the first admin sets a password). Used codes are deleted.
 */
export async function consumeSetupCode(email: string, code: string): Promise<boolean> {
  const normalized = normalizeCode(code);
  if (!normalized) return false;

  const adminCode = normalizeCode(process.env.ADMIN_SETUP_CODE ?? "");
  if (adminCode && config.security.adminEmails.includes(email)) {
    const a = Buffer.from(hashCode(normalized));
    const b = Buffer.from(hashCode(adminCode));
    if (timingSafeEqual(a, b)) return true;
  }

  const rows = await sql`
    DELETE FROM setup_codes
     WHERE email = ${email} AND code_hash = ${hashCode(normalized)} AND expires_at > now()
    RETURNING email`;
  return rows.length > 0;
}

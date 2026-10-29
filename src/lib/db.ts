import "server-only";
import postgres from "postgres";

const options = {
  max: Number(process.env.DATABASE_POOL_MAX) || 5,
  idle_timeout: 20,
  connect_timeout: 15,
  // Required for transaction-mode poolers (Supabase pgbouncer / Neon pooler)
  prepare: false,
  onnotice: () => {},
  types: {
    // Return NUMERIC/DECIMAL as numbers and DATE as plain "YYYY-MM-DD" strings
    numeric: {
      to: 1700,
      from: [1700],
      serialize: (x: number) => String(x),
      parse: (x: string) => Number(x),
    },
    date: {
      to: 1082,
      from: [1082],
      serialize: (x: string) => x,
      parse: (x: string) => x,
    },
  },
};

function createClient() {
  return process.env.DATABASE_URL ? postgres(process.env.DATABASE_URL, options) : postgres(options);
}

const globalForDb = globalThis as unknown as { sql?: ReturnType<typeof createClient> };

// Reuse one pool per serverless instance / dev hot-reload
export const sql = globalForDb.sql ?? createClient();

if (process.env.NODE_ENV !== "production") globalForDb.sql = sql;

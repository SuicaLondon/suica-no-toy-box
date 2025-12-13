import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";
import { sanitizeDatabaseUrl } from "./url";

type GlobalWithDb = typeof globalThis & {
  __db?: NodePgDatabase<typeof schema>;
  __dbPool?: Pool;
};

const connectionString = sanitizeDatabaseUrl(process.env.DATABASE_URL ?? "");

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set; Drizzle needs a connection string.",
  );
}

const globalForDb = globalThis as GlobalWithDb;

const pool =
  globalForDb.__dbPool ??
  new Pool({
    connectionString,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : undefined,
  });
const db = globalForDb.__db ?? drizzle(pool, { schema });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__db = db;
  globalForDb.__dbPool = pool;
}

export { db, pool };

import "dotenv/config";
import { defineConfig } from "drizzle-kit";

import { sanitizeDatabaseUrl } from "./lib/db/url";

const rawConnectionString = process.env.DATABASE_URL;

if (!rawConnectionString) {
  throw new Error("DATABASE_URL is required for Drizzle config");
}

const connectionString = sanitizeDatabaseUrl(rawConnectionString);

export default defineConfig({
  dialect: "postgresql",
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: connectionString,
  },
  // Add verbose logging to help debug connection issues
  verbose: true,
  strict: true,
});

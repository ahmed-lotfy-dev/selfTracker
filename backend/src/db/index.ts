import * as schema from "./schema/index"
import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("========================================");
  console.error("  CRITICAL: DATABASE_URL is not set!");
  console.error("  The app will FAIL to connect to the database.");
  console.error("  Set DATABASE_URL in your environment variables.");
  console.error("========================================");
  throw new Error("DATABASE_URL environment variable is required");
}

// Log the host we're connecting to (without exposing credentials)
try {
  const url = new URL(databaseUrl);
  console.log(`[DB] Connecting to database at ${url.hostname}${url.port ? `:${url.port}` : ':5432'}`);
} catch {
  console.log(`[DB] DATABASE_URL set (could not parse as URL for logging)`);
}

const pool = new Pool({
  connectionString: databaseUrl,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: { rejectUnauthorized: false },
})

pool.on('connect', () => {
  console.log('[DB] New connection established')
})

pool.on('error', (err) => {
  console.error('[DB] Pool error:', err.message)
})

pool.on('remove', () => {
  console.log('[DB] Connection removed from pool')
})

export const db = drizzle({ connection: pool, schema })

export type db = typeof db

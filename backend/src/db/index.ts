import * as schema from "./schema/index"
import { drizzle } from "drizzle-orm/neon-serverless"
import { neonConfig } from "@neondatabase/serverless"
import ws from "ws"

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

// Set WebSocket constructor for Neon serverless driver
// This is required for the ws package to be used instead of native WebSocket
neonConfig.webSocketConstructor = ws as any

// Use Neon serverless driver with WebSocket support
// This handles Neon's compute suspension gracefully (unlike raw pg Pool)
export const db = drizzle({
  connection: databaseUrl,
  schema,
})

export type db = typeof db

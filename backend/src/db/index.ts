import * as schema from "./schema/index"
import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
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

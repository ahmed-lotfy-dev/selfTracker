
import { db } from "../src/db/index"
import { sql } from "drizzle-orm"

async function checkMigrations() {
  try {
    const result = await db.execute(sql`SELECT * FROM drizzle.drizzle_migrations ORDER BY created_at DESC`)
    console.log("Existing migrations:", result)
  } catch (e) {
    console.log("Error querying migrations (maybe table doesn't exist?):", e)
    // Try public schema just in case default config changed
    try {
      const result = await db.execute(sql`SELECT * FROM public.__drizzle_migrations ORDER BY created_at DESC`)
      console.log("Existing migrations (public):", result)
    } catch (e2) {
      // try default
      try {
        const result = await db.execute(sql`SELECT * FROM __drizzle_migrations ORDER BY created_at DESC`)
        console.log("Existing migrations (default):", result)
      } catch (e3) {
        console.log("Could not find migration table.")
      }
    }
  }
  process.exit(0)
}

checkMigrations()

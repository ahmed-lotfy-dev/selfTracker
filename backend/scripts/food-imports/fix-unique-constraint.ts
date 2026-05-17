import { db } from "../../src/db"
import { sql } from "drizzle-orm"

async function main() {
  console.log("[Migration] Adding unique constraint on (source, source_id)...")
  try {
    // Check if constraint exists
    const result = await db.execute(sql`
      SELECT 1 FROM pg_constraint WHERE conname = 'uq_foods_source_source_id'
    `)
    if (result.rows.length === 0) {
      await db.execute(sql`
        ALTER TABLE foods
          ADD CONSTRAINT uq_foods_source_source_id
          UNIQUE (source, source_id)
      `)
      console.log("[Migration] Unique constraint added successfully!")
    } else {
      console.log("[Migration] Constraint already exists, skipping.")
    }
  } catch (err: any) {
    console.error("[Migration] Error:", err.message)
  }
}

main()

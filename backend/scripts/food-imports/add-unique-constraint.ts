import { db } from "../../src/db"
import { sql } from "drizzle-orm"

async function main() {
  console.log("[Migration] Adding unique constraint on (source, source_id)...")

  try {
    // First handle NULL source_id values
    await db.execute(sql`
      UPDATE foods SET source_id = 'no-id-' || id::text
      WHERE source_id IS NULL
    `)
    console.log("[Migration] Fixed NULL source_id values")

    // Add unique constraint
    await db.execute(sql`
      ALTER TABLE foods
      ADD CONSTRAINT uq_foods_source_id
      UNIQUE (source, source_id)
    `)
    console.log("[Migration] Unique constraint added!")

    // Verify
    const check = await db.execute(sql`
      SELECT 1 FROM pg_constraint
      WHERE conname = 'uq_foods_source_id'
    `)
    if (check.rows.length > 0) {
      console.log("[Migration] Verified: constraint exists")
    } else {
      console.error("[Migration] WARNING: constraint not found!")
    }
  } catch (err: any) {
    if (err.message?.includes("already exists")) {
      console.log("[Migration] Constraint already exists, skipping")
    } else {
      console.error("[Migration] Error:", err.message)
    }
  }
}

main().catch(console.error)

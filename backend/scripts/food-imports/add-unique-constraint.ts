import { db } from "../../src/db"
import { sql } from "drizzle-orm"

async function main() {
  console.log("[Migration] Fixing duplicates and adding unique constraint...")

  // Step 1: Delete duplicates using ctid (PostgreSQL internal row ID)
  const deleted = await db.execute(sql`
    DELETE FROM foods a
    USING foods b
    WHERE a.id > b.id
      AND a.source = b.source
      AND a.source_id = b.source_id
  `)
  console.log(`[Migration] Deleted ${deleted.rowCount} duplicate rows`)

  // Step 2: Handle NULL source_id
  await db.execute(sql`
    UPDATE foods SET source_id = 'no-id-' || id::text
    WHERE source_id IS NULL
  `)
  console.log("[Migration] Fixed NULL source_id values")

  // Step 3: Add unique constraint
  try {
    await db.execute(sql`
      ALTER TABLE foods
      ADD CONSTRAINT uq_foods_source_id
      UNIQUE (source, source_id)
    `)
    console.log("[Migration] Unique constraint added!")
  } catch (err: any) {
    if (err.message?.includes("already exists")) {
      console.log("[Migration] Constraint already exists")
    } else {
      console.error("[Migration] Error:", err.message)
    }
  }

  const stats = await db.execute(sql`SELECT count(*) as total FROM foods`)
  console.log(`[Migration] Total foods: ${stats.rows[0].total}`)
}

main().catch(console.error)

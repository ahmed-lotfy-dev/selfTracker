import { db } from "../../src/db"
import { sql } from "drizzle-orm"

async function main() {
  console.log("[Migration] Fixing duplicates and adding unique constraint...")

  // Step 1: Check for duplicates
  const dupes = await db.execute(sql`
    SELECT source, source_id, COUNT(*) as cnt
    FROM foods
    GROUP BY source, source_id
    HAVING COUNT(*) > 1
    LIMIT 10
  `)
  console.log(`[Migration] Found ${dupes.rows.length} duplicate groups`)

  // Step 2: Delete duplicates (keep the one with lowest id)
  const deleted = await db.execute(sql`
    DELETE FROM foods
    WHERE id NOT IN (
      SELECT MIN(id)
      FROM foods
      GROUP BY source, source_id
    )
  `)
  console.log(`[Migration] Deleted ${deleted.rowCount} duplicate rows`)

  // Step 3: Handle NULL source_id
  await db.execute(sql`
    UPDATE foods SET source_id = 'no-id-' || id::text
    WHERE source_id IS NULL
  `)
  console.log("[Migration] Fixed NULL source_id values")

  // Step 4: Add unique constraint
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
      console.error("[Migration] Error adding constraint:", err.message)
    }
  }

  // Step 5: Verify
  const stats = await db.execute(sql`SELECT count(*) as total FROM foods`)
  console.log(`[Migration] Total foods in DB: ${stats.rows[0].total}`)
}

main().catch(console.error)

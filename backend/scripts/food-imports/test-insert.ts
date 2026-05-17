import { db } from "../../src/db"
import { sql } from "drizzle-orm"

async function main() {
  console.log("[Test] Trying simple insert...")

  try {
    await db.execute(sql`
      INSERT INTO foods (name_en, source, source_id, calories, protein, carbs, fat)
      VALUES ('Test Food', 'usda_foundation', 'test-001', 100, 10, 20, 5)
    `)
    console.log("[Test] Success!")
  } catch (err: any) {
    console.error("[Test] Full error message:")
    console.error(err.message || err)
    console.error("---")
    console.error("Cause:", err.cause?.message || err.cause)
  }
}

main().catch(console.error)

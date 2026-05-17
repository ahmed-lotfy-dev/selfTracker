import { db } from "../../src/db"
import { sql } from "drizzle-orm"

async function main() {
  console.log("[Truncate] Cleaning all food data...")
  await db.execute(sql`TRUNCATE foods, branded_foods RESTART IDENTITY CASCADE`)
  console.log("[Truncate] Done! All food data cleared.")

  const foodCount = await db.execute(sql`SELECT count(*) FROM foods`)
  const brandedCount = await db.execute(sql`SELECT count(*) FROM branded_foods`)
  console.log(`Foods: ${foodCount.rows[0].count}, Branded: ${brandedCount.rows[0].count}`)
}

main().catch(console.error)

import { db } from "../src/db/index"
import { livestoreEvents } from "../src/db/schema"
import { sql } from "drizzle-orm"

async function check() {
  const result = await db.select({
    count: sql<number>`count(*)`,
    storeIds: sql<string[]>`array_agg(distinct store_id)`
  }).from(livestoreEvents)

  console.log("📊 LiveStore Events DB Check:")
  console.log(`- Total events: ${result[0].count}`)
  console.log(`- Distinct storeIds: ${result[0].storeIds.join(", ")}`)

  const sample = await db.select().from(livestoreEvents).limit(1)
  if (sample.length > 0) {
    console.log("- Sample Event Data:", JSON.stringify(sample[0].eventData).substring(0, 200))
  }
}

check()

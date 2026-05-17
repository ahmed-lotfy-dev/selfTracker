import { db } from "../../src/db"
import { foods } from "../../src/db/schema"

async function main() {
  console.log("[Test] Trying simple insert...")

  try {
    await db.insert(foods).values({
      nameEn: "Test Food",
      source: "usda_foundation",
      sourceId: "test-123",
      calories: 100,
      protein: 10,
      carbs: 20,
      fat: 5,
    }).onConflictDoNothing({
      target: [foods.source, foods.sourceId],
    })
    console.log("[Test] Success!")
  } catch (err: any) {
    console.error("[Test] Full error:")
    console.error(JSON.stringify(err, null, 2))
  }
}

main().catch(e => console.error("Unhandled:", e))

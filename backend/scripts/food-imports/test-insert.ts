import { db } from "../../src/db"
import { foods } from "../../src/db/schema"

async function main() {
  console.log("[Test] Trying simple insert...")

  try {
    const result = await db.insert(foods).values({
      nameEn: "Test Food",
      source: "usda_foundation",
      sourceId: "test-123",
      calories: 100,
      protein: 10,
      carbs: 20,
      fat: 5,
    }).onConflictDoNothing({
      target: [foods.source, foods.sourceId],
    }).returning()

    console.log("[Test] Success:", result)
  } catch (err: any) {
    console.error("[Test] Error:", err.message)
  }
}

main().catch(console.error)

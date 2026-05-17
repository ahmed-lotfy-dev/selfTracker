import { db } from "../../src/db"
import { sql } from "drizzle-orm"

async function main() {
  console.log("[Test] Trying full column insert...")

  try {
    await db.execute(sql`
      INSERT INTO foods (
        name_en, category, source, source_id, serving_size, serving_unit,
        calories, protein, carbs, fat, fiber, sugar, sodium, saturated_fat, cholesterol, potassium,
        calcium_100g, iron_100g, magnesium_100g, phosphorus_100g, zinc_100g, copper_100g,
        manganese_100g, selenium_100g, vitamin_a_100g, vitamin_d_100g, vitamin_e_100g,
        vitamin_c_100g, vitamin_b1_100g, vitamin_b2_100g, vitamin_b6_100g, vitamin_b9_100g,
        vitamin_b12_100g, trans_fat_100g, added_sugars_100g, starch_100g, publication_date
      ) VALUES (
        'Test Food', 'cat1', 'usda_foundation', 'test-full-001', 100, 'g',
        100, 10, 20, 5, 2, 1, 50, 1, 10, 200,
        10, 1, 10, 50, 1, 0.1,
        0.1, 5, 1, 0.1, 0.5,
        10, 0.1, 0.1, 0.1, 0.5, 0.01,
        0.1, 0.5, 0.1, '2024-01-01'
      )
    `)
    console.log("[Test] Full insert Success!")
  } catch (err: any) {
    console.error("[Test] Full insert ERROR:")
    console.error(err.message || err)
  }
}

main().catch(console.error)

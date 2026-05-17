/**
 * USDA Branded Foods Import Script
 * Imports ~2M branded food products
 *
 * Usage:
 *   docker exec selftracker-backend bun run scripts/food-imports/import-branded.ts --limit 100
 *   docker exec selftracker-backend bun run scripts/food-imports/import-branded.ts
 */

import { db } from "../../src/db"
import { sql } from "drizzle-orm"
import { createReadStream, existsSync } from "fs"
import { parse } from "csv-parse"

const DATA_DIR = "/tmp/food-imports"
const BATCH_SIZE = 1000

// USDA nutrient_id -> our column name (only the ones we store in branded_foods)
const NUTRIENT_MAP: Record<string, string> = {
  "1003": "protein",
  "1004": "fat",
  "1005": "carbs",
  "1008": "calories",
  "1079": "fiber",
  "1093": "sodium",
  "1092": "potassium",
  "1258": "saturated_fat",
  "1162": "cholesterol",
  "2000": "sugar",
}

function parseArg(name: string, fallback: string): string {
  const idx = process.argv.indexOf(name)
  return idx !== -1 && process.argv[idx + 1] ? process.argv[idx + 1] : fallback
}

async function loadCSV(filePath: string): Promise<any[]> {
  if (!existsSync(filePath)) {
    console.error(`File not found: ${filePath}`)
    return []
  }
  const records: any[] = []
  const parser = parse({ columns: true, skip_empty_lines: true })
  return new Promise((resolve, reject) => {
    parser.on("readable", () => {
      let record
      while ((record = parser.read()) !== null) {
        records.push(record)
      }
    })
    parser.on("error", reject)
    parser.on("end", () => resolve(records))
    createReadStream(filePath).pipe(parser)
  })
}

async function main() {
  const limit = parseInt(parseArg("--limit", "0"))

  const brandedFoodFile = `${DATA_DIR}/usda_branded/FoodData_Central_branded_food_csv_2026-04-30/branded_food.csv`
  const nutrientFile = `${DATA_DIR}/usda_branded/FoodData_Central_branded_food_csv_2026-04-30/food_nutrient.csv`

  console.log("========================================")
  console.log("  USDA Branded Foods Import")
  console.log("========================================")

  // Load branded foods
  console.log("[Branded] Loading branded_food.csv...")
  const foodRecords = await loadCSV(brandedFoodFile)
  console.log(`[Branded] Loaded ${foodRecords.length} branded foods`)

  // Load nutrients
  console.log("[Branded] Loading food_nutrient.csv...")
  const nutrientRecords = await loadCSV(nutrientFile)
  console.log(`[Branded] Loaded ${nutrientRecords.length} nutrient rows`)

  // Build nutrient map: fdc_id -> { column: value }
  console.log("[Branded] Building nutrient map...")
  const nutrientMap = new Map<string, Record<string, number>>()
  for (const n of nutrientRecords) {
    const fdcId = n.fdc_id
    const nutrientId = n.nutrient_id
    const amount = parseFloat(n.amount)
    const colName = NUTRIENT_MAP[nutrientId]
    if (colName && !isNaN(amount)) {
      if (!nutrientMap.has(fdcId)) nutrientMap.set(fdcId, {})
      nutrientMap.get(fdcId)![colName] = amount
    }
  }
  console.log(`[Branded] Nutrients mapped for ${nutrientMap.size} foods`)

  // Import in batches using raw SQL for speed
  let imported = 0
  let errors = 0
  const maxRecords = limit > 0 ? Math.min(limit, foodRecords.length) : foodRecords.length

  for (let i = 0; i < maxRecords; i += BATCH_SIZE) {
    const batch = foodRecords.slice(i, i + BATCH_SIZE)

    for (const food of batch) {
      const n = nutrientMap.get(food.fdc_id) || {}
      try {
        await db.execute(sql`
          INSERT INTO branded_foods (
            fdc_id, name_en, brand_owner, brand_name, subbrand_name,
            gtin_upc, short_description, branded_food_category, data_source,
            market_country, serving_size, serving_size_unit, household_serving,
            package_weight, ingredients_text, calories, protein, carbs, fat,
            fiber, sugar, sodium, saturated_fat, cholesterol, potassium,
            modified_date, available_date, discontinued_date,
            preparation_state_code, trade_channel, material_code
          ) VALUES (
            ${food.fdc_id},
            ${food.description?.slice(0, 500) || "Unknown"},
            ${food.brand_owner || null},
            ${food.brand_name || null},
            ${food.subbrand_name || null},
            ${food.gtin_upc || null},
            ${food.short_description || null},
            ${food.branded_food_category || null},
            ${food.data_source || null},
            ${food.market_country || null},
            ${parseFloat(food.serving_size) || null},
            ${food.serving_size_unit || null},
            ${food.household_serving_fulltext || null},
            ${food.package_weight || null},
            ${food.ingredients || null},
            ${n.calories || 0},
            ${n.protein || 0},
            ${n.carbs || 0},
            ${n.fat || 0},
            ${n.fiber || 0},
            ${n.sugar || 0},
            ${n.sodium || 0},
            ${n.saturated_fat || 0},
            ${n.cholesterol || 0},
            ${n.potassium || 0},
            ${food.modified_date || null},
            ${food.available_date || null},
            ${food.discontinued_date || null},
            ${food.preparation_state_code || null},
            ${food.trade_channel || null},
            ${food.material_code || null}
          )
          ON CONFLICT (fdc_id) DO NOTHING
        `)
        imported++
      } catch (err: any) {
        errors++
        if (errors <= 5) {
          console.error(`[Branded] Error: ${err.message?.slice(0, 100)}`)
        }
      }
    }

    if (imported % 10000 === 0) {
      console.log(`[Branded] Progress: ${imported} imported, ${errors} errors`)
    }
  }

  console.log(`\n[Branded] Complete! Imported: ${imported}, Errors: ${errors}`)

  const stats = await db.execute(sql`SELECT count(*) as total FROM branded_foods`)
  console.log(`Total branded foods in DB: ${stats.rows[0].total}`)
}

main().catch(console.error)

/**
 * USDA FoodData Central Import Script
 * Imports Foundation Foods + SR Legacy foods
 * Maps CSV data to our foods table schema
 *
 * Usage:
 *   docker exec selftracker-backend bun run scripts/food-imports/import-usda.ts --limit 10
 *   docker exec selftracker-backend bun run scripts/food-imports/import-usda.ts
 */

import { db } from "../../src/db"
import { foods } from "../../src/db/schema"
import { sql } from "drizzle-orm"
import { createReadStream, existsSync } from "fs"
import { parse } from "csv-parse"

const DATA_DIR = "/tmp/food-imports"
const BATCH_SIZE = 500

// USDA nutrient_id -> our table column name
const NUTRIENT_MAP: Record<string, string> = {
  "1003": "protein",
  "1004": "fat",
  "1005": "carbs",
  "1008": "calories",
  "1079": "fiber",
  "1089": "iron_100g",
  "1090": "magnesium_100g",
  "1091": "phosphorus_100g",
  "1092": "potassium",
  "1093": "sodium",
  "1095": "zinc_100g",
  "1098": "copper_100g",
  "1101": "manganese_100g",
  "1106": "vitamin_a_100g",
  "1109": "vitamin_e_100g",
  "1112": "vitamin_d_100g",
  "1114": "vitamin_c_100g",
  "1120": "vitamin_b1_100g",
  "1122": "vitamin_b2_100g",
  "1124": "pantothenic_acid_100g",
  "1125": "vitamin_b6_100g",
  "1126": "vitamin_b9_100g",
  "1128": "vitamin_b12_100g",
  "1162": "cholesterol",
  "1253": "cholesterol",
  "1257": "trans_fat_100g",
  "1258": "saturated_fat",
  "1292": "fiber",
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

async function importUSDA(source: string, foodFile: string, nutrientFile: string, limit: number) {
  console.log(`[USDA] Importing ${source}...`)

  // Load foods
  const foodRecords = await loadCSV(foodFile)
  console.log(`[USDA] Loaded ${foodRecords.length} foods`)

  // Load nutrients
  const nutrientRecords = await loadCSV(nutrientFile)
  console.log(`[USDA] Loaded ${nutrientRecords.length} nutrient rows`)

  // Build nutrient map: fdc_id -> { column: value }
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
  console.log(`[USDA] Nutrients mapped for ${nutrientMap.size} foods`)

  // Import in batches
  let imported = 0
  let errors = 0
  const maxRecords = limit > 0 ? Math.min(limit, foodRecords.length) : foodRecords.length

  for (let i = 0; i < maxRecords; i += BATCH_SIZE) {
    const batch = foodRecords.slice(i, i + BATCH_SIZE)
    const values = batch.map(food => {
      const n = nutrientMap.get(food.fdc_id) || {}
      return {
        nameEn: (food.description || "Unknown").slice(0, 500),
        nameAr: null as string | null,
        brand: null as string | null,
        brandOwner: null as string | null,
        category: food.food_category_id || null,
        source: source as "usda_foundation" | "usda_sr_legacy",
        sourceId: food.fdc_id,
        barcode: null as string | null,
        servingSize: 100,
        servingUnit: "g",
        calories: n.calories || 0,
        protein: n.protein || 0,
        carbs: n.carbs || 0,
        fat: n.fat || 0,
        fiber: n.fiber || 0,
        sugar: n.sugar || 0,
        sodium: n.sodium || 0,
        saturatedFat: n.saturated_fat || 0,
        cholesterol: n.cholesterol || 0,
        potassium: n.potassium || 0,
        calcium: n.calcium_100g || null as number | null,
        phosphorus: n.phosphorus_100g || null as number | null,
        iron: n.iron_100g || null as number | null,
        magnesium: n.magnesium_100g || null as number | null,
        zinc: n.zinc_100g || null as number | null,
        copper: n.copper_100g || null as number | null,
        manganese: n.manganese_100g || null as number | null,
        selenium: n.selenium_100g || null as number | null,
        iodine: n.iodine_100g || null as number | null,
        vitaminA: n.vitamin_a_100g || null as number | null,
        vitaminD: n.vitamin_d_100g || null as number | null,
        vitaminE: n.vitamin_e_100g || null as number | null,
        vitaminK: n.vitamin_k_100g || null as number | null,
        vitaminC: n.vitamin_c_100g || null as number | null,
        vitaminB1: n.vitamin_b1_100g || null as number | null,
        vitaminB2: n.vitamin_b2_100g || null as number | null,
        vitaminB6: n.vitamin_b6_100g || null as number | null,
        vitaminB9: n.vitamin_b9_100g || null as number | null,
        vitaminB12: n.vitamin_b12_100g || null as number | null,
        pantothenicAcid: n.pantothenic_acid_100g || null as number | null,
        biotin: n.biotin_100g || null as number | null,
        choline: n.choline_100g || null as number | null,
        transFat: n.trans_fat_100g || null as number | null,
        addedSugars: n.added_sugars_100g || null as number | null,
        starch: n.starch_100g || null as number | null,
        polyols: n.polyols_100g || null as number | null,
        solubleFiber: n.soluble_fiber_100g || null as number | null,
        insolubleFiber: n.insoluble_fiber_100g || null as number | null,
        salt: n.salt_100g || null as number | null,
        alcohol: n.alcohol_100g || null as number | null,
        caffeine: n.caffeine_100g || null as number | null,
        chloride: n.chloride_100g || null as number | null,
        publicationDate: food.publication_date || null,
      }
    })

    try {
      await db.insert(foods).values(values).onConflictDoNothing({
        target: [foods.source, foods.sourceId],
      })
      imported += batch.length
    } catch (err: any) {
      errors += batch.length
      console.error(`[USDA] Batch error: ${err.message?.slice(0, 200)}`)
    }

    if (imported % 5000 === 0) {
      console.log(`[USDA] Progress: ${imported} imported, ${errors} errors`)
    }
  }

  console.log(`\n[USDA] ${source} Complete! Imported: ${imported}, Errors: ${errors}`)
}

async function main() {
  const limit = parseInt(parseArg("--limit", "0"))

  console.log("========================================")
  console.log("  USDA FoodData Central Import")
  console.log("========================================")

  await importUSDA(
    "usda_foundation",
    `${DATA_DIR}/usda_foundation/FoodData_Central_foundation_food_csv_2026-04-30/food.csv`,
    `${DATA_DIR}/usda_foundation/FoodData_Central_foundation_food_csv_2026-04-30/food_nutrient.csv`,
    limit
  )

  await importUSDA(
    "usda_sr_legacy",
    `${DATA_DIR}/usda_sr_legacy/FoodData_Central_sr_legacy_food_csv_2018-04/food.csv`,
    `${DATA_DIR}/usda_sr_legacy/FoodData_Central_sr_legacy_food_csv_2018-04/food_nutrient.csv`,
    limit
  )

  const stats = await db.select({ count: sql<number>`count(*)` }).from(foods)
  console.log(`\nTotal foods in DB: ${stats[0].count}`)
}

main().catch(console.error)

/**
 * USDA Branded Foods Import Script - Bulk Insert
 * Imports ~2M branded food products in batches
 *
 * Usage:
 *   docker exec selftracker-backend bun run scripts/food-imports/import-branded.ts --limit 1000
 *   docker exec selftracker-backend bun run scripts/food-imports/import-branded.ts
 */

import { db } from "../../src/db"
import { sql } from "drizzle-orm"
import { createReadStream, existsSync } from "fs"
import { parse } from "csv-parse"

const DATA_DIR = "/tmp/food-imports"
const BATCH_SIZE = 2000

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
  if (!existsSync(filePath)) { console.error(`Not found: ${filePath}`); return [] }
  const records: any[] = []
  const parser = parse({ columns: true, skip_empty_lines: true })
  return new Promise((resolve, reject) => {
    parser.on("readable", () => { let r; while ((r = parser.read()) !== null) records.push(r) })
    parser.on("error", reject)
    parser.on("end", () => resolve(records))
    createReadStream(filePath).pipe(parser)
  })
}

async function main() {
  const limit = parseInt(parseArg("--limit", "0"))
  const brandedFoodFile = `${DATA_DIR}/usda_branded/FoodData_Central_branded_food_csv_2026-04-30/branded_food.csv`
  const nutrientFile = `${DATA_DIR}/usda_branded/FoodData_Central_branded_food_csv_2026-04-30/food_nutrient.csv`

  console.log("=== USDA Branded Foods Import (Bulk) ===")

  const foodRecords = await loadCSV(brandedFoodFile)
  console.log(`Loaded ${foodRecords.length} branded foods`)

  const nutrientRecords = await loadCSV(nutrientFile)
  console.log(`Loaded ${nutrientRecords.length} nutrient rows`)

  const nutrientMap = new Map<string, Record<string, number>>()
  for (const n of nutrientRecords) {
    const colName = NUTRIENT_MAP[n.nutrient_id]
    const amount = parseFloat(n.amount)
    if (colName && !isNaN(amount)) {
      if (!nutrientMap.has(n.fdc_id)) nutrientMap.set(n.fdc_id, {})
      nutrientMap.get(n.fdc_id)![colName] = amount
    }
  }
  console.log(`Nutrients mapped for ${nutrientMap.size} foods`)

  let imported = 0
  let errors = 0
  const max = limit > 0 ? Math.min(limit, foodRecords.length) : foodRecords.length

  for (let i = 0; i < max; i += BATCH_SIZE) {
    const batch = foodRecords.slice(i, i + BATCH_SIZE)

    // Build bulk INSERT with UNNEST for speed
    const fdcIds: string[] = []
    const names: string[] = []
    const brandOwners: (string|null)[] = []
    const brandNames: (string|null)[] = []
    const gtins: (string|null)[] = []
    const categories: (string|null)[] = []
    const servings: (number|null)[] = []
    const servingUnits: (string|null)[] = []
    const ingredients: (string|null)[] = []
    const caloriesArr: number[] = []
    const proteinArr: number[] = []
    const carbsArr: number[] = []
    const fatArr: number[] = []
    const fiberArr: number[] = []
    const sugarArr: number[] = []
    const sodiumArr: number[] = []
    const satFatArr: number[] = []
    const cholArr: number[] = []
    const potArr: number[] = []

    for (const food of batch) {
      const n = nutrientMap.get(food.fdc_id) || {}
      fdcIds.push(food.fdc_id)
      names.push((food.description || "Unknown").slice(0, 500))
      brandOwners.push(food.brand_owner || null)
      brandNames.push(food.brand_name || null)
      gtins.push(food.gtin_upc || null)
      categories.push(food.branded_food_category || null)
      servings.push(parseFloat(food.serving_size) || null)
      servingUnits.push(food.serving_size_unit || null)
      ingredients.push(food.ingredients || null)
      caloriesArr.push(n.calories || 0)
      proteinArr.push(n.protein || 0)
      carbsArr.push(n.carbs || 0)
      fatArr.push(n.fat || 0)
      fiberArr.push(n.fiber || 0)
      sugarArr.push(n.sugar || 0)
      sodiumArr.push(n.sodium || 0)
      satFatArr.push(n.saturated_fat || 0)
      cholArr.push(n.cholesterol || 0)
      potArr.push(n.potassium || 0)
    }

    try {
      await db.execute(sql`
        INSERT INTO branded_foods (
          fdc_id, name_en, brand_owner, brand_name, gtin_upc,
          branded_food_category, serving_size, serving_size_unit,
          ingredients_text, calories, protein, carbs, fat,
          fiber, sugar, sodium, saturated_fat, cholesterol, potassium
        )
        SELECT * FROM UNNEST(
          ${fdcIds}::text[],
          ${names}::text[],
          ${brandOwners}::text[],
          ${brandNames}::text[],
          ${gtins}::text[],
          ${categories}::text[],
          ${servings}::real[],
          ${servingUnits}::text[],
          ${ingredients}::text[],
          ${caloriesArr}::real[],
          ${proteinArr}::real[],
          ${carbsArr}::real[],
          ${fatArr}::real[],
          ${fiberArr}::real[],
          ${sugarArr}::real[],
          ${sodiumArr}::real[],
          ${satFatArr}::real[],
          ${cholArr}::real[],
          ${potArr}::real[]
        ) AS t(
          fdc_id, name_en, brand_owner, brand_name, gtin_upc,
          branded_food_category, serving_size, serving_size_unit,
          ingredients_text, calories, protein, carbs, fat,
          fiber, sugar, sodium, saturated_fat, cholesterol, potassium
        )
        ON CONFLICT (fdc_id) DO NOTHING
      `)
      imported += batch.length
    } catch (err: any) {
      errors += batch.length
      if (errors <= 3) console.error(`Batch error: ${err.message?.slice(0, 150)}`)
    }

    if (imported % 20000 === 0) console.log(`Progress: ${imported} imported`)
  }

  console.log(`\nComplete! Imported: ${imported}, Errors: ${errors}`)
  const stats = await db.execute(sql`SELECT count(*) as total FROM branded_foods`)
  console.log(`Total branded foods: ${stats.rows[0].total}`)
}

main().catch(console.error)

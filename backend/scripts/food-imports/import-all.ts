/**
 * Master Food Database Import Script
 * Uses PostgreSQL COPY command for fast CSV import
 * Falls back to individual inserts for small batches
 */

import { db } from "../../src/db"
import { sql } from "drizzle-orm"
import { createReadStream, existsSync, writeFileSync, unlinkSync } from "fs"
import { parse } from "csv-parse"

const DATA_DIR = "/tmp/food-imports"

const USDA_NUTRIENT_MAP: Record<string, string> = {
  "1003": "protein", "1004": "fat", "1005": "carbs", "1008": "calories",
  "1079": "fiber", "1089": "iron_100g", "1090": "magnesium_100g",
  "1091": "phosphorus_100g", "1092": "potassium", "1093": "sodium",
  "1095": "zinc_100g", "1098": "copper_100g", "1101": "manganese_100g",
  "1106": "vitamin_a_100g", "1109": "vitamin_e_100g", "1112": "vitamin_d_100g",
  "1114": "vitamin_c_100g", "1120": "vitamin_b1_100g", "1122": "vitamin_b2_100g",
  "1124": "pantothenic_acid_100g", "1125": "vitamin_b6_100g",
  "1126": "vitamin_b9_100g", "1128": "vitamin_b12_100g",
  "1162": "cholesterol", "1253": "cholesterol",
  "1257": "trans_fat_100g", "1258": "saturated_fat", "1292": "fiber", "2000": "sugar",
}

const BRANDED_NUTRIENT_MAP: Record<string, string> = {
  "1003": "protein", "1004": "fat", "1005": "carbs", "1008": "calories",
  "1079": "fiber", "1093": "sodium", "1092": "potassium",
  "1258": "saturated_fat", "1162": "cholesterol", "2000": "sugar",
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

async function importUSDA(source: string, foodFile: string, nutrientFile: string, limit: number) {
  console.log(`\n[${source}] Starting...`)
  const foods = await loadCSV(foodFile)
  const nutrients = await loadCSV(nutrientFile)
  console.log(`[${source}] ${foods.length} foods, ${nutrients.length} nutrients`)

  const nMap = new Map<string, Record<string, number>>()
  for (const n of nutrients) {
    const col = USDA_NUTRIENT_MAP[n.nutrient_id]
    const amt = parseFloat(n.amount)
    if (col && !isNaN(amt)) {
      if (!nMap.has(n.fdc_id)) nMap.set(n.fdc_id, {})
      nMap.get(n.fdc_id)![col] = amt
    }
  }

  // Create a temporary CSV file for COPY
  const tmpFile = `/tmp/${source}_import.csv`
  const lines: string[] = []
  const max = limit > 0 ? Math.min(limit, foods.length) : foods.length

  for (let i = 0; i < max; i++) {
    const f = foods[i]
    const n = nMap.get(f.fdc_id) || {}
    const vals = [
      (f.description || "Unknown").replace(/\t/g, " ").slice(0, 500),  // name_en
      (f.food_category_id || "").replace(/\t/g, ""),                   // category
      source,                                                           // source
      f.fdc_id,                                                         // source_id
      "100",                                                            // serving_size
      "g",                                                              // serving_unit
      String(n.calories || 0),
      String(n.protein || 0),
      String(n.carbs || 0),
      String(n.fat || 0),
      String(n.fiber || 0),
      String(n.sugar || 0),
      String(n.sodium || 0),
      String(n.saturated_fat || 0),
      String(n.cholesterol || 0),
      String(n.potassium || 0),
      n.calcium_100g != null ? String(n.calcium_100g) : "\\N",
      n.iron_100g != null ? String(n.iron_100g) : "\\N",
      n.magnesium_100g != null ? String(n.magnesium_100g) : "\\N",
      n.phosphorus_100g != null ? String(n.phosphorus_100g) : "\\N",
      n.zinc_100g != null ? String(n.zinc_100g) : "\\N",
      n.copper_100g != null ? String(n.copper_100g) : "\\N",
      n.manganese_100g != null ? String(n.manganese_100g) : "\\N",
      n.selenium_100g != null ? String(n.selenium_100g) : "\\N",
      n.vitamin_a_100g != null ? String(n.vitamin_a_100g) : "\\N",
      n.vitamin_d_100g != null ? String(n.vitamin_d_100g) : "\\N",
      n.vitamin_e_100g != null ? String(n.vitamin_e_100g) : "\\N",
      n.vitamin_c_100g != null ? String(n.vitamin_c_100g) : "\\N",
      n.vitamin_b1_100g != null ? String(n.vitamin_b1_100g) : "\\N",
      n.vitamin_b2_100g != null ? String(n.vitamin_b2_100g) : "\\N",
      n.vitamin_b6_100g != null ? String(n.vitamin_b6_100g) : "\\N",
      n.vitamin_b9_100g != null ? String(n.vitamin_b9_100g) : "\\N",
      n.vitamin_b12_100g != null ? String(n.vitamin_b12_100g) : "\\N",
      n.trans_fat_100g != null ? String(n.trans_fat_100g) : "\\N",
      n.added_sugars_100g != null ? String(n.added_sugars_100g) : "\\N",
      n.starch_100g != null ? String(n.starch_100g) : "\\N",
      f.publication_date || "\\N",
    ]
    lines.push(vals.join("\t"))
  }

  writeFileSync(tmpFile, lines.join("\n"))

  try {
    // Use COPY to import the CSV
    await db.execute(sql.raw(`
      COPY foods (
        name_en, category, source, source_id, serving_size, serving_unit,
        calories, protein, carbs, fat, fiber, sugar, sodium, saturated_fat, cholesterol, potassium,
        calcium_100g, iron_100g, magnesium_100g, phosphorus_100g, zinc_100g, copper_100g,
        manganese_100g, selenium_100g, vitamin_a_100g, vitamin_d_100g, vitamin_e_100g,
        vitamin_c_100g, vitamin_b1_100g, vitamin_b2_100g, vitamin_b6_100g, vitamin_b9_100g,
        vitamin_b12_100g, trans_fat_100g, added_sugars_100g, starch_100g, publication_date
      ) FROM '${tmpFile}' WITH (FORMAT text, NULL '\\N')
    `))
    console.log(`[${source}] COPY imported ${max} rows`)
  } catch (err: any) {
    console.error(`[${source}] COPY ERROR: ${err.message?.slice(0, 300)}`)
  }

  // Clean up
  try { unlinkSync(tmpFile) } catch {}
}

async function importBranded(limit: number) {
  console.log("\n[usda_branded] Starting...")
  const foods = await loadCSV(`${DATA_DIR}/usda_branded/FoodData_Central_branded_food_csv_2026-04-30/branded_food.csv`)
  const nutrients = await loadCSV(`${DATA_DIR}/usda_branded/FoodData_Central_branded_food_csv_2026-04-30/food_nutrient.csv`)
  console.log(`[usda_branded] ${foods.length} foods, ${nutrients.length} nutrients`)

  const nMap = new Map<string, Record<string, number>>()
  for (const n of nutrients) {
    const col = BRANDED_NUTRIENT_MAP[n.nutrient_id]
    const amt = parseFloat(n.amount)
    if (col && !isNaN(amt)) {
      if (!nMap.has(n.fdc_id)) nMap.set(n.fdc_id, {})
      nMap.get(n.fdc_id)![col] = amt
    }
  }

  const tmpFile = `/tmp/usda_branded_import.csv`
  const lines: string[] = []
  const max = limit > 0 ? Math.min(limit, foods.length) : foods.length

  for (let i = 0; i < max; i++) {
    const f = foods[i]
    const n = nMap.get(f.fdc_id) || {}
    const vals = [
      f.fdc_id,
      (f.description || "Unknown").replace(/\t/g, " ").slice(0, 500),
      (f.brand_owner || "").replace(/\t/g, " "),
      (f.brand_name || "").replace(/\t/g, " "),
      (f.gtin_upc || "").replace(/\t/g, " "),
      (f.branded_food_category || "").replace(/\t/g, " "),
      parseFloat(f.serving_size) ? String(parseFloat(f.serving_size)) : "\\N",
      (f.serving_size_unit || "").replace(/\t/g, " "),
      (f.ingredients || "").replace(/\t/g, " ").slice(0, 1000),
      String(n.calories || 0),
      String(n.protein || 0),
      String(n.carbs || 0),
      String(n.fat || 0),
      String(n.fiber || 0),
      String(n.sugar || 0),
      String(n.sodium || 0),
      String(n.saturated_fat || 0),
      String(n.cholesterol || 0),
      String(n.potassium || 0),
    ]
    lines.push(vals.join("\t"))
  }

  writeFileSync(tmpFile, lines.join("\n"))

  try {
    await db.execute(sql.raw(`
      COPY branded_foods (
        fdc_id, name_en, brand_owner, brand_name, gtin_upc,
        branded_food_category, serving_size, serving_size_unit, ingredients_text,
        calories, protein, carbs, fat, fiber, sugar, sodium, saturated_fat, cholesterol, potassium
      ) FROM '${tmpFile}' WITH (FORMAT text, NULL '\\N')
    `))
    console.log(`[usda_branded] COPY imported ${max} rows`)
  } catch (err: any) {
    console.error(`[usda_branded] COPY ERROR: ${err.message?.slice(0, 300)}`)
  }

  try { unlinkSync(tmpFile) } catch {}
}

async function main() {
  const limit = parseInt(parseArg("--limit", "0"))

  console.log("========================================")
  console.log("  Master Food Database Import (COPY)")
  console.log("========================================")

  console.log("\n[1/4] Truncating existing data...")
  await db.execute(sql`TRUNCATE foods, branded_foods RESTART IDENTITY CASCADE`)
  console.log("[1/4] Done!")

  await importUSDA("usda_foundation",
    `${DATA_DIR}/usda_foundation/FoodData_Central_foundation_food_csv_2026-04-30/food.csv`,
    `${DATA_DIR}/usda_foundation/FoodData_Central_foundation_food_csv_2026-04-30/food_nutrient.csv`,
    limit)

  await importUSDA("usda_sr_legacy",
    `${DATA_DIR}/usda_sr_legacy/FoodData_Central_sr_legacy_food_csv_2018-04/food.csv`,
    `${DATA_DIR}/usda_sr_legacy/FoodData_Central_sr_legacy_food_csv_2018-04/food_nutrient.csv`,
    limit)

  await importBranded(limit)

  const foodCount = await db.execute(sql`SELECT count(*) FROM foods`)
  const brandedCount = await db.execute(sql`SELECT count(*) FROM branded_foods`)
  console.log("\n========================================")
  console.log("  Import Complete!")
  console.log(`  Foods: ${foodCount.rows[0].count}`)
  console.log(`  Branded: ${brandedCount.rows[0].count}`)
  console.log("========================================")
}

main().catch(console.error)

/**
 * Open Food Facts Import Script
 * 
 * Downloads the OFF CSV data dump and imports foods into Neon PostgreSQL.
 * Run on VPS to avoid using local internet quota.
 * 
 * Usage (on VPS):
 *   cd /path/to/backend
 *   bun run scripts/food-imports/import-openfoodfacts.ts [--limit 10000] [--offset 0]
 * 
 * The script:
 * 1. Downloads the CSV dump (if not already present)
 * 2. Parses rows and filters for foods with complete nutrition data
 * 3. Upserts into the foods table in batches
 * 4. Reports progress and stats
 */

import { createReadStream, existsSync, statSync, writeFileSync, mkdirSync } from "fs"
import { createGunzip } from "zlib"
import { parse } from "csv-parse"
import { pipeline } from "stream/promises"
import { Transform } from "stream"
import { db } from "../../src/db"
import { foods } from "../../src/db/schema"
import { eq, and } from "drizzle-orm"

const DATA_DIR = "/tmp/food-imports"
const OFF_CSV_URL = "https://static.openfoodfacts.org/data/en.openfoodfacts.org.products.csv.gz"
const OFF_CSV_FILE = `${DATA_DIR}/openfoodfacts.csv.gz`
const BATCH_SIZE = 500

interface OFFRow {
  code: string
  product_name: string
  brands: string
  categories: string
  countries: string
  image_url: string
  serving_size: string
  serving_quantity: string
  energy_kcal_100g: string
  proteins_100g: string
  carbohydrates_100g: string
  fat_100g: string
  fiber_100g: string
  sugars_100g: string
  sodium_100g: string
  saturated_fat_100g: string
  cholesterol_100g: string
  potassium_100g: string
  [key: string]: string
}

function parseArg(name: string, fallback: string): string {
  const idx = process.argv.indexOf(name)
  return idx !== -1 && process.argv[idx + 1] ? process.argv[idx + 1] : fallback
}

async function downloadFile(url: string, dest: string): Promise<void> {
  console.log(`[OFF] ========================================`)
  console.log(`[OFF] Starting download from: ${url}`)
  console.log(`[OFF] Destination: ${dest}`)
  console.log(`[OFF] This is a large file (~2-3GB). This will take a while on the VPS.`)
  console.log(`[OFF] ========================================`)

  const startTime = Date.now()
  const response = await fetch(url)
  if (!response.ok || !response.body) {
    throw new Error(`Failed to download: ${response.status} ${response.statusText}`)
  }

  const totalSize = parseInt(response.headers.get("content-length") || "0")
  console.log(`[OFF] Content-Length: ${(totalSize / 1024 / 1024).toFixed(0)}MB`)

  let downloaded = 0
  let lastReport = 0

  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
    downloaded += value.length

    if (totalSize && downloaded - lastReport > 50 * 1024 * 1024) {
      const pct = ((downloaded / totalSize) * 100).toFixed(1)
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(0)
      const speed = (downloaded / 1024 / 1024 / (Date.now() - startTime) * 1000).toFixed(1)
      console.log(`[OFF] Downloaded ${pct}% (${(downloaded / 1024 / 1024).toFixed(0)}MB / ${(totalSize / 1024 / 1024).toFixed(0)}MB) | ${elapsed}s elapsed | ${speed} MB/s`)
      lastReport = downloaded
    }
  }

  const allChunks = new Uint8Array(downloaded)
  let offset = 0
  for (const chunk of chunks) {
    allChunks.set(chunk, offset)
    offset += chunk.length
  }

  writeFileSync(dest, allChunks)
  const totalElapsed = ((Date.now() - startTime) / 1000).toFixed(0)
  console.log(`[OFF] Download complete: ${(downloaded / 1024 / 1024).toFixed(0)}MB in ${totalElapsed}s`)
}

function mapOFFRow(row: OFFRow) {
  const calories = parseFloat(row.energy_kcal_100g)
  if (isNaN(calories) || calories < 0) return null

  const productName = row.product_name?.trim()
  if (!productName || productName.length < 2) return null

  return {
    nameEn: productName.slice(0, 500),
    nameAr: null,
    brand: row.brands?.split(",")[0]?.trim().slice(0, 200) || null,
    category: row.categories?.split(",")[0]?.trim().slice(0, 200) || null,
    servingSize: parseFloat(row.serving_quantity) || 100,
    servingUnit: parseServingUnit(row.serving_size) || "g",
    calories,
    protein: parseFloat(row.proteins_100g) || 0,
    carbs: parseFloat(row.carbohydrates_100g) || 0,
    fat: parseFloat(row.fat_100g) || 0,
    fiber: parseFloat(row.fiber_100g) || null,
    sugar: parseFloat(row.sugars_100g) || null,
    sodium: parseFloat(row.sodium_100g) || null,
    saturatedFat: parseFloat(row.saturated_fat_100g) || null,
    cholesterol: parseFloat(row.cholesterol_100g) || null,
    potassium: parseFloat(row.potassium_100g) || null,
    source: "openfoodfacts" as const,
    sourceId: row.code?.trim() || null,
    barcode: row.code?.trim() || null,
    imageUrl: row.image_url?.trim() || null,
  }
}

function parseServingUnit(servingSize: string): string | null {
  if (!servingSize) return null
  const match = servingSize.match(/[a-zA-Z]+$/)
  return match ? match[0].toLowerCase() : null
}

async function importBatch(batch: ReturnType<typeof mapOFFRow>[], batchNum: number): Promise<number> {
  let inserted = 0
  let updated = 0
  let errors = 0
  const startTime = Date.now()

  for (const item of batch) {
    if (!item) continue
    try {
      const existing = item.sourceId
        ? await db.query.foods.findFirst({
            where: and(eq(foods.source, "openfoodfacts"), eq(foods.sourceId, item.sourceId)),
          })
        : null

      if (existing) {
        await db.update(foods).set({ ...item, updatedAt: new Date() }).where(eq(foods.id, existing.id))
        updated++
      } else {
        await db.insert(foods).values(item)
        inserted++
      }
    } catch (err: any) {
      errors++
      if (!err.message?.includes("duplicate")) {
        console.error(`[OFF] Error importing "${item.nameEn}": ${err.message}`)
      }
    }
  }

  const elapsed = Date.now() - startTime
  console.log(`[OFF] Batch #${batchNum}: +${inserted} inserted, ~${updated} updated, ${errors} errors in ${elapsed}ms`)
  return inserted + updated
}

async function main() {
  const limit = parseInt(parseArg("--limit", "0")) // 0 = no limit
  const offset = parseInt(parseArg("--offset", "0"))
  const skipDownload = process.argv.includes("--skip-download")

  console.log("========================================")
  console.log("  Open Food Facts Import")
  console.log("========================================")
  console.log(`Limit: ${limit || "unlimited"}, Offset: ${offset}`)
  console.log(`Skip download: ${skipDownload}`)
  console.log(`Batch size: ${BATCH_SIZE}`)
  console.log(`Data directory: ${DATA_DIR}`)
  console.log("========================================")

  // Ensure data directory
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true })
    console.log(`[OFF] Created data directory: ${DATA_DIR}`)
  }

  // Download if needed
  if (!skipDownload || !existsSync(OFF_CSV_FILE)) {
    await downloadFile(OFF_CSV_URL, OFF_CSV_FILE)
  } else {
    const size = statSync(OFF_CSV_FILE).size
    console.log(`[OFF] Using existing file: ${(size / 1024 / 1024).toFixed(0)}MB`)
  }

  // Count existing OFF foods
  const existingCount = await db.select().from(foods).where(eq(foods.source, "openfoodfacts"))
  console.log(`[OFF] Existing OFF foods in DB: ${existingCount.length}`)

  // Parse and import
  console.log("[OFF] Starting import stream...")

  const startTime = Date.now()
  let totalProcessed = 0
  let totalImported = 0
  let batch: ReturnType<typeof mapOFFRow>[] = []
  let isPastOffset = offset === 0
  let batchNum = 0
  let skippedNoCalories = 0
  let skippedNoName = 0

  const parser = parse({
    delimiter: "\t", // OFF uses tab-separated
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
  })

  const importTransform = new Transform({
    objectMode: true,
    transform(row: OFFRow, _encoding, callback) {
      totalProcessed++

      // Handle offset
      if (!isPastOffset) {
        if (totalProcessed > offset) {
          isPastOffset = true
        } else {
          callback()
          return
        }
      }

      // Handle limit
      if (limit > 0 && totalImported >= limit) {
        callback()
        return
      }

      const mapped = mapOFFRow(row)
      if (mapped) {
        batch.push(mapped)
      } else {
        if (!row.energy_kcal_100g || parseFloat(row.energy_kcal_100g) <= 0) {
          skippedNoCalories++
        } else {
          skippedNoName++
        }
      }

      if (batch.length >= BATCH_SIZE) {
        const currentBatch = batch
        batch = []
        batchNum++
        importBatch(currentBatch, batchNum)
          .then((count) => {
            totalImported += count
            if (totalImported % 5000 === 0) {
              const elapsed = ((Date.now() - startTime) / 1000).toFixed(0)
              const rate = (totalImported / ((Date.now() - startTime) / 1000)).toFixed(0)
              console.log(`[OFF] Progress: ${totalProcessed} processed, ${totalImported} imported | ${skippedNoCalories} skipped (no calories), ${skippedNoName} skipped (no name) | ${elapsed}s | ${rate} items/s`)
            }
            callback()
          })
          .catch((err) => {
            console.error("[OFF] Batch error:", err)
            callback()
          })
      } else {
        callback()
      }
    },
    flush(callback) {
      if (batch.length > 0) {
        batchNum++
        importBatch(batch, batchNum).then((count) => {
          totalImported += count
          callback()
        })
      } else {
        callback()
      }
    },
  })

  try {
    await pipeline(
      createReadStream(OFF_CSV_FILE),
      createGunzip(),
      parser,
      importTransform
    )
  } catch (err) {
    console.log("[OFF] Pipeline ended (may be due to --limit)")
  }

  const totalElapsed = ((Date.now() - startTime) / 1000).toFixed(0)
  const rate = totalElapsed !== "0" ? (totalImported / parseFloat(totalElapsed)).toFixed(0) : "0"

  console.log("\n========================================")
  console.log("  Import Complete!")
  console.log("========================================")
  console.log(`Total processed: ${totalProcessed}`)
  console.log(`Total imported: ${totalImported}`)
  console.log(`Skipped (no calories): ${skippedNoCalories}`)
  console.log(`Skipped (no name): ${skippedNoName}`)
  console.log(`Total time: ${totalElapsed}s`)
  console.log(`Average rate: ${rate} items/s`)
  console.log("========================================")

  // Final stats
  const finalCount = await db.select().from(foods).where(eq(foods.source, "openfoodfacts"))
  console.log(`Total OFF foods in DB: ${finalCount.length}`)
}

main().catch(console.error)

import { db } from "../db"
import { weightLogs, workoutLogs, foodLogs, habits, tasks, userGoals, workouts } from "../db/schema"
import { embeddings } from "../db/schema/embeddings"
import { eq, and } from "drizzle-orm"
import {
  templateWeightLog,
  templateWorkoutLog,
  templateFoodLog,
  templateHabit,
  templateTask,
  templateUserGoal,
  templateTrainingSplit,
} from "../services/embeddingHelper"
import { generateEmbeddingBatch } from "../services/embedding"

const RESOURCE_TYPES = [
  { type: "weight_log", table: weightLogs, template: templateWeightLog },
  { type: "workout_log", table: workoutLogs, template: templateWorkoutLog },
  { type: "food_log", table: foodLogs, template: templateFoodLog },
  { type: "habit", table: habits, template: templateHabit },
  { type: "task", table: tasks, template: templateTask },
  { type: "user_goal", table: userGoals, template: templateUserGoal },
  { type: "training_split", table: workouts, template: templateTrainingSplit },
]

async function backfillTable(
  resourceType: string,
  table: any,
  templateFn: (record: any) => string
) {
  // Get all records that don't have embeddings yet
  const existingEmbeddings = await db
    .select({ resourceId: embeddings.resourceId })
    .from(embeddings)
    .where(eq(embeddings.resourceType, resourceType))

  const existingIds = new Set(existingEmbeddings.map((e: any) => e.resourceId))

  // Get all records from the source table
  const records = await db.select().from(table)
  const newRecords = records.filter((r: any) => !existingIds.has(r.id) && r.userId)

  if (newRecords.length === 0) {
    console.log(`[Backfill] ${resourceType}: No new records to process`)
    return
  }

  console.log(`[Backfill] ${resourceType}: Processing ${newRecords.length} records...`)

  // Process in batches of 10
  const batchSize = 10
  let processed = 0

  for (let i = 0; i < newRecords.length; i += batchSize) {
    const batch = newRecords.slice(i, i + batchSize)
    const texts = batch.map((r: any) => templateFn(r))

    try {
      const embeddingVectors = await generateEmbeddingBatch(texts)

      // Insert embeddings
      const values = batch.map((record: any, idx: number) => ({
        userId: record.userId,
        resourceType,
        resourceId: record.id,
        content: texts[idx],
        embedding: embeddingVectors[idx],
      }))

      await db.insert(embeddings).values(values).onConflictDoNothing()
      processed += batch.length
      console.log(`[Backfill] ${resourceType}: ${processed}/${newRecords.length} done`)
    } catch (err: any) {
      console.error(`[Backfill] ${resourceType}: Batch failed: ${err.message}`)
      // Continue with next batch
    }
  }

  console.log(`[Backfill] ${resourceType}: Complete! ${processed} records processed`)
}

async function main() {
  console.log("=== AI Embeddings Backfill Script ===")
  console.log("Starting backfill...\n")

  for (const { type, table, template } of RESOURCE_TYPES) {
    try {
      await backfillTable(type, table, template)
    } catch (err: any) {
      console.error(`[Backfill] ${type}: Fatal error: ${err.message}`)
    }
  }

  console.log("\n=== Backfill Complete ===")
}

main().catch(console.error)

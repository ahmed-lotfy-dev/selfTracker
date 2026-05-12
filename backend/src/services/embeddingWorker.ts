import { db } from "../db"
import { weightLogs, workoutLogs, foodLogs, habits, tasks, userGoals, workouts } from "../db/schema"
import { embeddings } from "../db/schema/embeddings"
import { sql } from "drizzle-orm"
import {
  templateWeightLog,
  templateWorkoutLog,
  templateFoodLog,
  templateHabit,
  templateTask,
  templateUserGoal,
  templateTrainingSplit,
} from "./embeddingHelper"
import { generateEmbedding } from "./embedding"

const RESOURCE_TABLES = [
  { type: "weight_log", table: weightLogs, template: templateWeightLog, idColumn: "id", userIdColumn: "user_id" },
  { type: "workout_log", table: workoutLogs, template: templateWorkoutLog, idColumn: "id", userIdColumn: "user_id" },
  { type: "food_log", table: foodLogs, template: templateFoodLog, idColumn: "id", userIdColumn: "user_id" },
  { type: "habit", table: habits, template: templateHabit, idColumn: "id", userIdColumn: "user_id" },
  { type: "task", table: tasks, template: templateTask, idColumn: "id", userIdColumn: "user_id" },
  { type: "user_goal", table: userGoals, template: templateUserGoal, idColumn: "id", userIdColumn: "user_id" },
  { type: "training_split", table: workouts, template: templateTrainingSplit, idColumn: "id", userIdColumn: "user_id" },
]

function toCamelRecord(row: Record<string, any>) {
  const record: Record<string, any> = {}

  for (const [key, value] of Object.entries(row)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase())
    record[camelKey] = value
  }

  return record
}

let running = false
let intervalHandle: ReturnType<typeof setInterval> | null = null

async function processMissingEmbeddings() {
  if (running) return
  running = true

  try {
    for (const { type, table, template, idColumn, userIdColumn } of RESOURCE_TABLES) {
      try {
        const missing = await db.execute(sql`
          SELECT src.*
          FROM ${table} src
          LEFT JOIN ${embeddings} e
            ON e.resource_type = ${type}
            AND e.resource_id = src.${sql.raw(idColumn)}
          WHERE e.resource_id IS NULL
            AND src.${sql.raw(userIdColumn)} IS NOT NULL
          LIMIT 5
        `)

        const rows = missing.rows || []
        if (rows.length === 0) continue

        console.log(`[EmbeddingWorker] Processing ${rows.length} missing ${type} embeddings`)

        for (const row of rows) {
          const record = toCamelRecord(row as Record<string, any>)
          try {
            const content = template(record)
            const embedding = await generateEmbedding(content, "passage")
            await db.insert(embeddings).values({
              userId: record.userId,
              resourceType: type,
              resourceId: record.id,
              content,
              embedding,
            }).onConflictDoNothing()
          } catch (err: any) {
            console.error(`[EmbeddingWorker] Error creating ${type} embedding: ${err.message}`)
          }
        }
      } catch (err: any) {
        console.error(`[EmbeddingWorker] Error processing ${type}: ${err.message}`)
      }
    }
  } finally {
    running = false
  }
}

export function startEmbeddingWorker(intervalMs = 60_000) {
  if (intervalHandle) return
  console.log(`[EmbeddingWorker] Started (polling every ${intervalMs}ms)`)
  processMissingEmbeddings()
  intervalHandle = setInterval(processMissingEmbeddings, intervalMs)
}

export function stopEmbeddingWorker() {
  if (intervalHandle) {
    clearInterval(intervalHandle)
    intervalHandle = null
    console.log("[EmbeddingWorker] Stopped")
  }
}

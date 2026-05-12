import { db } from "../db"
import { weightLogs, workoutLogs, foodLogs, habits, tasks, userGoals, workouts } from "../db/schema"
import { embeddings } from "../db/schema/embeddings"
import { eq, sql } from "drizzle-orm"
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
  { type: "weight_log", table: weightLogs, template: templateWeightLog, idField: "id", userIdField: "userId" },
  { type: "workout_log", table: workoutLogs, template: templateWorkoutLog, idField: "id", userIdField: "userId" },
  { type: "food_log", table: foodLogs, template: templateFoodLog, idField: "id", userIdField: "userId" },
  { type: "habit", table: habits, template: templateHabit, idField: "id", userIdField: "userId" },
  { type: "task", table: tasks, template: templateTask, idField: "id", userIdField: "userId" },
  { type: "user_goal", table: userGoals, template: templateUserGoal, idField: "id", userIdField: "userId" },
  { type: "training_split", table: workouts, template: templateTrainingSplit, idField: "id", userIdField: "userId" },
]

let running = false
let intervalHandle: ReturnType<typeof setInterval> | null = null

async function processMissingEmbeddings() {
  if (running) return
  running = true

  try {
    for (const { type, table, template, idField, userIdField } of RESOURCE_TABLES) {
      try {
        const missing = await db.execute(sql`
          SELECT src.*
          FROM ${table} src
          LEFT JOIN ${embeddings} e
            ON e.resource_type = ${type}
            AND e.resource_id = src.${sql.raw(idField)}
          WHERE e.resource_id IS NULL
            AND src.${sql.raw(userIdField)} IS NOT NULL
          LIMIT 5
        `)

        const rows = missing.rows || []
        if (rows.length === 0) continue

        console.log(`[EmbeddingWorker] Processing ${rows.length} missing ${type} embeddings`)

        for (const row of rows) {
          const record = row as any
          try {
            const content = template(record)
            const embedding = await generateEmbedding(content, "passage")
            await db.insert(embeddings).values({
              userId: (record as any)[userIdField],
              resourceType: type,
              resourceId: (record as any)[idField],
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

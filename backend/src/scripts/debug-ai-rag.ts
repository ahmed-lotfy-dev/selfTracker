import "dotenv/config"
import { and, desc, eq, isNull, sql } from "drizzle-orm"
import { db } from "../db"
import { weightLogs, workoutLogs } from "../db/schema"
import { searchUserData } from "../services/vectorSearch"
import { normalizeQueryText, parseTimeIntent } from "../services/aiTimeIntent"

const DEFAULT_USER_ID = "eJnk22vEJ3zmj4YaiUnN4e44Iiba4Oe4"

const userId = process.argv[2] || DEFAULT_USER_ID
const query =
  process.argv.slice(3).join(" ") ||
  "Summarize my weight loss and workout consistency latest month"

async function main() {
  console.log("=== AI RAG Debug ===")
  console.log(`User: ${userId}`)
  console.log(`Query: ${query}`)
  console.log(`Normalized query: ${normalizeQueryText(query)}`)

  const timeIntent = parseTimeIntent(query)
  console.log(
    `Time intent: ${
      timeIntent
        ? `${timeIntent.label} start=${timeIntent.start.toISOString()} end=${timeIntent.end.toISOString()}`
        : "none"
    }`
  )

  const sourceFreshness = await db.execute(sql`
    SELECT 'weight_log' AS type,
           COUNT(*)::int AS count,
           MIN(created_at)::text AS oldest,
           MAX(created_at)::text AS latest
    FROM weight_logs
    WHERE user_id = ${userId} AND deleted_at IS NULL
    UNION ALL
    SELECT 'workout_log' AS type,
           COUNT(*)::int AS count,
           MIN(created_at)::text AS oldest,
           MAX(created_at)::text AS latest
    FROM workout_logs
    WHERE user_id = ${userId} AND deleted_at IS NULL
  `)

  console.log("\nSource table freshness:")
  console.table(sourceFreshness.rows)

  const embeddingCounts = await db.execute(sql`
    SELECT resource_type,
           COUNT(*)::int AS count,
           MIN(created_at)::text AS first_embedding_created,
           MAX(created_at)::text AS last_embedding_created
    FROM embeddings
    WHERE user_id = ${userId}
    GROUP BY resource_type
    ORDER BY resource_type
  `)

  console.log("\nEmbedding table counts:")
  console.table(embeddingCounts.rows)

  const recentWeights = await db
    .select({
      id: weightLogs.id,
      createdAt: weightLogs.createdAt,
      weight: weightLogs.weight,
      notes: weightLogs.notes,
    })
    .from(weightLogs)
    .where(and(eq(weightLogs.userId, userId), isNull(weightLogs.deletedAt)))
    .orderBy(desc(weightLogs.createdAt))
    .limit(10)

  console.log("\nRecent weights:")
  console.table(
    recentWeights.map((row) => ({
      ...row,
      createdAt: row.createdAt?.toISOString(),
    }))
  )

  const recentWorkouts = await db
    .select({
      id: workoutLogs.id,
      createdAt: workoutLogs.createdAt,
      workoutName: workoutLogs.workoutName,
      notes: workoutLogs.notes,
    })
    .from(workoutLogs)
    .where(and(eq(workoutLogs.userId, userId), isNull(workoutLogs.deletedAt)))
    .orderBy(desc(workoutLogs.createdAt))
    .limit(10)

  console.log("\nRecent workouts:")
  console.table(
    recentWorkouts.map((row) => ({
      ...row,
      createdAt: row.createdAt?.toISOString(),
    }))
  )

  console.log("\nRaw vector search:")
  const results = await searchUserData(userId, query, 10)
  for (const result of results) {
    console.log(
      `${result.similarity.toFixed(4)} ${result.resourceType} ${result.resourceId} ${result.content}`
    )
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

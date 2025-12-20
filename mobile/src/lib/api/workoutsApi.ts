import { WorkoutLogType } from "@/src/types/workoutLogType"
import { API_BASE_URL } from "./config"
import axiosInstance from "./axiosInstane"
import { db } from "@/src/db/client"
import { workoutLogs } from "@/src/db/schema"
import { desc, eq, isNull, sql } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"
import { addToSyncQueue } from "@/src/services/sync"

export const fetchAllWorkoutLogs = async (
  cursor: string | null,
  limit: number = 20
) => {
  let query = db
    .select()
    .from(workoutLogs)
    .where(isNull(workoutLogs.deletedAt))
    .orderBy(desc(workoutLogs.createdAt))
    .limit(limit + 1)

  if (cursor) {
    const cursorLog = await db.select().from(workoutLogs).where(eq(workoutLogs.id, cursor))
    if (cursorLog.length > 0) {
      query = db
        .select()
        .from(workoutLogs)
        .where(sql`${workoutLogs.deletedAt} IS NULL AND ${workoutLogs.createdAt} < ${cursorLog[0].createdAt}`)
        .orderBy(desc(workoutLogs.createdAt))
        .limit(limit + 1)
    }
  }

  const localLogs = await query
  const hasMore = localLogs.length > limit
  const logs = hasMore ? localLogs.slice(0, limit) : localLogs
  const nextCursor = hasMore ? logs[logs.length - 1]?.id : null

  return {
    logs,
    nextCursor,
  }
}

export async function fetchWorkoutLogsByMonth(year: number, month: number) {
  // Calendar expects an array of logs for the given month
  // Local implementation: Fetch all logs for the year-month

  // Construct date range for simple string comparison (since createdAt is ISO string)
  const paddedMonth = month.toString().padStart(2, '0')
  const startDate = `${year}-${paddedMonth}-01`
  // Simple "next month" logic
  const nextMonth = month === 12 ? 1 : month + 1
  const nextYear = month === 12 ? year + 1 : year
  const paddedNextMonth = nextMonth.toString().padStart(2, '0')
  const endDate = `${nextYear}-${paddedNextMonth}-01`

  /* 
     Fetch logs and group them by date string (YYYY-MM-DD) 
     Returns: { "2024-05-20": [log1, log2], "2024-05-21": [logA] }
  */
  const logs = await db
    .select()
    .from(workoutLogs)
    .where(
      sql`${workoutLogs.deletedAt} IS NULL 
      AND ${workoutLogs.createdAt} >= ${startDate} 
      AND ${workoutLogs.createdAt} < ${endDate}`
    )
    .orderBy(desc(workoutLogs.createdAt))

  const grouped: Record<string, typeof logs> = {}

  logs.forEach((log) => {
    // Assuming createdAt is ISO string, take YYYY-MM-DD
    const dateKey = new Date(log.createdAt).toISOString().split('T')[0]
    if (!grouped[dateKey]) {
      grouped[dateKey] = []
    }
    grouped[dateKey].push(log)
  })

  return grouped
}

// Local fallback for chart data if backend fails or for offline mode
// Local fallback for chart data if backend fails or for offline mode
export async function fetchWorkoutLogsChart(month: number) {
  // Safe approach: Get all logs for the last X months
  const now = new Date()
  const pastDate = new Date(now)
  pastDate.setMonth(now.getMonth() - month) // Dynamic months from props
  const sinceDateIso = pastDate.toISOString()

  const logs = await db
    .select()
    .from(workoutLogs)
    .where(
      sql`${workoutLogs.deletedAt} IS NULL AND ${workoutLogs.createdAt} >= ${sinceDateIso}`
    )
    .orderBy(desc(workoutLogs.createdAt))

  // Aggregate by Workout Name (Type) instead of Date
  // User wants "how many push and how many pulls"
  const typeMap = new Map<string, number>()

  logs.forEach(log => {
    // Normalize name: "Push Day" -> "Push Day", handle empty/null
    const name = log.workoutName ? log.workoutName.trim() : "Unknown"
    typeMap.set(name, (typeMap.get(name) || 0) + 1)
  })

  // Sort by count descending (most frequent first)
  const sortedEntries = Array.from(typeMap.entries()).sort((a, b) => b[1] - a[1]) // Descending count

  // Limit to top 6 to prevent overcrowding if there are many types
  const topEntries = sortedEntries.slice(0, 6)

  const labels = topEntries.map(e => e[0])
  const data = topEntries.map(e => e[1])

  return {
    labels,
    datasets: [
      {
        data,
      }
    ]
  }
}

export const fetchSingleWorkout = async (workoutId: string) => {
  const local = await db.select().from(workoutLogs).where(eq(workoutLogs.id, workoutId))
  if (local.length > 0) return local[0]
  throw new Error("Workout log not found")
}

export const createWorkout = async (workout: WorkoutLogType) => {
  const id = createId()
  const now = new Date()

  const newLog = {
    id,
    userId: workout.userId,
    workoutId: workout.workoutId,
    workoutName: workout.workoutName || "",
    notes: workout.notes || null,
    createdAt: workout.createdAt || now.toISOString(),
    updatedAt: now,
    syncStatus: "pending" as const,
  }

  await db.insert(workoutLogs).values(newLog)
  await addToSyncQueue("INSERT", "workout_logs", id, newLog)

  return newLog
}

export const fetchSingleWorkoutByDate = async (date: string) => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/api/workoutLogs/calendar/${date}`
  )
  return response.data.logs
}

export const updateWorkout = async (workout: WorkoutLogType) => {
  if (!workout.id) throw new Error("Workout ID required")

  const now = new Date()
  const updateData = {
    workoutId: workout.workoutId,
    workoutName: workout.workoutName,
    notes: workout.notes,
    updatedAt: now,
    syncStatus: "pending" as const,
  }

  await db.update(workoutLogs).set(updateData).where(eq(workoutLogs.id, workout.id))
  await addToSyncQueue("UPDATE", "workout_logs", workout.id, { ...workout, ...updateData })

  return { ...workout, ...updateData }
}

export const deleteWorkout = async (workoutId: string) => {
  const now = new Date()

  await db.update(workoutLogs).set({
    deletedAt: now,
    updatedAt: now,
    syncStatus: "pending",
  }).where(eq(workoutLogs.id, workoutId))

  await addToSyncQueue("DELETE", "workout_logs", workoutId, { id: workoutId })

  return { success: true }
}

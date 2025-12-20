import { WorkoutLogType } from "@/src/types/workoutLogType"
import { API_BASE_URL } from "./config"
import axiosInstance from "./axiosInstane"
import { db } from "@/src/db/client"
import { workoutLogs } from "@/src/db/schema"
import { desc, eq, isNull, sql } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"
import { addToSyncQueue, pushChanges } from "@/src/services/sync"
import * as Network from "expo-network"

const silentSync = async () => {
  try {
    const networkState = await Network.getNetworkStateAsync()
    if (networkState.isConnected && networkState.isInternetReachable) {
      await pushChanges()
    }
  } catch { }
}

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
      const cursorTime = new Date(cursorLog[0].createdAt).getTime()
      query = db
        .select()
        .from(workoutLogs)
        .where(sql`${workoutLogs.deletedAt} IS NULL AND ${workoutLogs.createdAt} < ${cursorTime}`)
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
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 1)

  const logs = await db
    .select()
    .from(workoutLogs)
    .where(
      sql`${workoutLogs.deletedAt} IS NULL 
      AND ${workoutLogs.createdAt} >= ${startDate.getTime()} 
      AND ${workoutLogs.createdAt} < ${endDate.getTime()}`
    )
    .orderBy(desc(workoutLogs.createdAt))

  const grouped: Record<string, typeof logs> = {}

  logs.forEach((log) => {
    const dateKey = new Date(log.createdAt).toISOString().split('T')[0]
    if (!grouped[dateKey]) {
      grouped[dateKey] = []
    }
    grouped[dateKey].push(log)
  })

  return grouped
}

export async function fetchWorkoutLogsChart(month: number) {
  const now = new Date()
  const pastDate = new Date(now)
  pastDate.setMonth(now.getMonth() - month)

  const logs = await db
    .select()
    .from(workoutLogs)
    .where(
      sql`${workoutLogs.deletedAt} IS NULL AND ${workoutLogs.createdAt} >= ${pastDate.getTime()}`
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
  silentSync()

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
  silentSync()

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
  silentSync()

  return { success: true }
}

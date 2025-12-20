import { WeightLogType } from "@/src/types/weightLogType"
import axiosInstance from "./axiosInstane"
import { API_BASE_URL } from "./config"
import { db } from "@/src/db/client"
import { weightLogs } from "@/src/db/schema"
import { desc, eq, isNull, lt, sql } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"
import { addToSyncQueue } from "@/src/services/sync"

export const fetchAllWeightLogs = async (
  cursor: string | null,
  limit: number = 20
) => {
  let query = db
    .select()
    .from(weightLogs)
    .where(isNull(weightLogs.deletedAt))
    .orderBy(desc(weightLogs.createdAt))
    .limit(limit + 1)

  if (cursor) {
    const cursorLog = await db.select().from(weightLogs).where(eq(weightLogs.id, cursor))
    if (cursorLog.length > 0) {
      query = db
        .select()
        .from(weightLogs)
        .where(sql`${weightLogs.deletedAt} IS NULL AND ${weightLogs.createdAt} < ${cursorLog[0].createdAt.getTime()}`)
        .orderBy(desc(weightLogs.createdAt))
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

export async function fetchWeightLogsChart(months: number) {
  // Local implementation with dynamic date range
  const now = new Date()
  const pastDate = new Date(now)
  pastDate.setMonth(now.getMonth() - months)

  console.log("[DEBUG] Fetching weight logs since:", pastDate.getTime())

  const allLogs = await db
    .select()
    .from(weightLogs)
    .where(
      sql`${weightLogs.deletedAt} IS NULL AND ${weightLogs.createdAt} >= ${pastDate.getTime()}`
    )
    .orderBy(desc(weightLogs.createdAt))

  const aggregation = months <= 1 ? 'daily' : months <= 6 ? 'weekly' : 'monthly'

  const groupedMap = new Map<string, { sum: number, count: number }>()

  // Helper to get key based on aggregation
  const getKey = (date: Date) => {
    if (aggregation === 'daily') {
      return date.toISOString().split('T')[0] // YYYY-MM-DD
    } else if (aggregation === 'weekly') {
      const d = new Date(date)
      const day = d.getDay()
      const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust to Monday
      d.setDate(diff)
      return d.toISOString().split('T')[0]
    } else {
      return date.toISOString().slice(0, 7) // YYYY-MM
    }
  }

  // Group data
  allLogs.forEach(log => {
    const d = new Date(log.createdAt)
    const key = getKey(d)
    const current = groupedMap.get(key) || { sum: 0, count: 0 }
    const numericWeight = typeof log.weight === 'string' ? parseFloat(log.weight) : (log.weight as number)
    groupedMap.set(key, { sum: current.sum + (numericWeight || 0), count: current.count + 1 })
  })

  // We do NOT pre-fill missing days for weights because 0 weight breaks the line chart (drops to zero).
  // Ideally we would interpolate, but for now just showing actual data points is cleaner for weight.
  // Unless we want a continuous line, then we just map the dates we have.
  // Actually, for weekly/monthly, if a month is missing, the line connects across it, which is fine.

  const sortedKeys = Array.from(groupedMap.keys()).sort()

  const labels = sortedKeys.map((key, index) => {
    if (aggregation === 'daily') {
      if (index % 5 === 0) return key.substring(5) // MM-DD
      return ""
    }
    if (aggregation === 'weekly') {
      return key.substring(5)
    }
    // Monthly: YYYY-MM -> MM/YY
    const [y, m] = key.split('-')
    return `${m}/${y.slice(2)}`
  })

  // Calculate averages
  const data = sortedKeys.map(key => {
    const entry = groupedMap.get(key)
    if (!entry) return 0
    return Number((entry.sum / entry.count).toFixed(1))
  })

  return {
    labels,
    datasets: [
      {
        data: data
      }
    ]
  }
}

export const fetchSingleWeightLog = async (weightId: string) => {
  const local = await db.select().from(weightLogs).where(eq(weightLogs.id, weightId))
  if (local.length > 0) return local[0]
  throw new Error("Weight log not found")
}

export const createWeight = async (weight: WeightLogType) => {
  console.log("createWeight called with:", weight)
  const id = createId()
  const now = new Date()

  const newLog = {
    id,
    userId: weight.userId,
    weight: String(weight.weight),
    mood: weight.mood || null,
    energy: weight.energy || null,
    notes: weight.notes || null,
    createdAt: weight.createdAt ? new Date(weight.createdAt) : now,
    updatedAt: now,
    syncStatus: "pending" as const,
  }

  try {
    await db.insert(weightLogs).values(newLog)
    console.log("Weight inserted to local DB:", newLog.id)
    await addToSyncQueue("INSERT", "weight_logs", id, newLog)
    console.log("Added to sync queue")
    return newLog
  } catch (e) {
    console.error("Error inserting weight to local DB:", e)
    throw e
  }
}

export const updateWeight = async (weight: WeightLogType) => {
  if (!weight.id) throw new Error("Weight ID required")

  const now = new Date()
  const updateData = {
    weight: String(weight.weight),
    mood: weight.mood,
    energy: weight.energy,
    notes: weight.notes,
    updatedAt: now,
    syncStatus: "pending" as const,
  }

  await db.update(weightLogs).set(updateData).where(eq(weightLogs.id, weight.id))
  await addToSyncQueue("UPDATE", "weight_logs", weight.id, { ...weight, ...updateData })

  return { ...weight, ...updateData }
}

export const deleteWeight = async (weightId: string) => {
  const now = new Date()

  await db.update(weightLogs).set({
    deletedAt: now,
    updatedAt: now,
    syncStatus: "pending",
  }).where(eq(weightLogs.id, weightId))

  await addToSyncQueue("DELETE", "weight_logs", weightId, { id: weightId })

  return { success: true }
}

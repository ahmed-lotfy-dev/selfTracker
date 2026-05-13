export interface WorkoutLog {
  id: string
  userId: string
  workoutId: string
  workoutName: string
  notes: string | null
  createdAt: string
  updatedAt: string
}

import { axiosInstance } from "./config"

export async function getWorkoutLogs(cursor?: string, limit = 500) {
  const params = new URLSearchParams({ limit: String(limit) })
  if (cursor) params.set("cursor", cursor)
  const res = await axiosInstance.get<{ logs: WorkoutLog[]; nextCursor: string | null }>(
    `/api/workoutLogs?${params}`
  )
  return res.data
}

export async function getAllWorkoutLogs() {
  const all: WorkoutLog[] = []
  let cursor: string | undefined
  let pages = 0
  while (pages < 20) {
    const { logs, nextCursor } = await getWorkoutLogs(cursor, 500)
    all.push(...logs)
    if (!nextCursor) break
    cursor = nextCursor
    pages++
  }
  return all
}

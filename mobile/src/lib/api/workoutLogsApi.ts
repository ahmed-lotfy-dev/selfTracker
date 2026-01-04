import axiosInstance from "./axiosInstance"
import { API_BASE_URL } from "./config"
import type { WorkoutLog } from "@/src/stores/useWorkoutsStore"

type PaginatedResponse = {
  logs: WorkoutLog[]
  nextCursor: string | null
}

export const getWorkoutLogs = async (
  cursor?: string,
  limit: number = 20
): Promise<PaginatedResponse> => {
  const params = new URLSearchParams()
  if (cursor) params.append("cursor", cursor)
  params.append("limit", String(limit))

  const queryString = params.toString()
  const url = `${API_BASE_URL}/api/workoutLogs${queryString ? `?${queryString}` : ""}`

  const response = await axiosInstance.get(url)

  return {
    logs: response.data.logs.map((log: any) => ({
      id: log.id,
      userId: log.userId,
      workoutId: log.workoutId,
      workoutName: log.workoutName,
      notes: log.notes,
      createdAt: log.createdAt,
      updatedAt: log.updatedAt || log.createdAt,
      deletedAt: log.deletedAt || null,
    })),
    nextCursor: response.data.nextCursor,
  }
}

export const getWorkoutLogsForMonth = async (
  year: number,
  month: number
): Promise<WorkoutLog[]> => {
  const url = `${API_BASE_URL}/api/workoutLogs/calendar?year=${year}&month=${month}`

  const response = await axiosInstance.get(url)

  return response.data.map((log: any) => ({
    id: log.id,
    userId: log.userId,
    workoutId: log.workoutId,
    workoutName: log.workoutName,
    notes: log.notes,
    createdAt: log.createdAt,
    updatedAt: log.updatedAt || log.createdAt,
    deletedAt: log.deletedAt || null,
  }))
}

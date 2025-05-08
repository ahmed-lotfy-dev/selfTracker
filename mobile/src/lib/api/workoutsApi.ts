import { WorkoutLogType } from "@/src/types/workoutLogType"
import { API_BASE_URL } from "./config"
import axiosInstance from "./axiosInstane"

export const fetchAllWorkoutLogs = async (
  cursor: string | null,
  limit: number
) => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/api/workoutLogs`,
      {
        params: {
          cursor,
          limit,
        },
      }
    )
    return {
      logs: response.data.logs,
      nextCursor: response.data.nextCursor || null,
    }
  } catch (error) {
    console.error("Error fetching weight logs:", error)
    throw error
  }
}

export async function fetchWorkoutLogsByMonth(year: number, month: number) {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/api/workoutLogs/calendar?year=${year}&month=${month}`
  )
  return response.data.logs
}

export const fetchSingleWorkout = async (workoutId: string) => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/api/workoutLogs/${workoutId}`
  )
  return response.data.logs
}

export const createWorkout = async (workout: WorkoutLogType) => {
  const response = await axiosInstance.post(
    `${API_BASE_URL}/api/workoutLogs`,
    workout
  )
  return response.data
}

export const fetchSingleWorkoutByDate = async (date: string) => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/api/workoutLogs/calendar/${date}`
  )
  return response.data.logs
}

export const updateWorkout = async (workout: WorkoutLogType) => {
  const response = await axiosInstance.patch(
    `${API_BASE_URL}/api/workoutLogs/${workout.id}`,
    workout
  )
  return response.data
}

export const deleteWorkout = async (workoutId: string) => {
  const response = await axiosInstance.delete(
    `${API_BASE_URL}/api/workoutLogs/${workoutId}`
  )
  return response.data
}

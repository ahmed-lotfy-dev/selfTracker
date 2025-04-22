import { WorkoutType } from "@/src/types/workoutType"
import { API_BASE_URL } from "./config"
import axiosInstance from "./axiosInstane"

export const fetchAllWorkoutLogs = async (
  cursor: string | null = null,
  limit: number = 10
) => {
  const response = await axiosInstance.get(`${API_BASE_URL}/api/workoutLogs`, {
    params: {
      cursor,
      limit,
    },
  })
  return response.data.workoutLogs
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

export const createWorkout = async (workout: WorkoutType) => {
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

export const updateWorkout = async (workout: any) => {
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

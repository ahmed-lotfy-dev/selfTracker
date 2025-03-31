import { WorkoutType } from "@/types/workoutType"
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
  return response.data
}

export const fetchSingleWorkout = async (workoutId: string) => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/api/workoutLogs/${workoutId}`
  )
  return response.data
}

export const createWorkout = async (workout: any) => {
  const response = await axiosInstance.post(
    `${API_BASE_URL}/api/workoutLogs`,
    workout
  )
  return response.data
}

export const updateWorkout = async (workout: any) => {
  const response = await axiosInstance.put(
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

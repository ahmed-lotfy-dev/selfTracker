import { WorkoutType } from "@/types/workoutType"
import { API_BASE_URL } from "./config"
import axiosInstance from "./axiosInstane"

export const fetchAllWorkouts = async () => {
  const response = await axiosInstance.get(`${API_BASE_URL}/api/workouts`)
  console.log(response.data)
  return response.data
}

export const fetchSingleWorkout = async (workoutId: string) => {
  const response = await axiosInstance.get(
    `${API_BASE_URL}/api/workouts/${workoutId}`
  )
  return response.data
}

export const createWorkout = async (workout: WorkoutType) => {
  const response = await axiosInstance.post(
    `${API_BASE_URL}/api/workouts`,
    workout
  )
  return response.data
}

export const updateWorkout = async (workout: WorkoutType) => {
  const response = await axiosInstance.put(
    `${API_BASE_URL}/api/workouts/${workout.id}`,
    workout
  )
  return response.data
}

export const deleteWorkout = async (workoutId: string) => {
  const response = await axiosInstance.delete(
    `${API_BASE_URL}/api/workouts/${workoutId}`
  )
  return response.data
}

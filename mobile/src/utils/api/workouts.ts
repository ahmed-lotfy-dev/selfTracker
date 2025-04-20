import { WorkoutType } from "@/src/types/workoutType"
import { API_BASE_URL } from "./config"
import axiosInstance from "./axiosInstane"

export const fetchAllWorkouts = async () => {
  const response = await axiosInstance.get(`${API_BASE_URL}/api/workouts`)
  return response.data
}

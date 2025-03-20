import { Workout } from "@/types/workoutType"
import { API_BASE_URL } from "./auth"
import axiosInstance from "./axiosInstane"

export const fetchAllWorkouts = async (): Promise<{ workouts: Workout[] }> => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/api/weights`)
    return response.data
    console.log(response.data)
  } catch (error) {
    console.error("Error fetching workouts:", error)
    throw error
  }
}

import axiosInstance from "./axiosInstance"
import { API_BASE_URL } from "./config"
import type { Workout } from "@/src/stores/useWorkoutsStore"

export const getWorkouts = async (): Promise<Workout[]> => {
  const url = `${API_BASE_URL}/api/workouts`

  const response = await axiosInstance.get(url)
  const data = response.data

  return data.map((workout: any) => ({
    id: workout.id,
    name: workout.name,
    trainingSplitId: workout.trainingSplitId,
    userId: workout.userId,
    createdAt: workout.createdAt,
    updatedAt: workout.updatedAt,
    isPublic: workout.isPublic,
    deletedAt: workout.deletedAt || null,
  }))
}
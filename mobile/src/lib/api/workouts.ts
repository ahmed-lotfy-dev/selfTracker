import { db } from "@/src/db/client"
import { workouts } from "@/src/db/schema"
import { API_BASE_URL } from "./config"
import axiosInstance from "./axiosInstane"

export const fetchAllWorkouts = async () => {
  console.log("fetchAllWorkouts called")
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/api/workouts`)
    console.log("API response:", response.data)
    const workoutList = response.data.workouts || []

    for (const w of workoutList) {
      await db.insert(workouts).values({
        id: w.id,
        name: w.name,
        trainingSplitId: w.trainingSplitId || null,
        createdAt: w.createdAt || null,
        updatedAt: w.updatedAt || null,
      }).onConflictDoUpdate({
        target: workouts.id,
        set: {
          name: w.name,
          trainingSplitId: w.trainingSplitId || null,
          updatedAt: w.updatedAt || null,
        }
      })
    }

    return response.data
  } catch (error) {
    console.log("fetchAllWorkouts error, falling back to local:", error)
    const localWorkouts = await db.select().from(workouts)
    console.log("Local workouts:", localWorkouts)
    return { workouts: localWorkouts }
  }
}

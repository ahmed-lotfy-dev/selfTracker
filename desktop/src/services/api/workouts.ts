import axiosInstance from "@/lib/api/axiosInstance"

export interface Workout {
  id: string
  name: string
  description?: string
  category?: string
  createdAt: string
  updatedAt: string
}

export interface WorkoutLog {
  id: string
  userId: string
  workoutId: string
  workoutName?: string // Joined field
  notes?: string
  createdAt: string
}

export async function getWorkouts(): Promise<{ workouts: Workout[] }> {
  try {
    const res = await axiosInstance.get("/workouts")
    return res.data
  } catch (err: any) {
    if (err.response?.status === 404) return { workouts: [] }
    throw new Error("Failed to fetch workouts")
  }
}

export async function getWorkoutLogs(cursor?: string, limit = 10): Promise<{ logs: WorkoutLog[], nextCursor?: string }> {
  const params = new URLSearchParams()
  if (cursor) params.append("cursor", cursor)
  params.append("limit", limit.toString())

  const res = await axiosInstance.get(`/workoutLogs?${params.toString()}`)
  return res.data
}

export async function createWorkoutLog(data: { workoutId: string; notes?: string; createdAt?: Date | string }): Promise<WorkoutLog> {
  const res = await axiosInstance.post("/workoutLogs", data)
  return res.data.workoutLog
}

export async function deleteWorkoutLog(id: string): Promise<void> {
  await axiosInstance.delete(`/workoutLogs/${id}`)
}

export interface WorkoutChartData {
  labels: string[]
  datasets: {
    data: number[]
  }[]
}

export async function getWorkoutChart(month: number): Promise<WorkoutChartData> {
  const res = await axiosInstance.get(`/workoutLogs/chart?month=${month}`)
  return res.data
}

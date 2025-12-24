import { backendUrl } from "@/lib/api"

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
  const res = await fetch(`${backendUrl}/api/workouts`)
  if (!res.ok) {
    // If 404, it might mean no workouts found, handle gracefully or throw
    if (res.status === 404) return { workouts: [] }
    throw new Error("Failed to fetch workouts")
  }
  return res.json()
}

export async function getWorkoutLogs(cursor?: string, limit = 10): Promise<{ logs: WorkoutLog[], nextCursor?: string }> {
  const params = new URLSearchParams()
  if (cursor) params.append("cursor", cursor)
  params.append("limit", limit.toString())

  const res = await fetch(`${backendUrl}/api/workoutLogs?${params.toString()}`)
  if (!res.ok) throw new Error("Failed to fetch workout logs")
  return res.json()
}

export async function createWorkoutLog(data: { workoutId: string; notes?: string; createdAt?: Date | string }): Promise<WorkoutLog> {
  const res = await fetch(`${backendUrl}/api/workoutLogs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to create workout log")
  const json = await res.json()
  return json.workoutLog
}

export async function deleteWorkoutLog(id: string): Promise<void> {
  const res = await fetch(`${backendUrl}/api/workoutLogs/${id}`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error("Failed to delete workout log")
}

export interface WorkoutChartData {
  labels: string[]
  datasets: {
    data: number[]
  }[]
}

export async function getWorkoutChart(month: number): Promise<WorkoutChartData> {
  const res = await fetch(`${backendUrl}/api/workoutLogs/chart?month=${month}`)
  if (!res.ok) throw new Error("Failed to fetch workout chart data")
  return res.json()
}

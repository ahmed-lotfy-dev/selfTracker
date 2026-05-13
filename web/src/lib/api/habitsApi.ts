import { axiosInstance } from "./config"

export interface Habit {
  id: string
  userId: string
  name: string
  description: string | null
  color: string
  streak: number
  completedToday: boolean
  lastCompletedAt: string | null
  completionDates: string[]
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export async function getHabits(): Promise<Habit[]> {
  const res = await axiosInstance.get<{ habits: any[] }>("/api/habits")
  return res.data.habits.map((h) => ({
    id: h.id,
    userId: h.userId,
    name: h.name,
    description: h.description || null,
    color: h.color || "#6366f1",
    streak: h.streak ?? 0,
    completedToday: h.completedToday ?? false,
    lastCompletedAt: h.lastCompletedAt || null,
    completionDates: h.completionDates || [],
    createdAt: h.createdAt,
    updatedAt: h.updatedAt || h.createdAt,
    deletedAt: h.deletedAt || null,
  }))
}

export async function createHabit(data: { name: string; description?: string; color?: string }) {
  const res = await axiosInstance.post("/api/habits", data)
  return res.data
}

export async function toggleHabitCompletion(habitId: string, date: string, completed: boolean) {
  const res = await axiosInstance.post(`/api/habits/${habitId}/complete`, { date, completed })
  return res.data.habit
}

import axiosInstance from "./axiosInstance"
import { API_BASE_URL } from "./config"
import type { Habit } from "@/src/types/habitType"

export const getHabits = async (): Promise<Habit[]> => {
  const url = `${API_BASE_URL}/api/habits`
  const response = await axiosInstance.get(url)

  // API returns { habits: [...] }
  return (response.data.habits as any[]).map((habit: any) => ({
    id: habit.id,
    userId: habit.userId,
    name: habit.name,
    description: habit.description || null,
    streak: habit.streak ?? 0,
    color: habit.color || '#6366f1',
    completedToday: habit.completedToday ?? false,
    lastCompletedAt: habit.lastCompletedAt || null,
    completionDates: habit.completionDates || [],
    createdAt: habit.createdAt,
    updatedAt: habit.updatedAt || habit.createdAt,
    deletedAt: habit.deletedAt || null,
  }))
}

export const toggleHabitCompletion = async (
  habitId: string,
  date: string,
  completed: boolean
): Promise<Habit> => {
  const url = `${API_BASE_URL}/api/habits/${habitId}/complete`
  const response = await axiosInstance.post(url, { date, completed })
  return response.data.habit
}

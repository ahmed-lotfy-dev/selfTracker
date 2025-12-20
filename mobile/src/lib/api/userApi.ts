import { WeightLogType } from "@/src/types/weightLogType"
import { API_BASE_URL } from "./config"
import axios from "axios"
import axiosInstance from "./axiosInstane"
import { db } from "@/src/db/client"
import { weightLogs, workoutLogs, tasks } from "@/src/db/schema"
import { desc, eq, isNull, sql } from "drizzle-orm"
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths } from "date-fns"

export const fetchUserHomeInfo = async () => {
  const now = new Date()

  const startOfThisWeek = startOfWeek(now, { weekStartsOn: 6 })
  const endOfThisWeek = endOfWeek(now, { weekStartsOn: 6 })
  const startOfThisMonth = startOfMonth(now)
  const endOfThisMonth = endOfMonth(now)
  const threeMonthsAgo = subMonths(now, 3)

  const allWorkouts = await db.select().from(workoutLogs).where(isNull(workoutLogs.deletedAt)).orderBy(desc(workoutLogs.createdAt))

  const weeklyWorkouts = new Set(
    allWorkouts
      .filter(w => {
        const createdAt = new Date(w.createdAt)
        return createdAt >= startOfThisWeek && createdAt <= endOfThisWeek
      })
      .map(w => new Date(w.createdAt).toISOString().split('T')[0])
  ).size

  const monthlyWorkouts = new Set(
    allWorkouts
      .filter(w => {
        const createdAt = new Date(w.createdAt)
        return createdAt >= startOfThisMonth && createdAt <= endOfThisMonth
      })
      .map(w => new Date(w.createdAt).toISOString().split('T')[0])
  ).size

  const allTasksList = await db.select().from(tasks).where(isNull(tasks.deletedAt))
  const completedTasks = allTasksList.filter(t => t.completed).length
  const pendingTasks = allTasksList.filter(t => !t.completed).length
  const allTasksCount = allTasksList.length

  const weights = await db.select().from(weightLogs).where(isNull(weightLogs.deletedAt)).orderBy(desc(weightLogs.createdAt))
  const latestWeight = weights.length > 0 ? parseFloat(String(weights[0].weight)) : null

  let weightChange = null
  if (latestWeight) {
    const threeMonthsLog = weights
      .filter(w => new Date(w.createdAt) >= threeMonthsAgo)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0]

    if (threeMonthsLog && threeMonthsLog.id !== weights[0].id) {
      const oldWeight = parseFloat(String(threeMonthsLog.weight))
      const change = latestWeight - oldWeight
      const sign = change > 0 ? "+" : ""
      weightChange = `${sign}${change.toFixed(2)} kg`
    }
  }

  const streak = calculateStreak(allWorkouts.map(w => new Date(w.createdAt)))

  const activeDays = new Set(
    allWorkouts.map(w => new Date(w.createdAt).toISOString().split('T')[0])
  ).size

  return {
    weeklyWorkout: weeklyWorkouts,
    monthlyWorkout: monthlyWorkouts,
    completedTasks,
    pendingTasks,
    allTasks: allTasksCount,
    latestWeight,
    weightChange,
    stats: {
      totalWorkouts: allWorkouts.length,
      activeDays,
      streak,
      weightProgress: 0,
      tasksCompleted: completedTasks,
      tasksTotal: allTasksCount
    },
    recentWorkouts: allWorkouts.slice(0, 5),
    recentWeights: weights.slice(0, 5)
  }
}

function calculateStreak(dates: Date[]): number {
  if (dates.length === 0) return 0

  const sortedDates = dates.sort((a, b) => b.getTime() - a.getTime())
  const uniqueDays = Array.from(new Set(sortedDates.map(d => d.toISOString().split('T')[0])))

  let streak = 0
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  // Allow streak to be kept if workout was today OR yesterday
  if (uniqueDays[0] !== today && uniqueDays[0] !== yesterday) return 0

  let currentCheck = new Date(uniqueDays[0])
  for (let i = 0; i < uniqueDays.length; i++) {
    const dateStr = uniqueDays[i]
    if (dateStr === currentCheck.toISOString().split('T')[0]) {
      streak++
      currentCheck.setDate(currentCheck.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

import { User } from "@/src/types/userType"

export const updateUser = async ({
  id,
  ...updatedFields
}: Partial<User> & { id: string }) => {
  const response = await axiosInstance.patch(
    `${API_BASE_URL}/api/users/${id}`,
    updatedFields
  )
  return response.data
}

export const deleteUser = async (weightId: string) => {
  const response = await axiosInstance.delete(
    `${API_BASE_URL}/api/users/${weightId}`
  )
  return response.data
}

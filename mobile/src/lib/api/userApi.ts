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

  // Date ranges for stats (matching backend logic)
  const startOfThisWeek = startOfWeek(now, { weekStartsOn: 6 }).toISOString() // Saturday start
  const endOfThisWeek = endOfWeek(now, { weekStartsOn: 6 }).toISOString()
  const startOfThisMonth = startOfMonth(now).toISOString()
  const endOfThisMonth = endOfMonth(now).toISOString()
  const threeMonthsAgo = subMonths(now, 3).toISOString()

  // 1. Fetch Workouts
  const allWorkouts = await db.select().from(workoutLogs).where(isNull(workoutLogs.deletedAt)).orderBy(desc(workoutLogs.createdAt))

  // Calculate Weekly/Monthly Workout Counts (Distinct Days)
  const weeklyWorkouts = new Set(
    allWorkouts
      .filter(w => w.createdAt >= startOfThisWeek && w.createdAt <= endOfThisWeek)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map(w => (typeof w.createdAt === 'string' ? w.createdAt.split('T')[0] : (w.createdAt as any).toISOString().split('T')[0]))
  ).size

  const monthlyWorkouts = new Set(
    allWorkouts
      .filter(w => w.createdAt >= startOfThisMonth && w.createdAt <= endOfThisMonth)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map(w => (typeof w.createdAt === 'string' ? w.createdAt.split('T')[0] : (w.createdAt as any).toISOString().split('T')[0]))
  ).size

  // 2. Fetch Tasks
  const allTasksList = await db.select().from(tasks).where(isNull(tasks.deletedAt))
  const completedTasks = allTasksList.filter(t => t.completed).length
  const pendingTasks = allTasksList.filter(t => !t.completed).length
  const allTasksCount = allTasksList.length

  // 3. Fetch Weights
  const weights = await db.select().from(weightLogs).where(isNull(weightLogs.deletedAt)).orderBy(desc(weightLogs.createdAt))
  const latestWeight = weights.length > 0 ? weights[0].weight : null

  // 4. Weight Change (3 Months)
  let weightChange = null
  if (latestWeight) {
    // Find oldest weight in the last 3 months
    const threeMonthsLog = weights
      .filter(w => w.createdAt >= threeMonthsAgo)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0] // Sort ASC to get oldest

    if (threeMonthsLog && threeMonthsLog.id !== weights[0].id) {
      const change = latestWeight - threeMonthsLog.weight
      const sign = change > 0 ? "+" : ""
      weightChange = `${sign}${change.toFixed(2)} kg`
    }
  }

  // Calculate Streak locally
  const streak = calculateStreak(allWorkouts.map(w => new Date(w.createdAt)))

  // Recent activity (Last 7 days active)
  const activeDays = new Set(
    allWorkouts.map(w => w.createdAt.split('T')[0])
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
    // Keep recent for lists
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

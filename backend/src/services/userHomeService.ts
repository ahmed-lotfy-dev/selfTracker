import { db } from "../db"
import { weightLogs } from "../db/schema/weightLogs"
import { and, eq, desc, gte, lt, lte, or, sql } from "drizzle-orm"
import {
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns"
import { tasks } from "../db/schema/tasks"
import { workoutLogs } from "../db/schema/workoutLogs"
import { userGoals } from "../db/schema/userGoals"
import { format } from "date-fns"

export const getWorkoutCounts = async (userId: string) => {
  const start = startOfWeek(new Date(), { weekStartsOn: 6 })
  const end = endOfWeek(new Date(), { weekStartsOn: 6 })

  const [weeklyWorkoutCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(workoutLogs)
    .where(
      and(
        eq(workoutLogs.userId, userId),
        gte(workoutLogs.createdAt, start),
        lte(workoutLogs.createdAt, end)
      )
    )

  const [monthlyWorkoutCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(workoutLogs)
    .where(
      and(
        eq(workoutLogs.userId, userId),
        gte(workoutLogs.createdAt, startOfMonth(new Date())),
        lte(workoutLogs.createdAt, endOfMonth(new Date()))
      )
    )
  return {
    weeklyWorkout: weeklyWorkoutCount.count || 0,
    monthlyWorkout: monthlyWorkoutCount.count || 0,
  }
}

export const getTaskCount = async (userId: string) => {
  const [weeklyCompletedTaskCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tasks)
    .where(and(eq(tasks.completed, true), eq(tasks.userId, userId)))

  const [weeklyPendingTaskCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tasks)
    .where(and(eq(tasks.completed, false), eq(tasks.userId, userId)))

  return {
    completedTasks: weeklyCompletedTaskCount.count,
    pendingTasks: weeklyPendingTaskCount.count,
    allTasks: weeklyCompletedTaskCount.count + weeklyPendingTaskCount.count,
  }
}

export const getUserGoal = async (userId: string) => {
  const [goal] = await db
    .select()
    .from(userGoals)
    .where(
      and(
        eq(userGoals.userId, userId),
        or(
          eq(userGoals.goalType, "loseWeight"),
          eq(userGoals.goalType, "gainWeight")
        )
      )
    )

  if (!goal) {
    return {
      goalWeight: null,
      goalType: null,
    }
  }

  return {
    goalWeight: goal.targetValue,
    goalType: goal.goalType,
  }
}

export const getUserLatestWeight = async (userId: string) => {
  const [latestWeight] = await db
    .select()
    .from(weightLogs)
    .where(eq(weightLogs.userId, userId))
    .orderBy(desc(weightLogs.createdAt))
    .limit(1)

  return latestWeight.weight ?? "no weight log yet"
}

export const calculateBMI = (
  weight: number,
  height: number,
  unitSystem: string
) => {
  let bmi = null
  if (height && weight) {
    if (unitSystem === "metric") {
      const heightInMeters = height / 100
      bmi = weight / (heightInMeters * heightInMeters)
    } else {
      bmi = (weight / (height * height)) * 703
    }
  }
  return bmi && parseFloat(bmi.toFixed(2))
}

export const getBMICategory = (bmi: number): string => {
  if (bmi < 18.5) return "Underweight"
  if (bmi < 24.9) return "Normal weight"
  if (bmi < 29.9) return "Overweight"
  return "Obese"
}

export const calculateWeightDelta = (
  goalWeight: number,
  goalType: string,
  latestWeight: number
) => {
  if (!goalWeight || !latestWeight || !goalType) {
    return null
  }

  let weightDelta = null

  if (goalType === "loseWeight") {
    weightDelta = Number(latestWeight) - Number(goalWeight)
  } else if (goalType === "gainWeight") {
    weightDelta = Number(goalWeight) - Number(latestWeight)
  } else if (goalType === "lostWeight") {
    weightDelta = Number(goalWeight) - Number(latestWeight)
  }

  return weightDelta
}



export const getWeightChangeInPeriod = async (
  userId: string,
  period: number
) => {
  const threeMonthsAgo = subMonths(new Date(), period)

  const [oldestWeightLog] = await db
    .select()
    .from(weightLogs)
    .where(
      and(
        eq(weightLogs.userId, userId),
        gte(weightLogs.createdAt, threeMonthsAgo),
        lt(weightLogs.createdAt, new Date())
      )
    )
    .orderBy(weightLogs.createdAt)
    .limit(1)

  const [latestWeightLog] = await db
    .select()
    .from(weightLogs)
    .where(eq(weightLogs.userId, userId))
    .orderBy(desc(weightLogs.createdAt))
    .limit(1)

  if (!oldestWeightLog || !latestWeightLog) {
    return "Insufficient data to calculate weight change"
  }

  const weightChange =
    parseFloat(latestWeightLog.weight) - parseFloat(oldestWeightLog.weight)

  if (weightChange > 0) {
    return `Gained ${weightChange.toFixed(2)} kg`
  } else if (weightChange < 0) {
    return `Lost ${Math.abs(weightChange).toFixed(2)} kg`
  } else {
    return "No weight change"
  }
}

export const getUserData = async (user: any) => {
  const { weeklyWorkout, monthlyWorkout } = await getWorkoutCounts(user.id)
  const { completedTasks, pendingTasks, allTasks } = await getTaskCount(user.id)
  const goal = await getUserGoal(user.id)
  const latestWeight = await getUserLatestWeight(user.id)
  const userBMI = calculateBMI(user.weight, user.height, user.unitSystem)
  const BMICategory = getBMICategory(Number(userBMI))
  const weightChange = await getWeightChangeInPeriod(user.id, 1)

  return {
    weeklyWorkout,
    monthlyWorkout,
    completedTasks,
    pendingTasks,
    allTasks,
    goal,
    latestWeight,
    userBMI,
    BMICategory,
    weightChange,
  }
}

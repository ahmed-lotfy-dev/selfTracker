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
    .select({
      count: sql<number>`count(distinct ${sql`date(${workoutLogs.createdAt})`})`,
    })
    .from(workoutLogs)
    .where(
      and(
        eq(workoutLogs.userId, userId),
        gte(workoutLogs.createdAt, start),
        lte(workoutLogs.createdAt, end)
      )
    )

  const [monthlyWorkoutCount] = await db
    .select({
      count: sql<number>`count(distinct ${sql`date(${workoutLogs.createdAt})`})`,
    })
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

export const getWorkoutChartData = async (userId: string) => {
  const start = startOfWeek(new Date(), { weekStartsOn: 6 })
  const end = endOfWeek(new Date(), { weekStartsOn: 6 })

  const weeklyData = await db
    .select({
      date: sql<string>`date(${workoutLogs.createdAt})`,
      count: sql<number>`count(*)::int`,
    })
    .from(workoutLogs)
    .where(
      and(
        eq(workoutLogs.userId, userId),
        gte(workoutLogs.createdAt, start),
        lte(workoutLogs.createdAt, end)
      )
    )
    .groupBy(sql`date(${workoutLogs.createdAt})`)
    .orderBy(sql`date(${workoutLogs.createdAt})`)

  return weeklyData.map((row) => ({
    date: format(new Date(row.date), "EEE"),
    count: row.count,
  }))
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
    completedTasks: weeklyCompletedTaskCount?.count || 0,
    pendingTasks: weeklyPendingTaskCount?.count || 0,
    allTasks:
      (weeklyCompletedTaskCount?.count || 0) +
      (weeklyPendingTaskCount?.count || 0),
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
    goalWeight: goal.targetValue ? parseFloat(goal.targetValue) : null,
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

  return latestWeight?.weight ? parseFloat(latestWeight.weight) : null
}

export const calculateBMI = (
  weight: number | null,
  height: number | null,
  unitSystem: string
) => {
  if (weight === null || height === null) {
    return null
  }
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

export const getBMICategory = (bmi: number | null): string | null => {
  if (!bmi) return null
  if (bmi < 18.5) return "Underweight"
  if (bmi < 24.9) return "Normal weight"
  if (bmi < 29.9) return "Overweight"
  return "Obese"
}

export const calculateWeightDelta = (
  goalWeight: number | null,
  goalType: string | null,
  latestWeight: number | null
) => {
  if (goalWeight === null || latestWeight === null || goalType === null) {
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

  if (
    !oldestWeightLog ||
    !latestWeightLog ||
    oldestWeightLog.id === latestWeightLog.id
  ) {
    return null
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
  let weeklyWorkout = 0,
    monthlyWorkout = 0,
    completedTasks = 0,
    pendingTasks = 0,
    allTasks = 0,
    goal: { goalWeight: number | null; goalType: string | null } = {
      goalWeight: null,
      goalType: null,
    },
    latestWeight = null,
    userBMI = null,
    BMICategory = null,
    weightChange = null,
    weightDelta = null,
    workoutChartData = null

  try {
    const workoutCounts = await getWorkoutCounts(user.id)
    weeklyWorkout = workoutCounts.weeklyWorkout
    monthlyWorkout = workoutCounts.monthlyWorkout
    const chartData = await getWorkoutChartData(user.id)
    workoutChartData = chartData
  } catch (error) {
    console.error("Error fetching workout counts:", error)
  }

  try {
    const taskCounts = await getTaskCount(user.id)
    completedTasks = taskCounts.completedTasks
    pendingTasks = taskCounts.pendingTasks
    allTasks = taskCounts.allTasks
  } catch (error) {
    console.error("Error fetching task counts:", error)
  }

  try {
    goal = await getUserGoal(user.id)
  } catch (error) {
    console.error("Error fetching user goal:", error)
  }

  try {
    latestWeight = await getUserLatestWeight(user.id)
  } catch (error) {
    console.error("Error fetching latest weight:", error)
  }

  try {
    userBMI = calculateBMI(user.weight, user.height, user.unitSystem)
    BMICategory = getBMICategory(userBMI)
  } catch (error) {
    console.error("Error calculating BMI:", error)
  }

  try {
    weightChange = await getWeightChangeInPeriod(user.id, 3)
  } catch (error) {
    console.error("Error fetching weight change:", error)
  }

  try {
    weightDelta = calculateWeightDelta(
      goal.goalWeight,
      goal.goalType,
      latestWeight
    )
  } catch (error) {
    console.error("Error calculating weight delta:", error)
  }

  return {
    weeklyWorkout,
    monthlyWorkout,
    workoutChartData,
    completedTasks,
    pendingTasks,
    allTasks,
    goal,
    latestWeight,
    weightDelta,
    userBMI,
    BMICategory,
    weightChange,
  }
}

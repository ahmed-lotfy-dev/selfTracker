import { and, eq, lt, desc, gte, lte, count, asc } from "drizzle-orm"
import { db } from "../db"
import { workoutLogs } from "../db/schema/workoutLogs"
import { clearCache } from "../../lib/redis"
import { format, subMonths } from "date-fns"

export const getWorkoutLogs = async (
  userId: string,
  cursor: string,
  limit: string | number
) => {
  const limitNumber = Number(limit) || 10

  const userWorkoutLogs = await db.query.workoutLogs
    .findMany({
      where: cursor
        ? and(
            eq(workoutLogs.userId, userId),
            lt(workoutLogs.createdAt, new Date(cursor))
          )
        : eq(workoutLogs.userId, userId),
      orderBy: desc(workoutLogs.createdAt),
      limit: limitNumber + 1,
    })
    .prepare("getWorkoutLogs")
    .execute()

  const hasMore = userWorkoutLogs.length > limitNumber
  const items = hasMore ? userWorkoutLogs.slice(0, -1) : userWorkoutLogs
  const nextCursor = hasMore
    ? items[items.length - 1]?.createdAt?.toISOString()
    : null

  return { items, nextCursor }
}

export const getWorkoutLogsCalendar = async (
  year: number,
  month: number,
  userId: string
) => {
  const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0)
  const endDate = new Date(year, month, 0, 23, 59, 59, 999)

  const userWorkoutLogs = await db.query.workoutLogs
    .findMany({
      where: and(
        eq(workoutLogs.userId, userId),
        and(
          gte(workoutLogs.createdAt, startDate),
          lte(workoutLogs.createdAt, endDate)
        )
      ),
      orderBy: desc(workoutLogs.createdAt),
    })
    .prepare("getWorkoutLogsCalendar")
    .execute()

  //handle logs to match Calendar Component view on the frontend
  const groupedLogs: Record<string, any[]> = {}
  userWorkoutLogs.forEach((log) => {
    const date = (log.createdAt as Date).toISOString().split("T")[0]
    if (!groupedLogs[date]) {
      groupedLogs[date] = []
    }
    groupedLogs[date].push(log)
  })

  return groupedLogs
}

export const getSingleWorkoutLog = async (logId: string) => {
  const log = await db.query.workoutLogs
    .findFirst({
      where: eq(workoutLogs.id, logId),
    })
    .prepare("getSingleWorkoutLog")
    .execute()

  return log
}

export const createWorkoutLog = async (userId: string, fields: any) => {
  const [created] = await db
    .insert(workoutLogs)
    .values({
      ...fields,
      userId,
      workoutName: fields.workoutName,
      workoutId: fields.workoutId,
      createdAt: new Date(fields.createdAt),
    })
    .returning()
    .prepare("createWorkoutLog")
    .execute()

  return created
}

export const updateWorkoutLog = async (
  id: string,
  userId: string,
  fields: any
) => {
  await clearCache([`userHomeData:${userId}`, `workoutLogs:list:${userId}:*`])

  const [updated] = await db
    .update(workoutLogs)
    .set({ ...fields, createdAt: fields.createdAt })
    .where(and(eq(workoutLogs.id, id), eq(workoutLogs.userId, userId)))
    .returning()
    .prepare("updateWorkotLog")
    .execute()
  console.log(updated)
  return updated
}

export const deleteWorkoutLog = async (
  userId: string,
  workoutLogId: string
) => {
  await clearCache([`userHomeData:${userId}`, `workoutLogs:list:${userId}:*`])

  const deletedWorkout = await db
    .delete(workoutLogs)
    .where(eq(workoutLogs.id, workoutLogId))
    .returning()

  return deletedWorkout
}

export const getTimeWorkoutLogs = async (userId: string, month: number) => {
  try {
    const now = new Date()

    const result = await db
      .select({
        workoutType: workoutLogs.workoutName,
        count: count(workoutLogs.id),
      })
      .from(workoutLogs)
      .where(
        and(
          eq(workoutLogs.userId, userId),
          gte(workoutLogs.createdAt, subMonths(now, month)),
          lte(workoutLogs.createdAt, now)
        )
      )
      .groupBy(workoutLogs.workoutName)
      .orderBy(asc(workoutLogs.workoutName))

    const labels = result.map((r) => r.workoutType)
    const data = result.map((r) => r.count)

    return {
      labels,
      datasets: [
        {
          label: "Workouts",
          data,
        },
      ],
    }
  } catch (error) {
    console.error("Failed to fetch workout logs:", error)
    throw new Error("Could not retrieve workout logs")
  }
}

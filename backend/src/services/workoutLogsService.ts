import { and, eq, lt, desc, gte, lte, count, asc, sql } from "drizzle-orm"
import { db } from "../db"
import { workoutLogs } from "../db/schema/workoutLogs"
import { clearCache } from "../../lib/redis"
import { endOfMonth, format, startOfMonth, subMonths } from "date-fns"
import { workouts } from "../db/schema"

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

export async function getWorkoutLogsCalendar(
  userId: string,
  year: number,
  month: number
) {
  // Calculate the start of the previous month
  const prevMonthDate = new Date(year, month - 2, 1); // month - 1 is current month, month - 2 is previous
  const start = new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth(), 1);

  // Calculate the end of the next month
  const nextMonthDate = new Date(year, month, 1); // month is current month, month + 1 is next
  const end = new Date(nextMonthDate.getFullYear(), nextMonthDate.getMonth() + 1, 0, 23, 59, 59, 999); // last day of next month

  const logs = await db
    .select({
      id: workoutLogs.id,
      userId: workoutLogs.userId,
      workoutId: workoutLogs.workoutId,
      workoutName: workouts.name,
      notes: workoutLogs.notes,
      createdAt: workoutLogs.createdAt,
      updatedAt: workoutLogs.updatedAt,
    })
    .from(workoutLogs)
    .leftJoin(workouts, eq(workoutLogs.workoutId, workouts.id))
    .where(
      and(
        eq(workoutLogs.userId, userId),
        gte(workoutLogs.createdAt, start),
        lte(workoutLogs.createdAt, end)
      )
    )

  const grouped: Record<string, typeof logs> = {}

  for (const log of logs) {

    if (log.createdAt) {
      const dateKey = log.createdAt.toISOString().split("T")[0] // "2025-07-10"
      if (!grouped[dateKey]) grouped[dateKey] = []
      grouped[dateKey].push(log)
    }
  }

  return grouped
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
  return await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(workoutLogs)
      .values({
        id: fields.id || crypto.randomUUID(),
        userId,
        workoutId: fields.workoutId,
        workoutName: fields.workoutName,
        notes: fields.notes,
        createdAt: fields.createdAt || new Date(),
        updatedAt: fields.updatedAt || new Date(),
      })
      .returning()

    const res = await tx.execute(sql`SELECT pg_current_xact_id()::xid::text as txid`)
    const rows = res.rows as { txid: string }[]
    const txid = rows[0].txid

    return { ...created, txid: parseInt(txid) }
  })
}

export const updateWorkoutLog = async (
  id: string,
  userId: string,
  fields: any
) => {
  await clearCache([`userHomeData:${userId}`, `workoutLogs:list:${userId}:*`])

  return await db.transaction(async (tx) => {
    const updateData: any = {}
    if (fields.notes !== undefined) updateData.notes = fields.notes
    if (fields.workoutId !== undefined) updateData.workoutId = fields.workoutId
    if (fields.workoutName !== undefined) updateData.workoutName = fields.workoutName
    if (fields.createdAt !== undefined) updateData.createdAt = fields.createdAt
    if (fields.updatedAt !== undefined) updateData.updatedAt = fields.updatedAt

    const [updated] = await tx
      .update(workoutLogs)
      .set(updateData)
      .where(and(eq(workoutLogs.id, id), eq(workoutLogs.userId, userId)))
      .returning()

    if (!updated) return null

    const res = await tx.execute(sql`SELECT pg_current_xact_id()::xid::text as txid`)
    const rows = res.rows as { txid: string }[]
    const txid = rows[0].txid

    return { ...updated, txid: parseInt(txid) }
  })
}

export const deleteWorkoutLog = async (
  userId: string,
  workoutLogId: string
) => {
  await clearCache([`userHomeData:${userId}`, `workoutLogs:list:${userId}:*`])

  return await db.transaction(async (tx) => {
    const [deleted] = await tx
      .delete(workoutLogs)
      .where(and(eq(workoutLogs.id, workoutLogId), eq(workoutLogs.userId, userId)))
      .returning()

    if (!deleted) return null

    const res = await tx.execute(sql`SELECT pg_current_xact_id()::xid::text as txid`)
    const rows = res.rows as { txid: string }[]
    const txid = rows[0].txid

    return { ...deleted, txid: parseInt(txid) }
  })
}


export const getTimeWorkoutLogs = async (userId: string, month: number) => {
  try {
    const now = new Date()
    const startDate = startOfMonth(subMonths(now, month - 1))
    const endDate = endOfMonth(now)

    const result = await db
      .select({
        workoutType: workoutLogs.workoutName,
        count: count(workoutLogs.id),
      })
      .from(workoutLogs)
      .where(
        and(
          eq(workoutLogs.userId, userId),
          gte(workoutLogs.createdAt, startDate),
          lte(workoutLogs.createdAt, endDate)
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
          data,
        },
      ],
    }
  } catch (error) {
    console.error("Failed to fetch workout logs:", error)
    throw new Error("Could not retrieve workout logs")
  }
}

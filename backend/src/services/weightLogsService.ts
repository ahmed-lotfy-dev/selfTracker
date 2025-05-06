import { db } from "../db"
import { and, eq, desc, gte, lt, lte, or, sql } from "drizzle-orm"
import { weightLogs } from "../db/schema/weightLogs"
import type { User } from "../db/schema"
import { clearCache } from "../../lib/redis"

export const getWeightLogs = async (
  userId: string,
  cursor: string,
  limit: string | number
) => {
  const limitNumber = Number(limit) || 10

  const userWeightLogs = await db.query.weightLogs
    .findMany({
      where: cursor
        ? and(
            eq(weightLogs.userId, userId as string),
            lt(weightLogs.createdAt, new Date(cursor))
          )
        : eq(weightLogs.userId, userId as string),
      orderBy: desc(weightLogs.createdAt),
      limit: limitNumber + 1,
    })
    .prepare("getWeightLogs")
    .execute()
  // const userWeightLogs = await db
  //   .select({
  //     id: weightLogs.id,
  //     userId: weightLogs.userId,
  //     weight: weightLogs.weight,
  //     energy: weightLogs.energy,
  //     mood: weightLogs.mood,
  //     notes: weightLogs.notes,
  //     createdAt: weightLogs.createdAt,
  //   })
  //   .from(weightLogs)
  //   .where(
  //     cursor
  //       ? and(
  //           eq(weightLogs.userId, userId as string),
  //           lt(weightLogs.createdAt, new Date(cursor))
  //         )
  //       : eq(weightLogs.userId, userId as string)
  //   )
  //   .orderBy(desc(weightLogs.createdAt))
  //   .limit(limitNumber + 1)

  const hasMore = userWeightLogs.length > limitNumber
  const items = hasMore ? userWeightLogs.slice(0, -1) : userWeightLogs
  const nextCursor = hasMore
    ? items[items.length - 1]?.createdAt?.toISOString()
    : null

  return { items, nextCursor }
}

export const getSingleWeightLog = async (logId: string) => {
  const log = await db.query.weightLogs
    .findFirst({
      where: eq(weightLogs.id, logId),
    })
    .prepare("getSingleWeightLog")
    .execute()

  return log
}

export const createWeightLog = async (userId: string, fields: any) => {
  await clearCache([`userHomeData:${userId}`, `weightLogs:list:${userId}:*`])

  const [created] = await db
    .insert(weightLogs)
    .values({ userId, ...fields })
    .returning()
    .prepare("insertWeightLog")
    .execute()

  return created
}

export const updateWeightLog = async (
  id: string,
  userId: string,
  updatedFields: {}
) => {
  await clearCache([`userHomeData:${userId}`, `weightLogs:list:${userId}:*`])

  const [updated] = await db
    .update(weightLogs)
    .set(updatedFields)
    .where(and(eq(weightLogs.id, id), eq(weightLogs.userId, userId)))
    .returning()
    .prepare("insertWeightLog")
    .execute()

  return updated
}

export const deleteWeightLog = async (userId: string, weightLogId: string) => {
  await clearCache([`userHomeData:${userId}`, `weightLogs:list:${userId}:*`])

  const deletedWeight = await db
    .delete(weightLogs)
    .where(eq(weightLogs.id, weightLogId))
    .returning()

  return deletedWeight
}

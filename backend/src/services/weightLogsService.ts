import { and, eq, desc, gte, lt, lte, or, sql } from "drizzle-orm"
import { db } from "../db"
import { weightLogs } from "../db/schema/weightLogs"
import type { User } from "../db/schema"
import { clearCache } from "../../lib/redis"
import { format, subMonths } from "date-fns"
import { upsertEmbedding, deleteEmbedding, templateWeightLog } from "./embeddingHelper"

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

  const result = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(weightLogs)
      .values({
        id: fields.id || crypto.randomUUID(),
        userId: userId,
        weight: String(fields.weight),
        mood: fields.mood,
        energy: fields.energy,
        notes: fields.notes,
        createdAt: fields.createdAt || new Date(),
        updatedAt: fields.updatedAt || new Date(),
        deletedAt: fields.deletedAt,
      })
      .onConflictDoUpdate({
        target: weightLogs.id,
        set: {
          weight: String(fields.weight),
          mood: fields.mood,
          energy: fields.energy,
          notes: fields.notes,
          updatedAt: new Date(),
          deletedAt: fields.deletedAt,
        }
      })
      .returning()

    const res = await tx.execute(sql`SELECT pg_current_xact_id()::xid::text as txid`)
    const rows = res.rows as { txid: string }[]
    const txid = rows[0].txid

    return { ...created, txid: parseInt(txid) }
  })

  // Generate embedding asynchronously (don't block the response)
  upsertEmbedding({
    userId,
    resourceType: "weight_log",
    resourceId: result.id,
    content: templateWeightLog(result),
  }).catch(err => console.error('[Embedding] weight_log create failed:', err.message))

  return result
}

export const updateWeightLog = async (
  id: string,
  userId: string,
  updatedFields: any
) => {
  await clearCache([`userHomeData:${userId}`, `weightLogs:list:${userId}:*`])

  const result = await db.transaction(async (tx) => {
    const updateData: any = {}
    if (updatedFields.weight !== undefined) updateData.weight = String(updatedFields.weight)
    if (updatedFields.mood !== undefined) updateData.mood = updatedFields.mood
    if (updatedFields.energy !== undefined) updateData.energy = updatedFields.energy
    if (updatedFields.notes !== undefined) updateData.notes = updatedFields.notes
    if (updatedFields.createdAt !== undefined) updateData.createdAt = updatedFields.createdAt
    if (updatedFields.updatedAt !== undefined) updateData.updatedAt = updatedFields.updatedAt

    const [updated] = await tx
      .update(weightLogs)
      .set(updateData)
      .where(and(eq(weightLogs.id, id), eq(weightLogs.userId, userId)))
      .returning()

    if (!updated) return null

    const res = await tx.execute(sql`SELECT pg_current_xact_id()::xid::text as txid`)
    const rows = res.rows as { txid: string }[]
    const txid = rows[0].txid

    return { ...updated, txid: parseInt(txid) }
  })

  if (result) {
    upsertEmbedding({
      userId,
      resourceType: "weight_log",
      resourceId: result.id,
      content: templateWeightLog(result),
    }).catch(err => console.error('[Embedding] weight_log update failed:', err.message))
  }

  return result
}

export const deleteWeightLog = async (userId: string, weightLogId: string) => {
  await clearCache([`userHomeData:${userId}`, `weightLogs:list:${userId}:*`])

  const result = await db.transaction(async (tx) => {
    const [deleted] = await tx
      .delete(weightLogs)
      .where(and(eq(weightLogs.id, weightLogId), eq(weightLogs.userId, userId)))
      .returning()

    if (!deleted) return null

    const res = await tx.execute(sql`SELECT pg_current_xact_id()::xid::text as txid`)
    const rows = res.rows as { txid: string }[]
    const txid = rows[0].txid

    return { ...deleted, txid: parseInt(txid) }
  })

  // Remove embedding
  deleteEmbedding("weight_log", weightLogId).catch(err =>
    console.error('[Embedding] weight_log delete failed:', err.message)
  )

  return result
}

export const getTimeWeightLogs = async (userId: string, month: number) => {
  try {
    const now = new Date()

    const periodWeightLogs = await db
      .select()
      .from(weightLogs)
      .where(
        and(
          eq(weightLogs.userId, userId),
          gte(weightLogs.createdAt, subMonths(now, month)),
          lt(weightLogs.createdAt, now)
        )
      )
      .orderBy(weightLogs.createdAt)

    if (!periodWeightLogs.length) {
      return {
        labels: [],
        datasets: [{ data: [] }],
      }
    }

    const labels = periodWeightLogs.map((log) =>
      log.createdAt ? format(new Date(log.createdAt), "MMM d") : "Unknown"
    )

    const data = periodWeightLogs.map((log) => parseFloat(log.weight))

    return {
      labels,
      datasets: [
        {
          data,
        },
      ],
    }
  } catch (error) {
    console.error("Failed to fetch weight logs:", error)
    throw new Error("Could not retrieve weight logs")
  }
}

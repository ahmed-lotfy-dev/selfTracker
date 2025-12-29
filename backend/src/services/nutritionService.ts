import { and, desc, eq, sql, gte, lte } from "drizzle-orm"
import { db } from "../db"
import { foodLogs, nutritionGoals } from "../db/schema"
import type { FoodItem } from "../db/schema/foodLogs"

type MealType = "breakfast" | "lunch" | "dinner" | "snack"

export const getUserFoodLogs = async (
  userId: string,
  date?: Date,
  mealType?: MealType
) => {
  const conditions = [eq(foodLogs.userId, userId)]

  if (date) {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)
    conditions.push(gte(foodLogs.loggedAt, startOfDay))
    conditions.push(lte(foodLogs.loggedAt, endOfDay))
  }

  if (mealType) {
    conditions.push(eq(foodLogs.mealType, mealType))
  }

  return await db.query.foodLogs.findMany({
    where: and(...conditions),
    orderBy: desc(foodLogs.loggedAt),
  })
}

export const createFoodLog = async (
  userId: string,
  fields: {
    id?: string
    loggedAt: Date
    mealType: "breakfast" | "lunch" | "dinner" | "snack"
    foodItems: FoodItem[]
    totalCalories: number
    totalProtein?: number
    totalCarbs?: number
    totalFat?: number
    createdAt?: Date
    updatedAt?: Date
  }
) => {
  return await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(foodLogs)
      .values({
        id: fields.id || crypto.randomUUID(),
        userId,
        loggedAt: fields.loggedAt,
        mealType: fields.mealType,
        foodItems: fields.foodItems,
        totalCalories: fields.totalCalories,
        totalProtein: fields.totalProtein,
        totalCarbs: fields.totalCarbs,
        totalFat: fields.totalFat,
        createdAt: fields.createdAt || new Date(),
        updatedAt: fields.updatedAt || new Date(),
      })
      .onConflictDoUpdate({
        target: foodLogs.id,
        set: {
          loggedAt: fields.loggedAt,
          mealType: fields.mealType,
          foodItems: fields.foodItems,
          totalCalories: fields.totalCalories,
          totalProtein: fields.totalProtein,
          totalCarbs: fields.totalCarbs,
          totalFat: fields.totalFat,
          updatedAt: new Date(),
        },
      })
      .returning()

    const res = await tx.execute(sql`SELECT pg_current_xact_id()::xid::text as txid`)
    const rows = res.rows as { txid: string }[]
    const txid = rows[0].txid

    return { ...created, txid: parseInt(txid) }
  })
}

export const updateFoodLog = async (
  id: string,
  userId: string,
  fields: Partial<{
    loggedAt: Date
    mealType: "breakfast" | "lunch" | "dinner" | "snack"
    foodItems: FoodItem[]
    totalCalories: number
    totalProtein: number
    totalCarbs: number
    totalFat: number
  }>
) => {
  return await db.transaction(async (tx) => {
    const updateData: any = {}
    if (fields.loggedAt !== undefined) updateData.loggedAt = fields.loggedAt
    if (fields.mealType !== undefined) updateData.mealType = fields.mealType
    if (fields.foodItems !== undefined) updateData.foodItems = fields.foodItems
    if (fields.totalCalories !== undefined) updateData.totalCalories = fields.totalCalories
    if (fields.totalProtein !== undefined) updateData.totalProtein = fields.totalProtein
    if (fields.totalCarbs !== undefined) updateData.totalCarbs = fields.totalCarbs
    if (fields.totalFat !== undefined) updateData.totalFat = fields.totalFat
    updateData.updatedAt = new Date()

    const [updated] = await tx
      .update(foodLogs)
      .set(updateData)
      .where(and(eq(foodLogs.id, id), eq(foodLogs.userId, userId)))
      .returning()

    if (!updated) return null

    const res = await tx.execute(sql`SELECT pg_current_xact_id()::xid::text as txid`)
    const rows = res.rows as { txid: string }[]
    const txid = rows[0].txid

    return { ...updated, txid: parseInt(txid) }
  })
}

export const deleteFoodLog = async (userId: string, foodLogId: string) => {
  return await db.transaction(async (tx) => {
    const [deleted] = await tx
      .delete(foodLogs)
      .where(and(eq(foodLogs.id, foodLogId), eq(foodLogs.userId, userId)))
      .returning()

    if (!deleted) return null

    const res = await tx.execute(sql`SELECT pg_current_xact_id()::xid::text as txid`)
    const rows = res.rows as { txid: string }[]
    const txid = rows[0].txid

    return { ...deleted, txid: parseInt(txid) }
  })
}

export const getUserNutritionGoals = async (userId: string) => {
  return await db.query.nutritionGoals.findFirst({
    where: eq(nutritionGoals.userId, userId),
  })
}

export const upsertNutritionGoals = async (
  userId: string,
  fields: {
    dailyCalories: number
    proteinGrams?: number
    carbsGrams?: number
    fatGrams?: number
  }
) => {
  return await db.transaction(async (tx) => {
    const existing = await tx.query.nutritionGoals.findFirst({
      where: eq(nutritionGoals.userId, userId),
    })

    if (existing) {
      const [updated] = await tx
        .update(nutritionGoals)
        .set({
          dailyCalories: fields.dailyCalories,
          proteinGrams: fields.proteinGrams,
          carbsGrams: fields.carbsGrams,
          fatGrams: fields.fatGrams,
          updatedAt: new Date(),
        })
        .where(eq(nutritionGoals.id, existing.id))
        .returning()
      return updated
    }

    const [created] = await tx
      .insert(nutritionGoals)
      .values({
        id: crypto.randomUUID(),
        userId,
        dailyCalories: fields.dailyCalories,
        proteinGrams: fields.proteinGrams,
        carbsGrams: fields.carbsGrams,
        fatGrams: fields.fatGrams,
      })
      .returning()
    return created
  })
}

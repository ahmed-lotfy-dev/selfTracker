import { db } from "@/src/db/client"
import { userGoals } from "@/src/db/schema"
import { desc, eq, isNull } from "drizzle-orm"
import { createId } from "@paralleldrive/cuid2"
import { addToSyncQueue } from "@/src/services/sync"

export type Goal = typeof userGoals.$inferSelect
export type NewGoal = typeof userGoals.$inferInsert

export const fetchGoals = async (userId: string) => {
  const goals = await db
    .select()
    .from(userGoals)
    .where(eq(userGoals.userId, userId)) // Filter by user, though usually we only have one user locally
    // .where(isNull(userGoals.deletedAt)) // Add if we want soft delete logic, previously schema showed deletedAt
    .orderBy(desc(userGoals.createdAt))

  // Filter out deleted ones if soft delete is used
  return goals.filter(g => !g.deletedAt)
}

export const createGoal = async (goal: Omit<NewGoal, "id" | "createdAt" | "updatedAt">) => {
  const id = createId()
  const now = new Date()

  const newGoal: NewGoal = {
    ...goal,
    id,
    createdAt: now.toISOString(),
    updatedAt: now,
    // achieved: goal.achieved ?? false, // Handled by default
    syncStatus: "pending",
  }

  await db.insert(userGoals).values(newGoal)
  await addToSyncQueue("INSERT", "user_goals", id, newGoal)
  return newGoal
}

export const updateGoal = async (goal: Partial<Goal> & { id: string }) => {
  const now = new Date()
  const updateData: Partial<Goal> = {
    ...goal,
    updatedAt: now,
    syncStatus: "pending",
  }

  await db.update(userGoals).set(updateData).where(eq(userGoals.id, goal.id))
  await addToSyncQueue("UPDATE", "user_goals", goal.id, updateData)
  return { id: goal.id, ...updateData }
}

export const deleteGoal = async (goalId: string) => {
  const now = new Date()
  // Soft delete
  await db.update(userGoals).set({
    deletedAt: now,
    updatedAt: now,
    syncStatus: "pending",
  }).where(eq(userGoals.id, goalId))

  await addToSyncQueue("DELETE", "user_goals", goalId, { id: goalId })
}

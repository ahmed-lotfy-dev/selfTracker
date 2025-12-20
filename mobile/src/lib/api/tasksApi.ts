import { db } from "@/src/db/client"
import { tasks } from "@/src/db/schema"
import { desc, eq, isNull } from "drizzle-orm"
import { TaskType } from "@/src/types/taskType"
import { createId } from "@paralleldrive/cuid2"
import { addToSyncQueue, pushChanges } from "@/src/services/sync"
import * as Network from "expo-network"

const silentSync = async () => {
  try {
    const networkState = await Network.getNetworkStateAsync()
    if (networkState.isConnected && networkState.isInternetReachable) {
      await pushChanges()
    }
  } catch { }
}

export const fetchAllTasks = async () => {
  const localTasks = await db
    .select()
    .from(tasks)
    .where(isNull(tasks.deletedAt))
    .orderBy(desc(tasks.createdAt))

  return localTasks
}

export const fetchSingleTask = async (taskId: string) => {
  const local = await db.select().from(tasks).where(eq(tasks.id, taskId))
  if (local.length > 0) return local[0]
  throw new Error("Task not found")
}

export const createTask = async (task: TaskType) => {
  const id = createId()
  const now = new Date()

  const newTask = {
    id,
    userId: task.userId,
    title: task.title,
    completed: task.completed ?? false,
    dueDate: task.dueDate ? new Date(task.dueDate) : null,
    category: task.category || "general",
    createdAt: task.createdAt ? new Date(task.createdAt) : now,
    updatedAt: now,
    syncStatus: "pending" as const,
  }

  await db.insert(tasks).values(newTask)
  await addToSyncQueue("INSERT", "tasks", id, newTask)
  silentSync()

  return newTask
}

export const updateTask = async (task: Partial<TaskType> & { id: string }) => {
  console.log("updateTask called with:", task)
  if (!task.id) throw new Error("Task ID required")

  try {
    const now = new Date()
    const updateData: any = {
      updatedAt: now,
      syncStatus: "pending" as const,
    }

    if (task.title !== undefined) updateData.title = task.title
    if (task.completed !== undefined) updateData.completed = task.completed
    if (task.dueDate !== undefined) updateData.dueDate = task.dueDate
    if (task.category !== undefined) updateData.category = task.category

    // Use a fresh Date object to avoid any prototype issues with 'now' if it came from weird source
    // Although 'now' was created right above.
    // The issue is likely 'updateData' being 'any'.

    // Explicitly casting to ensure Drizzle knows what to do

    // NOTE: expo-sqlite sometimes fails if you pass undefined in a binding position
    // Drizzle should handle this, but let's be super safe.

    const finalUpdateData = {
      ...updateData,
      updatedAt: new Date(), // Re-instantiate to be sure
    }

    console.log("[DEBUG] Executing db.update with sanitized data")

    await db.update(tasks)
      .set(finalUpdateData)
      .where(eq(tasks.id, task.id))

    console.log("[DEBUG] Task updated in local DB, adding to sync queue...")

    await addToSyncQueue("UPDATE", "tasks", task.id, {
      ...task,
      ...finalUpdateData,
      // Ensure date objects are serialized for JSON column in syncQueue
      updatedAt: finalUpdateData.updatedAt.toISOString(),
      createdAt: typeof task.createdAt === 'object' ? (task.createdAt as any).toISOString() : task.createdAt
    })

    console.log("[DEBUG] Added to sync queue successfully")
    silentSync()

    return { ...task, ...finalUpdateData }
  } catch (e) {
    console.error("updateTask failed:", e)
    throw e
  }
}

export const deleteTask = async (taskId: string) => {
  const now = new Date()

  await db.update(tasks).set({
    deletedAt: now,
    updatedAt: now,
    syncStatus: "pending",
  }).where(eq(tasks.id, taskId))

  await addToSyncQueue("DELETE", "tasks", taskId, { id: taskId })
  silentSync()

  return { success: true }
}

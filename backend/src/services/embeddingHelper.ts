import { and, eq } from "drizzle-orm"
import { db } from "../db"
import { embeddings } from "../db/schema/embeddings"
import { generateEmbedding } from "./embedding"

// Content templates for each resource type
export function templateWeightLog(log: any): string {
  const date = log.createdAt
    ? new Date(log.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Unknown date"
  const notes = log.notes ? ` Notes: ${log.notes}` : ""
  return `On ${date} you recorded a weight of ${log.weight} kg.${notes}`
}

export function templateWorkoutLog(log: any): string {
  const date = log.createdAt
    ? new Date(log.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Unknown date"
  const notes = log.notes ? ` Notes: ${log.notes}` : ""
  return `On ${date} you did a ${log.workoutName || "workout"} session.${notes}`
}

export function templateWorkoutExercise(ex: any, exerciseName?: string): string {
  const name = exerciseName || ex.exerciseId || "Unknown exercise"
  return `You did ${name}: ${ex.sets} sets × ${ex.reps} reps at ${ex.weight} kg.`
}

export function templateFoodLog(log: any): string {
  const date = log.loggedAt
    ? new Date(log.loggedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Unknown date"
  const items = log.foodItems?.map((f: any) => f.name).join(", ") || "food"
  return `On ${date} for ${log.mealType || "a meal"} you ate ${items} (${log.totalCalories || 0} calories).`
}

export function templateHabit(habit: any): string {
  const desc = habit.description ? ` Description: ${habit.description}` : ""
  return `Your habit '${habit.name}' has a ${habit.streak || 0}-day streak.${desc}`
}

export function templateTask(task: any): string {
  const status = task.completed ? "completed" : "pending"
  const desc = task.description ? ` — ${task.description}` : ""
  return `Task: ${task.title}${desc}. Status: ${status}. Priority: ${task.priority || "medium"}.`
}

export function templateTrainingSplit(split: any): string {
  const desc = split.description ? ` Description: ${split.description}` : ""
  return `Training split: ${split.name}.${desc}`
}

export function templateUserGoal(goal: any): string {
  const deadline = goal.deadline
    ? ` Deadline: ${new Date(goal.deadline).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`
    : ""
  return `Goal: ${goal.goalType}. Target: ${goal.targetValue}.${deadline}`
}

// Upsert embedding for a resource
export async function upsertEmbedding(params: {
  userId: string
  resourceType: string
  resourceId: string
  content: string
}) {
  const embedding = await generateEmbedding(params.content, "passage")

  await db
    .insert(embeddings)
    .values({
      userId: params.userId,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      content: params.content,
      embedding,
    })
    .onConflictDoUpdate({
      target: [embeddings.resourceType, embeddings.resourceId],
      set: {
        content: params.content,
        embedding,
        updatedAt: new Date(),
      },
    })
}

// Delete embedding for a resource
export async function deleteEmbedding(
  resourceType: string,
  resourceId: string
) {
  await db
    .delete(embeddings)
    .where(
      and(
        eq(embeddings.resourceType, resourceType),
        eq(embeddings.resourceId, resourceId)
      )
    )
}

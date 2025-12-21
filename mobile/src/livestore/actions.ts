import { nanoid } from '@livestore/livestore'
import { events, tables } from './schema'

export function createTaskEvent(userId: string, title: string, category: string, options?: { description?: string, dueDate?: Date, priority?: string }) {
  return events.taskCreated({
    id: nanoid(),
    userId,
    title,
    category,
    description: options?.description,
    dueDate: options?.dueDate,
    priority: options?.priority,
    createdAt: new Date(),
  })
}

export function updateTaskEvent(id: string, updates: { title?: string, description?: string, dueDate?: Date, priority?: string }) {
  return events.taskUpdated({
    id,
    title: updates.title,
    description: updates.description,
    dueDate: updates.dueDate,
    priority: updates.priority,
    updatedAt: new Date(),
  })
}

export function completeTaskEvent(id: string) {
  return events.taskCompleted({ id, updatedAt: new Date() })
}

export function uncompleteTaskEvent(id: string) {
  return events.taskUncompleted({ id, updatedAt: new Date() })
}

export function deleteTaskEvent(id: string) {
  return events.taskDeleted({ id, deletedAt: new Date() })
}

export function createWeightLogEvent(userId: string, weight: string, options?: { mood?: string, energy?: string, notes?: string, createdAt?: Date }) {
  return events.weightLogCreated({
    id: nanoid(),
    userId,
    weight,
    mood: options?.mood,
    energy: options?.energy,
    notes: options?.notes,
    createdAt: options?.createdAt ?? new Date(),
  })
}

export function updateWeightLogEvent(id: string, updates: { weight?: string, mood?: string, energy?: string, notes?: string }) {
  return events.weightLogUpdated({
    id,
    weight: updates.weight,
    mood: updates.mood,
    energy: updates.energy,
    notes: updates.notes,
    updatedAt: new Date(),
  })
}

export function deleteWeightLogEvent(id: string) {
  return events.weightLogDeleted({ id, deletedAt: new Date() })
}

export function createWorkoutLogEvent(userId: string, workoutId: string, workoutName: string, options?: { notes?: string, createdAt?: Date }) {
  return events.workoutLogCreated({
    id: nanoid(),
    userId,
    workoutId,
    workoutName,
    notes: options?.notes,
    createdAt: options?.createdAt ?? new Date(),
  })
}

export function updateWorkoutLogEvent(id: string, notes?: string) {
  return events.workoutLogUpdated({
    id,
    notes,
    updatedAt: new Date(),
  })
}

export function deleteWorkoutLogEvent(id: string) {
  return events.workoutLogDeleted({ id, deletedAt: new Date() })
}

export function createGoalEvent(userId: string, goalType: string, targetValue: string, deadline?: Date) {
  return events.goalCreated({
    id: nanoid(),
    userId,
    goalType,
    targetValue,
    deadline,
    createdAt: new Date(),
  })
}

export function updateGoalEvent(id: string, updates: { targetValue?: string, deadline?: Date, achieved?: boolean }) {
  return events.goalUpdated({
    id,
    targetValue: updates.targetValue,
    deadline: updates.deadline,
    achieved: updates.achieved,
    updatedAt: new Date(),
  })
}

export function deleteGoalEvent(id: string) {
  return events.goalDeleted({ id, deletedAt: new Date() })
}

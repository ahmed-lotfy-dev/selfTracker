import { nanoid } from '@livestore/livestore'
import { events } from './schema'
import { formatUTC } from './../lib/utils/dateUtils'

export function createTaskEvent(userId: string, title: string, category: string, options?: { description?: string, dueDate?: string | Date, priority?: string }) {
  return events.taskCreated({
    id: nanoid(),
    userId,
    title,
    category,
    description: options?.description,
    dueDate: options?.dueDate ? formatUTC(options.dueDate) : undefined,
    priority: options?.priority,
    createdAt: formatUTC(new Date()),
  })
}

export function updateTaskEvent(id: string, updates: { title?: string, description?: string, dueDate?: string | Date, priority?: string }) {
  return events.taskUpdated({
    id,
    title: updates.title,
    description: updates.description,
    dueDate: updates.dueDate ? formatUTC(updates.dueDate) : undefined,
    priority: updates.priority,
    updatedAt: formatUTC(new Date()),
  })
}

export function completeTaskEvent(id: string) {
  return events.taskCompleted({ id, updatedAt: formatUTC(new Date()) })
}

export function uncompleteTaskEvent(id: string) {
  return events.taskUncompleted({ id, updatedAt: formatUTC(new Date()) })
}

export function deleteTaskEvent(id: string) {
  return events.taskDeleted({ id, deletedAt: formatUTC(new Date()) })
}

export function createWeightLogEvent(userId: string, weight: string, options?: { mood?: string, energy?: string, notes?: string, createdAt?: string | Date }) {
  return events.weightLogCreated({
    id: nanoid(),
    userId,
    weight,
    mood: options?.mood,
    energy: options?.energy,
    notes: options?.notes,
    createdAt: formatUTC(options?.createdAt ?? new Date()),
  })
}

export function updateWeightLogEvent(id: string, updates: { weight?: string, mood?: string, energy?: string, notes?: string }) {
  return events.weightLogUpdated({
    id,
    weight: updates.weight,
    mood: updates.mood,
    energy: updates.energy,
    notes: updates.notes,
    updatedAt: formatUTC(new Date()),
  })
}

export function deleteWeightLogEvent(id: string) {
  return events.weightLogDeleted({ id, deletedAt: formatUTC(new Date()) })
}

export function createWorkoutLogEvent(userId: string, workoutId: string, workoutName: string, options?: { notes?: string, createdAt?: string | Date }) {
  return events.workoutLogCreated({
    id: nanoid(),
    userId,
    workoutId,
    workoutName,
    notes: options?.notes,
    createdAt: formatUTC(options?.createdAt ?? new Date()),
  })
}

export function updateWorkoutLogEvent(id: string, notes?: string) {
  return events.workoutLogUpdated({
    id,
    notes,
    updatedAt: formatUTC(new Date()),
  })
}

export function deleteWorkoutLogEvent(id: string) {
  return events.workoutLogDeleted({ id, deletedAt: formatUTC(new Date()) })
}

export function createGoalEvent(userId: string, goalType: string, targetValue: string, deadline?: string | Date) {
  return events.goalCreated({
    id: nanoid(),
    userId,
    goalType,
    targetValue,
    deadline: deadline ? formatUTC(deadline) : undefined,
    createdAt: formatUTC(new Date()),
  })
}

export function updateGoalEvent(id: string, updates: { targetValue?: string, deadline?: string | Date, achieved?: boolean }) {
  return events.goalUpdated({
    id,
    targetValue: updates.targetValue,
    deadline: updates.deadline ? formatUTC(updates.deadline) : undefined,
    achieved: updates.achieved,
    updatedAt: formatUTC(new Date()),
  })
}

export function deleteGoalEvent(id: string) {
  return events.goalDeleted({ id, deletedAt: formatUTC(new Date()) })
}

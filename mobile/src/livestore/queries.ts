import { queryDb } from '@livestore/livestore'
import { tables, events } from './schema'

export const allTasks$ = queryDb(
  () => tables.tasks.where({ deletedAt: null }),
  { label: 'allTasks' }
)

export const activeTasks$ = queryDb(
  () => tables.tasks.where({ deletedAt: null, completed: false }),
  { label: 'activeTasks' }
)

export const completedTasks$ = queryDb(
  () => tables.tasks.where({ deletedAt: null, completed: true }),
  { label: 'completedTasks' }
)

export const allWeightLogs$ = queryDb(
  () => tables.weightLogs.where({ deletedAt: null }),
  { label: 'allWeightLogs' }
)

export const allWorkoutLogs$ = queryDb(
  () => tables.workoutLogs.where({ deletedAt: null }),
  { label: 'allWorkoutLogs' }
)

export const allGoals$ = queryDb(
  () => tables.userGoals.where({ deletedAt: null }),
  { label: 'allGoals' }
)

export const uiState$ = queryDb(
  () => tables.uiState,
  { label: 'uiState' }
)

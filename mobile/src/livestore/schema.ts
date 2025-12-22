import { Events, makeSchema, Schema, SessionIdSymbol, State } from '@livestore/livestore'

export const tables = {
  workoutLogs: State.SQLite.table({
    name: 'workout_logs',
    columns: {
      id: State.SQLite.text({ primaryKey: true }),
      userId: State.SQLite.text({ nullable: false }),
      workoutId: State.SQLite.text({ nullable: false }),
      workoutName: State.SQLite.text({ nullable: false }),
      notes: State.SQLite.text({ nullable: true }),
      createdAt: State.SQLite.integer({ nullable: false, schema: Schema.DateFromNumber }),
      updatedAt: State.SQLite.integer({ nullable: true, schema: Schema.DateFromNumber }),
      deletedAt: State.SQLite.integer({ nullable: true, schema: Schema.DateFromNumber }),
    },
  }),

  weightLogs: State.SQLite.table({
    name: 'weight_logs',
    columns: {
      id: State.SQLite.text({ primaryKey: true }),
      userId: State.SQLite.text({ nullable: false }),
      weight: State.SQLite.text({ nullable: false }),
      mood: State.SQLite.text({ nullable: true }),
      energy: State.SQLite.text({ nullable: true }),
      notes: State.SQLite.text({ nullable: true }),
      createdAt: State.SQLite.integer({ nullable: false, schema: Schema.DateFromNumber }),
      updatedAt: State.SQLite.integer({ nullable: true, schema: Schema.DateFromNumber }),
      deletedAt: State.SQLite.integer({ nullable: true, schema: Schema.DateFromNumber }),
    },
  }),

  tasks: State.SQLite.table({
    name: 'tasks',
    columns: {
      id: State.SQLite.text({ primaryKey: true }),
      userId: State.SQLite.text({ nullable: false }),
      projectId: State.SQLite.text({ nullable: true }),
      columnId: State.SQLite.text({ nullable: true }),
      title: State.SQLite.text({ nullable: false }),
      description: State.SQLite.text({ nullable: true }),
      completed: State.SQLite.boolean({ default: false }),
      dueDate: State.SQLite.integer({ nullable: true, schema: Schema.DateFromNumber }),
      priority: State.SQLite.text({ default: 'medium' }),
      order: State.SQLite.integer({ default: 0 }),
      category: State.SQLite.text({ nullable: false }),
      createdAt: State.SQLite.integer({ nullable: false, schema: Schema.DateFromNumber }),
      updatedAt: State.SQLite.integer({ nullable: true, schema: Schema.DateFromNumber }),
      deletedAt: State.SQLite.integer({ nullable: true, schema: Schema.DateFromNumber }),
    },
  }),

  workouts: State.SQLite.table({
    name: 'workouts',
    columns: {
      id: State.SQLite.text({ primaryKey: true }),
      userId: State.SQLite.text({ nullable: true }),
      name: State.SQLite.text({ nullable: false }),
      trainingSplitId: State.SQLite.text({ nullable: true }),
      createdAt: State.SQLite.integer({ nullable: true, schema: Schema.DateFromNumber }),
      updatedAt: State.SQLite.integer({ nullable: true, schema: Schema.DateFromNumber }),
      deletedAt: State.SQLite.integer({ nullable: true, schema: Schema.DateFromNumber }),
    },
  }),

  projects: State.SQLite.table({
    name: 'projects',
    columns: {
      id: State.SQLite.text({ primaryKey: true }),
      userId: State.SQLite.text({ nullable: false }),
      name: State.SQLite.text({ nullable: false }),
      color: State.SQLite.text({ default: '#000000' }),
      isArchived: State.SQLite.boolean({ default: false }),
      createdAt: State.SQLite.integer({ nullable: true, schema: Schema.DateFromNumber }),
      updatedAt: State.SQLite.integer({ nullable: true, schema: Schema.DateFromNumber }),
      deletedAt: State.SQLite.integer({ nullable: true, schema: Schema.DateFromNumber }),
    },
  }),

  projectColumns: State.SQLite.table({
    name: 'project_columns',
    columns: {
      id: State.SQLite.text({ primaryKey: true }),
      projectId: State.SQLite.text({ nullable: false }),
      name: State.SQLite.text({ nullable: false }),
      order: State.SQLite.integer({ default: 0 }),
      type: State.SQLite.text({ default: 'todo' }),
      createdAt: State.SQLite.integer({ nullable: true, schema: Schema.DateFromNumber }),
      updatedAt: State.SQLite.integer({ nullable: true, schema: Schema.DateFromNumber }),
      deletedAt: State.SQLite.integer({ nullable: true, schema: Schema.DateFromNumber }),
    },
  }),

  userGoals: State.SQLite.table({
    name: 'user_goals',
    columns: {
      id: State.SQLite.text({ primaryKey: true }),
      userId: State.SQLite.text({ nullable: false }),
      goalType: State.SQLite.text({ nullable: false }),
      targetValue: State.SQLite.text({ nullable: false }),
      deadline: State.SQLite.integer({ nullable: true, schema: Schema.DateFromNumber }),
      achieved: State.SQLite.boolean({ default: false }),
      createdAt: State.SQLite.integer({ nullable: false, schema: Schema.DateFromNumber }),
      updatedAt: State.SQLite.integer({ nullable: true, schema: Schema.DateFromNumber }),
      deletedAt: State.SQLite.integer({ nullable: true, schema: Schema.DateFromNumber }),
    },
  }),

  exercises: State.SQLite.table({
    name: 'exercises',
    columns: {
      id: State.SQLite.text({ primaryKey: true }),
      name: State.SQLite.text({ nullable: false }),
      description: State.SQLite.text({ nullable: true }),
      createdAt: State.SQLite.integer({ nullable: true, schema: Schema.DateFromNumber }),
      updatedAt: State.SQLite.integer({ nullable: true, schema: Schema.DateFromNumber }),
      deletedAt: State.SQLite.integer({ nullable: true, schema: Schema.DateFromNumber }),
    },
  }),

  trainingSplits: State.SQLite.table({
    name: 'training_splits',
    columns: {
      id: State.SQLite.text({ primaryKey: true }),
      name: State.SQLite.text({ nullable: false }),
      description: State.SQLite.text({ nullable: true }),
      createdBy: State.SQLite.text({ nullable: true }),
      isPublic: State.SQLite.boolean({ default: true }),
      createdAt: State.SQLite.integer({ nullable: true, schema: Schema.DateFromNumber }),
      updatedAt: State.SQLite.integer({ nullable: true, schema: Schema.DateFromNumber }),
      deletedAt: State.SQLite.integer({ nullable: true, schema: Schema.DateFromNumber }),
    },
  }),

  workoutExercises: State.SQLite.table({
    name: 'workout_exercises',
    columns: {
      id: State.SQLite.text({ primaryKey: true }),
      workoutId: State.SQLite.text({ nullable: false }),
      exerciseId: State.SQLite.text({ nullable: false }),
      sets: State.SQLite.integer({ nullable: false }),
      reps: State.SQLite.integer({ nullable: false }),
      weight: State.SQLite.text({ nullable: false }),
      createdAt: State.SQLite.integer({ nullable: true, schema: Schema.DateFromNumber }),
      updatedAt: State.SQLite.integer({ nullable: true, schema: Schema.DateFromNumber }),
      deletedAt: State.SQLite.integer({ nullable: true, schema: Schema.DateFromNumber }),
    },
  }),

  expenses: State.SQLite.table({
    name: 'expenses',
    columns: {
      id: State.SQLite.text({ primaryKey: true }),
      userId: State.SQLite.text({ nullable: false }),
      category: State.SQLite.text({ nullable: false }),
      amount: State.SQLite.text({ nullable: false }),
      description: State.SQLite.text({ nullable: true }),
      createdAt: State.SQLite.integer({ nullable: true, schema: Schema.DateFromNumber }),
      updatedAt: State.SQLite.integer({ nullable: true, schema: Schema.DateFromNumber }),
      deletedAt: State.SQLite.integer({ nullable: true, schema: Schema.DateFromNumber }),
    },
  }),

  timerSessions: State.SQLite.table({
    name: 'timer_sessions',
    columns: {
      id: State.SQLite.text({ primaryKey: true }),
      userId: State.SQLite.text({ nullable: false }),
      taskId: State.SQLite.text({ nullable: true }),
      startTime: State.SQLite.integer({ nullable: false, schema: Schema.DateFromNumber }),
      endTime: State.SQLite.integer({ nullable: true, schema: Schema.DateFromNumber }),
      duration: State.SQLite.integer({ nullable: true }),
      type: State.SQLite.text({ default: 'focus' }),
      completed: State.SQLite.boolean({ default: false }),
      createdAt: State.SQLite.integer({ nullable: true, schema: Schema.DateFromNumber }),
      updatedAt: State.SQLite.integer({ nullable: true, schema: Schema.DateFromNumber }),
      deletedAt: State.SQLite.integer({ nullable: true, schema: Schema.DateFromNumber }),
    },
  }),

  uiState: State.SQLite.clientDocument({
    name: 'uiState',
    schema: Schema.Struct({
      selectedDate: Schema.optional(Schema.String),
      filter: Schema.Literal('all', 'active', 'completed'),
    }),
    default: { id: SessionIdSymbol, value: { selectedDate: undefined, filter: 'all' } },
  }),
}

export const events = {
  workoutLogCreated: Events.synced({
    name: 'v1.WorkoutLogCreated',
    schema: Schema.Struct({ id: Schema.String, userId: Schema.String, workoutId: Schema.String, workoutName: Schema.String, notes: Schema.optional(Schema.String), createdAt: Schema.String }),
  }),
  workoutLogUpdated: Events.synced({
    name: 'v1.WorkoutLogUpdated',
    schema: Schema.Struct({ id: Schema.String, notes: Schema.optional(Schema.String), updatedAt: Schema.String }),
  }),
  workoutLogDeleted: Events.synced({
    name: 'v1.WorkoutLogDeleted',
    schema: Schema.Struct({ id: Schema.String, deletedAt: Schema.String }),
  }),

  weightLogCreated: Events.synced({
    name: 'v1.WeightLogCreated',
    schema: Schema.Struct({ id: Schema.String, userId: Schema.String, weight: Schema.String, mood: Schema.optional(Schema.String), energy: Schema.optional(Schema.String), notes: Schema.optional(Schema.String), createdAt: Schema.String }),
  }),
  weightLogUpdated: Events.synced({
    name: 'v1.WeightLogUpdated',
    schema: Schema.Struct({ id: Schema.String, weight: Schema.optional(Schema.String), mood: Schema.optional(Schema.String), energy: Schema.optional(Schema.String), notes: Schema.optional(Schema.String), updatedAt: Schema.String }),
  }),
  weightLogDeleted: Events.synced({
    name: 'v1.WeightLogDeleted',
    schema: Schema.Struct({ id: Schema.String, deletedAt: Schema.String }),
  }),

  taskCreated: Events.synced({
    name: 'v1.TaskCreated',
    schema: Schema.Struct({ id: Schema.String, userId: Schema.String, title: Schema.String, category: Schema.String, description: Schema.optional(Schema.String), dueDate: Schema.optional(Schema.String), priority: Schema.optional(Schema.String), createdAt: Schema.String }),
  }),
  taskUpdated: Events.synced({
    name: 'v1.TaskUpdated',
    schema: Schema.Struct({ id: Schema.String, title: Schema.optional(Schema.String), description: Schema.optional(Schema.String), dueDate: Schema.optional(Schema.String), priority: Schema.optional(Schema.String), updatedAt: Schema.String }),
  }),
  taskCompleted: Events.synced({
    name: 'v1.TaskCompleted',
    schema: Schema.Struct({ id: Schema.String, updatedAt: Schema.String }),
  }),
  taskUncompleted: Events.synced({
    name: 'v1.TaskUncompleted',
    schema: Schema.Struct({ id: Schema.String, updatedAt: Schema.String }),
  }),
  taskDeleted: Events.synced({
    name: 'v1.TaskDeleted',
    schema: Schema.Struct({ id: Schema.String, deletedAt: Schema.String }),
  }),

  goalCreated: Events.synced({
    name: 'v1.GoalCreated',
    schema: Schema.Struct({ id: Schema.String, userId: Schema.String, goalType: Schema.String, targetValue: Schema.String, deadline: Schema.optional(Schema.String), createdAt: Schema.String }),
  }),
  goalUpdated: Events.synced({
    name: 'v1.GoalUpdated',
    schema: Schema.Struct({ id: Schema.String, targetValue: Schema.optional(Schema.String), deadline: Schema.optional(Schema.String), achieved: Schema.optional(Schema.Boolean), updatedAt: Schema.String }),
  }),
  goalDeleted: Events.synced({
    name: 'v1.GoalDeleted',
    schema: Schema.Struct({ id: Schema.String, deletedAt: Schema.String }),
  }),

  uiStateSet: tables.uiState.set,
}

const materializers = State.SQLite.materializers(events, {
  'v1.WorkoutLogCreated': (params) => {
    try {
      const { id, userId, workoutId, workoutName, notes, createdAt } = params
      console.log(`[LiveStore] Materializing WorkoutLogCreated: ${id} (${workoutName})`)
      return tables.workoutLogs.insert({
        id: String(id),
        userId: String(userId),
        workoutId: String(workoutId),
        workoutName: String(workoutName),
        notes,
        createdAt: new Date(createdAt),
        deletedAt: null,
        updatedAt: null
      })
    } catch (e) {
      console.error(`[LiveStore] Materializer Error (WorkoutLogCreated):`, e)
      return []
    }
  },
  'v1.WorkoutLogUpdated': ({ id, notes, updatedAt }) =>
    tables.workoutLogs.update({ notes, updatedAt: new Date(updatedAt) }).where({ id }),
  'v1.WorkoutLogDeleted': ({ id, deletedAt }) =>
    tables.workoutLogs.update({ deletedAt: new Date(deletedAt) }).where({ id }),

  'v1.WeightLogCreated': (params) => {
    try {
      const { id, userId, weight, mood, energy, notes, createdAt } = params
      console.log(`[LiveStore] Materializing WeightLogCreated: ${id} (${weight}kg)`)
      return tables.weightLogs.insert({
        id: String(id),
        userId: String(userId),
        weight: String(weight),
        mood, energy, notes,
        createdAt: new Date(createdAt),
        deletedAt: null,
        updatedAt: null
      })
    } catch (e) {
      console.error(`[LiveStore] Materializer Error (WeightLogCreated):`, e)
      return []
    }
  },
  'v1.WeightLogUpdated': ({ id, weight, mood, energy, notes, updatedAt }) =>
    tables.weightLogs.update({
      weight, mood, energy, notes,
      updatedAt: new Date(updatedAt)
    }).where({ id }),
  'v1.WeightLogDeleted': ({ id, deletedAt }) =>
    tables.weightLogs.update({ deletedAt: new Date(deletedAt) }).where({ id }),

  'v1.TaskCreated': (params) => {
    try {
      const { id, userId, title, category, description, dueDate, priority, createdAt } = params
      console.log(`[LiveStore] Materializing TaskCreated: ${id} (${title})`)
      return tables.tasks.insert({
        id: String(id),
        userId: String(userId),
        title: String(title),
        category: String(category),
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority || 'medium',
        completed: false,
        createdAt: new Date(createdAt),
        deletedAt: null,
        updatedAt: null
      })
    } catch (e) {
      console.error(`[LiveStore] Materializer Error (TaskCreated):`, e)
      return []
    }
  },
  'v1.TaskUpdated': ({ id, title, description, dueDate, priority, updatedAt }) =>
    tables.tasks.update({
      title, description,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      priority,
      updatedAt: new Date(updatedAt)
    }).where({ id }),
  'v1.TaskCompleted': ({ id, updatedAt }) =>
    tables.tasks.update({ completed: true, updatedAt: new Date(updatedAt) }).where({ id }),
  'v1.TaskUncompleted': ({ id, updatedAt }) =>
    tables.tasks.update({ completed: false, updatedAt: new Date(updatedAt) }).where({ id }),
  'v1.TaskDeleted': ({ id, deletedAt }) =>
    tables.tasks.update({ deletedAt: new Date(deletedAt) }).where({ id }),

  'v1.GoalCreated': (params) => {
    try {
      const { id, userId, goalType, targetValue, deadline, createdAt } = params
      console.log(`[LiveStore] Materializing GoalCreated: ${id}`)
      return tables.userGoals.insert({
        id: String(id),
        userId: String(userId),
        goalType: String(goalType),
        targetValue: String(targetValue),
        deadline: deadline ? new Date(deadline) : null,
        achieved: false,
        createdAt: new Date(createdAt),
        deletedAt: null,
        updatedAt: null
      })
    } catch (e) {
      console.error(`[LiveStore] Materializer Error (GoalCreated):`, e)
      return []
    }
  },
  'v1.GoalUpdated': ({ id, targetValue, deadline, achieved, updatedAt }) =>
    tables.userGoals.update({
      targetValue,
      deadline: deadline ? new Date(deadline) : undefined,
      achieved,
      updatedAt: new Date(updatedAt)
    }).where({ id }),
  'v1.GoalDeleted': ({ id, deletedAt }) =>
    tables.userGoals.update({ deletedAt: new Date(deletedAt) }).where({ id }),
})

const state = State.SQLite.makeState({ tables, materializers })

export const schema = makeSchema({ events, state })

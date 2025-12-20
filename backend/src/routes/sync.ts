import { Hono } from "hono"
import { db } from "../db"
import {
  weightLogs, workoutLogs, tasks, workouts, projects, columns,
  trainingSplits, exercises, workoutExercises, timerSessions, userGoals, expenses
} from "../db/schema"
import { and, eq, exists, gte, isNotNull, isNull, or } from "drizzle-orm"

const syncRouter = new Hono()

syncRouter.get("/pull", async (c) => {
  try {
    const user = c.get("user" as any)
    if (!user) return c.json({ message: "Unauthorized" }, 401)

    const since = c.req.query("since")
    const sinceDate = since ? new Date(since) : new Date(0)

    const [
      weights, workoutsList, userTasks, userProjects,
      userColumns, allTrainingSplits, allExercises,
      userWorkoutExercises, userWorkoutLogs,
      userTimerSessions, userGoalsList, userExpenses
    ] = await Promise.all([
      db.select().from(weightLogs).where(and(eq(weightLogs.userId, user.id), gte(weightLogs.updatedAt, sinceDate))),
      db.select().from(workouts).where(and(or(eq(workouts.userId, user.id), isNull(workouts.userId)), gte(workouts.updatedAt, sinceDate))),
      db.select().from(tasks).where(and(eq(tasks.userId, user.id), gte(tasks.updatedAt, sinceDate))),
      db.select().from(projects).where(and(eq(projects.userId, user.id), gte(projects.updatedAt, sinceDate))),
      db.select().from(columns).where(and(
        gte(columns.updatedAt, sinceDate),
        exists(db.select().from(projects).where(and(eq(projects.id, columns.projectId), eq(projects.userId, user.id))))
      )),
      db.select().from(trainingSplits).where(and(or(eq(trainingSplits.createdBy, user.id), eq(trainingSplits.isPublic, true)), gte(trainingSplits.updatedAt, sinceDate))),
      db.select().from(exercises).where(and(or(eq(exercises.userId, user.id), isNull(exercises.userId)), gte(exercises.updatedAt, sinceDate))),
      db.select().from(workoutExercises).where(and(
        gte(workoutExercises.updatedAt, sinceDate),
        exists(db.select().from(workouts).where(and(eq(workouts.id, workoutExercises.workoutId), eq(workouts.userId, user.id))))
      )),
      db.select().from(workoutLogs).where(and(eq(workoutLogs.userId, user.id), gte(workoutLogs.updatedAt, sinceDate))),
      db.select().from(timerSessions).where(and(eq(timerSessions.userId, user.id), gte(timerSessions.updatedAt, sinceDate))),
      db.select().from(userGoals).where(and(eq(userGoals.userId, user.id), gte(userGoals.updatedAt, sinceDate))),
      db.select().from(expenses).where(and(eq(expenses.userId, user.id), gte(expenses.updatedAt, sinceDate))),
    ])

    const changes = [
      ...weights.map((w) => ({ ...w, tableName: "weight_logs" })),
      ...workoutsList.map((w) => ({ ...w, tableName: "workouts" })),
      ...userTasks.map((t) => ({ ...t, tableName: "tasks" })),
      ...userProjects.map((p) => ({ ...p, tableName: "projects" })),
      ...userColumns.map((c) => ({ ...c, tableName: "project_columns" })),
      ...allTrainingSplits.map((s) => ({ ...s, tableName: "training_splits" })),
      ...allExercises.map((e) => ({ ...e, tableName: "exercises" })),
      ...userWorkoutExercises.map((we) => ({ ...we, tableName: "workout_exercises" })),
      ...userWorkoutLogs.map((wl) => ({ ...wl, tableName: "workout_logs" })),
      ...userTimerSessions.map((ts) => ({ ...ts, tableName: "timer_sessions" })),
      ...userGoalsList.map((ug) => ({ ...ug, tableName: "user_goals" })),
      ...userExpenses.map((exp) => ({ ...exp, tableName: "expenses" })),
    ]

    return c.json({ changes, serverTime: new Date().toISOString() })
  } catch (error) {
    console.error("Critical Sync Pull Error:", error)
    return c.json({ message: "Sync pull failed", error: String(error) }, 500)
  }
})

syncRouter.get("/all", async (c) => {
  try {
    const user = c.get("user" as any)
    if (!user) return c.json({ message: "Unauthorized" }, 401)

    const [
      weights, workoutSessions, tasksList, userProjects,
      userColumns, allTrainingSplits, allExercises,
      userWorkoutExercises, userGoalsList, userExpenses, workoutsList, userTimerSessions
    ] = await Promise.all([
      db.select().from(weightLogs).where(eq(weightLogs.userId, user.id)),
      db.select().from(workoutLogs).where(eq(workoutLogs.userId, user.id)),
      db.select().from(tasks).where(eq(tasks.userId, user.id)),
      db.select().from(projects).where(eq(projects.userId, user.id)),
      db.select().from(columns).where(exists(db.select().from(projects).where(and(eq(projects.id, columns.projectId), eq(projects.userId, user.id))))),
      db.select().from(trainingSplits).where(or(eq(trainingSplits.createdBy, user.id), eq(trainingSplits.isPublic, true))),
      db.select().from(exercises).where(or(eq(exercises.userId, user.id), isNull(exercises.userId))),
      db.select().from(workoutExercises).where(exists(db.select().from(workouts).where(and(eq(workouts.id, workoutExercises.workoutId), eq(workouts.userId, user.id))))),
      db.select().from(userGoals).where(eq(userGoals.userId, user.id)),
      db.select().from(expenses).where(eq(expenses.userId, user.id)),
      db.select().from(workouts).where(or(eq(workouts.userId, user.id), isNull(workouts.userId))),
      db.select().from(timerSessions).where(eq(timerSessions.userId, user.id)),
    ])

    return c.json({
      weights,
      workoutLogs: workoutSessions,
      tasks: tasksList,
      projects: userProjects,
      columns: userColumns,
      trainingSplits: allTrainingSplits,
      exercises: allExercises,
      workoutExercises: userWorkoutExercises,
      userGoals: userGoalsList,
      expenses: userExpenses,
      workouts: workoutsList,
      timerSessions: userTimerSessions,
      serverTime: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Critical Sync All Error:", error)
    return c.json({ message: "Sync all failed", error: String(error) }, 500)
  }
})

syncRouter.post("/push", async (c) => {
  const user = c.get("user" as any)
  if (!user) return c.json({ message: "Unauthorized" }, 401)

  const { changes } = await c.req.json()
  const now = new Date()
  let processedCount = 0

  for (const change of changes || []) {
    try {
      const { action, tableName, rowId, data } = change
      if (!data) continue

      const { syncStatus, tableName: _, ...payload } = data

      if (payload.createdAt) payload.createdAt = new Date(payload.createdAt)
      if (payload.updatedAt) payload.updatedAt = new Date(payload.updatedAt)
      if (payload.deletedAt) payload.deletedAt = new Date(payload.deletedAt)
      if (payload.dueDate) payload.dueDate = new Date(payload.dueDate)

      if (tableName === "weight_logs") {
        const sanitized = {
          id: payload.id || rowId, userId: user.id, weight: payload.weight ? String(payload.weight) : "0",
          energy: payload.energy, mood: payload.mood, notes: payload.notes,
          createdAt: payload.createdAt, updatedAt: now, deletedAt: payload.deletedAt
        }
        if (action === "DELETE") await db.update(weightLogs).set({ deletedAt: now, updatedAt: now }).where(eq(weightLogs.id, rowId))
        else await db.insert(weightLogs).values(sanitized).onConflictDoUpdate({ target: weightLogs.id, set: sanitized })
      }

      if (tableName === "workout_logs") {
        const sanitized = {
          id: payload.id || rowId, userId: user.id, workoutId: payload.workoutId,
          workoutName: payload.workoutName, notes: payload.notes,
          createdAt: payload.createdAt, updatedAt: now, deletedAt: payload.deletedAt
        }
        if (action === "DELETE") await db.update(workoutLogs).set({ deletedAt: now, updatedAt: now }).where(eq(workoutLogs.id, rowId))
        else await db.insert(workoutLogs).values(sanitized).onConflictDoUpdate({ target: workoutLogs.id, set: sanitized })
      }

      if (tableName === "tasks") {
        const sanitized = {
          id: payload.id || rowId, userId: user.id, title: payload.title,
          description: payload.description, completed: payload.completed,
          dueDate: payload.dueDate, priority: payload.priority,
          order: payload.order, category: payload.category,
          projectId: payload.projectId, columnId: payload.columnId,
          createdAt: payload.createdAt, updatedAt: now, deletedAt: payload.deletedAt
        }
        if (action === "DELETE") await db.update(tasks).set({ deletedAt: now, updatedAt: now }).where(eq(tasks.id, rowId))
        else await db.insert(tasks).values(sanitized).onConflictDoUpdate({ target: tasks.id, set: sanitized })
      }

      if (tableName === "projects") {
        const sanitized = {
          id: payload.id || rowId, userId: user.id, name: payload.name,
          color: payload.color, isArchived: payload.isArchived,
          createdAt: payload.createdAt, updatedAt: now, deletedAt: payload.deletedAt
        }
        if (action === "DELETE") await db.update(projects).set({ deletedAt: now, updatedAt: now }).where(eq(projects.id, rowId))
        else await db.insert(projects).values(sanitized).onConflictDoUpdate({ target: projects.id, set: sanitized })
      }

      if (tableName === "project_columns") {
        const sanitized = {
          id: payload.id || rowId, projectId: payload.projectId, name: payload.name,
          order: payload.order, type: payload.type,
          createdAt: payload.createdAt, updatedAt: now, deletedAt: payload.deletedAt
        }
        if (action === "DELETE") await db.update(columns).set({ deletedAt: now, updatedAt: now }).where(eq(columns.id, rowId))
        else await db.insert(columns).values(sanitized).onConflictDoUpdate({ target: columns.id, set: sanitized })
      }

      if (tableName === "workouts") {
        const sanitized = {
          id: payload.id || rowId, userId: user.id, name: payload.name,
          trainingSplitId: payload.trainingSplitId,
          createdAt: payload.createdAt, updatedAt: now, deletedAt: payload.deletedAt
        }
        if (action === "DELETE") await db.update(workouts).set({ deletedAt: now, updatedAt: now }).where(eq(workouts.id, rowId))
        else await db.insert(workouts).values(sanitized).onConflictDoUpdate({ target: workouts.id, set: sanitized })
      }

      if (tableName === "training_splits") {
        const sanitized = {
          id: payload.id || rowId, name: payload.name, description: payload.description,
          createdBy: user.id, isPublic: payload.isPublic,
          createdAt: payload.createdAt, updatedAt: now, deletedAt: payload.deletedAt
        }
        if (action === "DELETE") await db.update(trainingSplits).set({ deletedAt: now, updatedAt: now }).where(eq(trainingSplits.id, rowId))
        else await db.insert(trainingSplits).values(sanitized).onConflictDoUpdate({ target: trainingSplits.id, set: sanitized })
      }

      if (tableName === "exercises") {
        const sanitized = {
          id: payload.id || rowId, userId: user.id, name: payload.name, description: payload.description,
          createdAt: payload.createdAt, updatedAt: now, deletedAt: payload.deletedAt
        }
        if (action === "DELETE") await db.update(exercises).set({ deletedAt: now, updatedAt: now }).where(eq(exercises.id, rowId))
        else await db.insert(exercises).values(sanitized).onConflictDoUpdate({ target: exercises.id, set: sanitized })
      }

      if (tableName === "workout_exercises") {
        const sanitized = {
          id: payload.id || rowId, workoutId: payload.workoutId, exerciseId: payload.exerciseId,
          sets: payload.sets, reps: payload.reps, weight: payload.weight ? String(payload.weight) : "0",
          createdAt: payload.createdAt, updatedAt: now, deletedAt: payload.deletedAt
        }
        if (action === "DELETE") await db.update(workoutExercises).set({ deletedAt: now, updatedAt: now }).where(eq(workoutExercises.id, rowId))
        else await db.insert(workoutExercises).values(sanitized).onConflictDoUpdate({ target: workoutExercises.id, set: sanitized })
      }

      if (tableName === "timer_sessions") {
        const sanitized = {
          id: payload.id || rowId, userId: user.id, taskId: payload.taskId,
          startTime: payload.startTime, endTime: payload.endTime, duration: payload.duration,
          type: payload.type, completed: payload.completed,
          createdAt: payload.createdAt, updatedAt: now, deletedAt: payload.deletedAt
        }
        if (action === "DELETE") await db.update(timerSessions).set({ deletedAt: now, updatedAt: now }).where(eq(timerSessions.id, rowId))
        else await db.insert(timerSessions).values(sanitized).onConflictDoUpdate({ target: timerSessions.id, set: sanitized })
      }

      if (tableName === "user_goals") {
        const sanitized = {
          id: payload.id || rowId, userId: user.id, goalType: payload.goalType,
          targetValue: payload.targetValue ? String(payload.targetValue) : "0",
          deadline: payload.deadline, achieved: payload.achieved,
          createdAt: payload.createdAt, updatedAt: now, deletedAt: payload.deletedAt
        }
        if (action === "DELETE") await db.update(userGoals).set({ deletedAt: now, updatedAt: now }).where(eq(userGoals.id, rowId))
        else await db.insert(userGoals).values(sanitized).onConflictDoUpdate({ target: userGoals.id, set: sanitized })
      }

      if (tableName === "expenses") {
        const sanitized = {
          id: payload.id || rowId, userId: user.id, category: payload.category,
          amount: payload.amount ? String(payload.amount) : "0", description: payload.description,
          createdAt: payload.createdAt, updatedAt: now, deletedAt: payload.deletedAt
        }
        if (action === "DELETE") await db.update(expenses).set({ deletedAt: now, updatedAt: now }).where(eq(expenses.id, rowId))
        else await db.insert(expenses).values(sanitized).onConflictDoUpdate({ target: expenses.id, set: sanitized })
      }
      processedCount++
    } catch (err) {
      console.error(`Error processing sync item for table ${change.tableName}:`, err, change)
      throw err // Trigger 500 so client sees error, but now with backend logging context
    }
  }

  return c.json({ success: true, processed: processedCount })
})

export default syncRouter

import { db } from "../src/db/index"
import {
  tasks, weightLogs, workoutLogs, userGoals,
  exercises, expenses, trainingSplits,
  workoutExercises, workouts, timerSessions,
} from "../src/db/schema"
import * as fs from "fs"
import * as path from "path"
import * as crypto from "crypto"
import { parseISO } from "date-fns"

// Helper to ensure Strict UTC ISO strings
function toUTCString(date: Date | string | number | null | undefined): string {
  if (!date) return new Date().toISOString()
  if (date instanceof Date) return date.toISOString()
  if (typeof date === "number") return new Date(date).toISOString()

  try {
    let cleanStr = String(date).trim()

    // Handle SQL-like strings: "2025-07-14 21:00:00.123" or "2025-07-14 21:00:00"
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d+)?$/.test(cleanStr)) {
      cleanStr = cleanStr.replace(' ', 'T') + 'Z'
    }
    // Handle SQL-like date only: "2025-07-14" -> "2025-07-14T00:00:00Z"
    else if (/^\d{4}-\d{2}-\d{2}$/.test(cleanStr)) {
      cleanStr = cleanStr + "T00:00:00Z"
    }

    const parsed = parseISO(cleanStr)
    if (isNaN(parsed.getTime())) {
      console.warn(`[GenerateSeed] Invalid date parsed: ${date}, fallback to now`)
      return new Date().toISOString()
    }
    return parsed.toISOString()
  } catch (e) {
    console.warn(`[GenerateSeed] Error parsing date: ${date}, fallback to now`)
    return new Date().toISOString()
  }
}

async function generateSeedV2() {
  console.log("🚀 Generating Seed v2 with STRICT UTC dates from ALL tables...")

  const events: any[] = []

  // 1. Tasks
  const allTasks = await db.select().from(tasks)
  allTasks.forEach(t => {
    events.push({
      storeId: t.userId,
      eventId: `seed_task_${t.id}`,
      eventType: "v1.TaskCreated",
      eventData: {
        id: t.id || crypto.randomUUID(),
        userId: t.userId,
        title: t.title,
        category: t.category || "general",
        description: t.description || undefined,
        dueDate: t.dueDate ? toUTCString(t.dueDate) : undefined,
        priority: t.priority || "medium",
        createdAt: toUTCString(t.createdAt)
      },
      timestamp: t.createdAt ? new Date(toUTCString(t.createdAt)).getTime() : Date.now()
    })
  })

  // 2. Weight Logs
  const allWeights = await db.select().from(weightLogs)
  allWeights.forEach(w => {
    events.push({
      storeId: w.userId,
      eventId: `seed_weight_${w.id}`,
      eventType: "v1.WeightLogCreated",
      eventData: {
        id: w.id || crypto.randomUUID(),
        userId: w.userId,
        weight: String(w.weight),
        mood: w.mood || undefined,
        energy: w.energy || undefined,
        notes: w.notes || undefined,
        createdAt: toUTCString(w.createdAt)
      },
      timestamp: w.createdAt ? new Date(toUTCString(w.createdAt)).getTime() : Date.now()
    })
  })

  // 3. Workout Logs
  const allWorkoutLogs = await db.select().from(workoutLogs)
  allWorkoutLogs.forEach(w => {
    events.push({
      storeId: w.userId,
      eventId: `seed_workout_log_${w.id}`,
      eventType: "v1.WorkoutLogCreated",
      eventData: {
        id: w.id || crypto.randomUUID(),
        userId: w.userId,
        workoutId: w.workoutId || "default",
        workoutName: w.workoutName || "Workout",
        notes: w.notes || undefined,
        createdAt: toUTCString(w.createdAt)
      },
      timestamp: w.createdAt ? new Date(toUTCString(w.createdAt)).getTime() : Date.now()
    })
  })

  // 4. Goals
  const allGoals = await db.select().from(userGoals)
  allGoals.forEach(g => {
    events.push({
      storeId: g.userId,
      eventId: `seed_goal_${g.id}`,
      eventType: "v1.GoalCreated",
      eventData: {
        id: g.id || crypto.randomUUID(),
        userId: g.userId,
        goalType: g.goalType,
        targetValue: String(g.targetValue),
        deadline: g.deadline ? toUTCString(g.deadline) : undefined,
        createdAt: toUTCString(g.createdAt)
      },
      timestamp: g.createdAt ? new Date(toUTCString(g.createdAt)).getTime() : Date.now()
    })
  })


  console.log(`\nGenerated count breakdown:`)
  console.log(`- Tasks: ${allTasks.length}`)
  console.log(`- Weight Logs: ${allWeights.length}`)
  console.log(`- Workout Logs: ${allWorkoutLogs.length}`)
  console.log(`- Goals: ${allGoals.length}`)

  // Sort events by timestamp to preserve order
  events.sort((a, b) => a.timestamp - b.timestamp)

  const seedFilePath = path.join(process.cwd(), "src/db/seed/seed-v2.ts")
  const fileContent = `
export const seedV2Events = ${JSON.stringify(events, null, 2)};
`

  fs.writeFileSync(seedFilePath, fileContent)
  console.log(`\n✅ Seed v2 generated with ${events.length} events!`)
  console.log(`📍 Saved to: ${seedFilePath}`)
  process.exit(0)
}

generateSeedV2()

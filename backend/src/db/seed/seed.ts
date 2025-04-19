import { db } from "../index"
import {
  users,
  weightLogs,
  workoutLogs,
  jwks,
  exercises,
  sessions,
  tasks,
  trainingSplits,
  workouts,
} from "../schema"
import { workoutLogs as workoutLogsData } from "./workoutLogs"
import { weightLogs as weightLogsData } from "./weightLogs"
import { sql, eq } from "drizzle-orm"
import { exerciseData } from "./seeders/ts/exercise"
import { taskItemData } from "./seeders/ts/tasks_item"
import { trainingSplitData } from "./seeders/ts/training_split"
import { weightLogData } from "./seeders/ts/weight_log"
import { workoutLogData } from "./seeders/ts/workout_log"
import { workoutData } from "./seeders/ts/workout"

export const seedExercises = async () => {
  const exercisesToInsert = exerciseData.map((exercise) => ({
    ...exercise,
    createdAt: new Date(exercise.createdAt),
    updatedAt: new Date(exercise.updatedAt),
  }))

  await db.insert(exercises).values(exercisesToInsert)
  console.log("✅ Seeded exercises")
}

export const seedTasks = async (userId: string) => {
  const tasksToInsert = taskItemData.flat().map((task) => ({
    ...task,
    userId: userId,
    createdAt: new Date(task.createdAt),
    dueDate: task.due_date ? new Date(task.due_date) : null,
    updatedAt: new Date(),
  }))

  await db.insert(tasks).values(tasksToInsert)
  console.log("✅ Seeded task items")
}

export const seedTraininSplits = async () => {
  const trainingSplitesToInsert = trainingSplitData
    .flat()
    .map((trainingSplit) => ({
      ...trainingSplit,
      createdAt: new Date(trainingSplit.createdAt),
      updatedAt: new Date(),
    }))

  await db.insert(trainingSplits).values(trainingSplitesToInsert)
  console.log("✅ Seeded trainingSplits items")
}

export const seedWeightLogs = async (userId: string) => {
  const weightLogsToInsert = weightLogData.map((weightLog) => ({
    ...weightLog,
    userId: userId,
    createdAt: new Date(weightLog.createdAt),
    energy: weightLog.energy as "Great" | "Good" | "Okay" | "Low",
    mood: weightLog.mood as "High" | "Medium" | "Low",
  }))

  await db.insert(weightLogs).values(weightLogsToInsert)
  console.log("✅ Seeded weightLogs items")
}

export const seedWorkoutLogs = async (userId: string) => {
  const workoutLogesToInsert = workoutLogData.map((workoutLog) => ({
    ...workoutLog,
    userId: userId,
    createdAt: new Date(workoutLog.createdAt),
    updatedAt: new Date(),
  }))

  await db.insert(workoutLogs).values(workoutLogesToInsert)
  console.log("✅ Seeded workoutLogs items")
}

export const seedWorkouts = async () => {
  const workoutsToInsert = workoutData.map((workout) => ({
    ...workout,
    trainingSplitId: workout.training_split_id,
    createdAt: new Date(workout.createdAt),
  }))

  await db.insert(workouts).values(workoutsToInsert)
  console.log("✅ Seeded workouts items")
}

async function seed() {
  console.log("seeding data ...")
  const user = await db.query.users.findFirst()
  // console.log(user)
  // await seedExercises()
  // await seedTasks(user?.id as string)
  // await seedTraininSplits()
  // await seedWeightLogs(user?.id as string)
  // await seedWorkoutLogs(user?.id as string)
  // await seedWorkouts()
}

seed()

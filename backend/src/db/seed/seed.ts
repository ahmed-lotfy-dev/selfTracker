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

async function seed() {
  console.log("seeding data ...")
  const [userData] = await db.select().from(users).limit(1)
  if (!userData) throw new Error("User not found")

  await db.execute(sql`DROP SCHEMA public CASCADE`)
  await db.execute(sql`CREATE SCHEMA public`)
}

seed()

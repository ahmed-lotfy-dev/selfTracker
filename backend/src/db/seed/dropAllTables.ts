import { db } from "../index"
import {
  users,
  weightLog,
  workoutLog,
  jwks,
  exercise,
  sessions,
  task,
  trainingSplit,
  workout,
} from "../schema"
import { workoutLogs as workoutLogsData } from "./workoutLogs"
import { weightLogs as weightLogsData } from "./weightLogs"
import { sql, eq } from "drizzle-orm"

async function dropAllTables() {
  console.log("droping all tables ...")
  await db.execute(sql`DROP SCHEMA public CASCADE`)
  await db.execute(sql`CREATE SCHEMA public`)
}

dropAllTables()

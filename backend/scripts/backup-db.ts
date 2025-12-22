import { db } from "../src/db/index"
import { tasks, weightLogs, workoutLogs, userGoals, livestoreEvents } from "../src/db/schema"
import * as fs from "fs"
import * as path from "path"

async function backup() {
  console.log("🚀 Starting database backup...")

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
  const backupDir = path.join(process.cwd(), "backups")

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir)
  }

  const backupPath = path.join(backupDir, `backup_${timestamp}.json`)

  try {
    const data = {
      tasks: await db.select().from(tasks),
      weightLogs: await db.select().from(weightLogs),
      workoutLogs: await db.select().from(workoutLogs),
      userGoals: await db.select().from(userGoals),
      livestoreEvents: await db.select().from(livestoreEvents),
      exportedAt: new Date().toISOString()
    }

    fs.writeFileSync(backupPath, JSON.stringify(data, null, 2))

    console.log(`✅ Backup successful! Saved to: ${backupPath}`)
    console.log(`📊 Statistics:`)
    console.log(`- Tasks: ${data.tasks.length}`)
    console.log(`- Weight Logs: ${data.weightLogs.length}`)
    console.log(`- Workout Logs: ${data.workoutLogs.length}`)
    console.log(`- User Goals: ${data.userGoals.length}`)
    console.log(`- LiveStore Events: ${data.livestoreEvents.length}`)

  } catch (error) {
    console.error("❌ Backup failed:", error)
    process.exit(1)
  }
}

backup()

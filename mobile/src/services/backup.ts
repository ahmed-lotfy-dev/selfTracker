import { db, dbManager } from "@/src/db/client"
import {
  weightLogs, workoutLogs, tasks, workouts, projects,
  projectColumns, trainingSplits, exercises, workoutExercises,
  timerSessions, userGoals, expenses
} from "@/src/db/schema"
import { isNull } from "drizzle-orm"
import { File, Paths } from "expo-file-system"
import * as DocumentPicker from "expo-document-picker"
import { createId } from "@paralleldrive/cuid2"

let Sharing: typeof import("expo-sharing") | null = null
try {
  Sharing = require("expo-sharing")
} catch { }

interface BackupData {
  version: string
  createdAt: string
  userId: string
  data: {
    weightLogs: any[]
    workoutLogs: any[]
    tasks: any[]
    workouts: any[]
    projects: any[]
    projectColumns: any[]
    trainingSplits: any[]
    exercises: any[]
    workoutExercises: any[]
    timerSessions: any[]
    userGoals: any[]
    expenses: any[]
  }
}

export const createBackup = async (): Promise<{ success: boolean; filePath?: string; error?: string; totalRecords?: number }> => {
  try {
    const userId = dbManager.getCurrentUserId()
    if (!userId) {
      return { success: false, error: "No user logged in" }
    }

    const allWeightLogs = await db.select().from(weightLogs).where(isNull(weightLogs.deletedAt))
    const allWorkoutLogs = await db.select().from(workoutLogs).where(isNull(workoutLogs.deletedAt))
    const allTasks = await db.select().from(tasks).where(isNull(tasks.deletedAt))
    const allWorkouts = await db.select().from(workouts).where(isNull(workouts.deletedAt))
    const allProjects = await db.select().from(projects).where(isNull(projects.deletedAt))
    const allProjectColumns = await db.select().from(projectColumns).where(isNull(projectColumns.deletedAt))
    const allTrainingSplits = await db.select().from(trainingSplits).where(isNull(trainingSplits.deletedAt))
    const allExercises = await db.select().from(exercises).where(isNull(exercises.deletedAt))
    const allWorkoutExercises = await db.select().from(workoutExercises).where(isNull(workoutExercises.deletedAt))
    const allTimerSessions = await db.select().from(timerSessions).where(isNull(timerSessions.deletedAt))
    const allUserGoals = await db.select().from(userGoals).where(isNull(userGoals.deletedAt))
    const allExpenses = await db.select().from(expenses).where(isNull(expenses.deletedAt))

    const backup: BackupData = {
      version: "1.0",
      createdAt: new Date().toISOString(),
      userId,
      data: {
        weightLogs: allWeightLogs.map(serializeRecord),
        workoutLogs: allWorkoutLogs.map(serializeRecord),
        tasks: allTasks.map(serializeRecord),
        workouts: allWorkouts.map(serializeRecord),
        projects: allProjects.map(serializeRecord),
        projectColumns: allProjectColumns.map(serializeRecord),
        trainingSplits: allTrainingSplits.map(serializeRecord),
        exercises: allExercises.map(serializeRecord),
        workoutExercises: allWorkoutExercises.map(serializeRecord),
        timerSessions: allTimerSessions.map(serializeRecord),
        userGoals: allUserGoals.map(serializeRecord),
        expenses: allExpenses.map(serializeRecord),
      }
    }

    const fileName = `selftracker_backup_${new Date().toISOString().split('T')[0]}.json`
    const file = new File(Paths.cache, fileName)

    await file.write(JSON.stringify(backup, null, 2))

    const totalRecords = Object.values(backup.data).reduce((sum, arr) => sum + arr.length, 0)
    console.log(`[Backup] Created backup with ${totalRecords} records`)

    if (Sharing && await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(file.uri, {
        mimeType: "application/json",
        dialogTitle: "Save Backup File",
        UTI: "public.json"
      })
    }

    return { success: true, filePath: file.uri, totalRecords }
  } catch (error: any) {
    console.error("[Backup] Failed to create backup:", error)
    return { success: false, error: error.message }
  }
}

export const restoreBackup = async (): Promise<{ success: boolean; restored: number; error?: string }> => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/json",
      copyToCacheDirectory: true,
    })

    if (result.canceled || !result.assets?.[0]) {
      return { success: false, restored: 0, error: "No file selected" }
    }

    const fileUri = result.assets[0].uri
    const file = new File(fileUri)
    const content = await file.text()
    const backup: BackupData = JSON.parse(content)

    if (!backup.version || !backup.data) {
      return { success: false, restored: 0, error: "Invalid backup file format" }
    }

    const userId = dbManager.getCurrentUserId()
    if (!userId) {
      return { success: false, restored: 0, error: "No user logged in" }
    }

    let restored = 0

    const restoreTable = async (data: any[], table: any) => {
      for (const item of data) {
        try {
          const record = {
            ...deserializeRecord(item),
            id: createId(),
            userId,
            syncStatus: "pending",
          }
          await db.insert(table).values(record)
          restored++
        } catch { }
      }
    }

    await restoreTable(backup.data.weightLogs || [], weightLogs)
    await restoreTable(backup.data.workoutLogs || [], workoutLogs)
    await restoreTable(backup.data.tasks || [], tasks)
    await restoreTable(backup.data.workouts || [], workouts)
    await restoreTable(backup.data.projects || [], projects)
    await restoreTable(backup.data.projectColumns || [], projectColumns)
    await restoreTable(backup.data.trainingSplits || [], trainingSplits)
    await restoreTable(backup.data.exercises || [], exercises)
    await restoreTable(backup.data.workoutExercises || [], workoutExercises)
    await restoreTable(backup.data.timerSessions || [], timerSessions)
    await restoreTable(backup.data.userGoals || [], userGoals)
    await restoreTable(backup.data.expenses || [], expenses)

    console.log(`[Backup] Restored ${restored} records from backup`)

    return { success: true, restored }
  } catch (error: any) {
    console.error("[Backup] Failed to restore backup:", error)
    return { success: false, restored: 0, error: error.message }
  }
}

const serializeRecord = (record: any): any => {
  const serialized: any = {}
  for (const [key, value] of Object.entries(record)) {
    if (value instanceof Date) {
      serialized[key] = value.toISOString()
    } else {
      serialized[key] = value
    }
  }
  return serialized
}

const deserializeRecord = (record: any): any => {
  const dateFields = ["createdAt", "updatedAt", "deletedAt", "dueDate", "deadline", "startTime", "endTime"]
  const deserialized: any = { ...record }

  for (const field of dateFields) {
    if (deserialized[field] && typeof deserialized[field] === "string") {
      deserialized[field] = new Date(deserialized[field])
    }
  }

  delete deserialized.id
  delete deserialized.userId

  return deserialized
}

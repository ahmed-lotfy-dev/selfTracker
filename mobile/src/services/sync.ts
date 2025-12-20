import { db } from "../db/client";
import {
  syncQueue, workoutLogs, weightLogs, tasks,
  workouts, projects, projectColumns, trainingSplits,
  exercises, workoutExercises, timerSessions, userGoals, expenses
} from "../db/schema";
import { eq, inArray } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import axiosInstance from "../lib/api/axiosInstane";
import { API_BASE_URL } from "../lib/api/config";
import * as SecureStore from "expo-secure-store";

const LAST_SYNCED_KEY = "last_synced_at";

type SyncAction = "INSERT" | "UPDATE" | "DELETE";
type TableName =
  | "workout_logs"
  | "weight_logs"
  | "tasks"
  | "workouts"
  | "projects"
  | "project_columns"
  | "training_splits"
  | "exercises"
  | "workout_exercises"
  | "timer_sessions"
  | "user_goals"
  | "expenses";

interface SyncQueueItem {
  id: string;
  action: SyncAction;
  tableName: TableName;
  rowId: string;
  data: string; // SQLite stores it as string
  createdAt: Date;
}

export const addToSyncQueue = async (
  action: SyncAction,
  tableName: TableName,
  rowId: string,
  data: unknown
) => {
  await db.insert(syncQueue).values({
    id: createId(),
    action,
    tableName,
    rowId,
    data: JSON.stringify(data),
    createdAt: new Date(),
  });
};

export const pushChanges = async (): Promise<{ success: boolean; pushed: number }> => {
  const queue = await db.select().from(syncQueue).orderBy(syncQueue.createdAt);

  if (queue.length === 0) {
    return { success: true, pushed: 0 };
  }

  try {
    const response = await axiosInstance.post("/api/sync/push", {
      changes: queue.map((item) => ({
        ...item,
        data: typeof item.data === "string" ? JSON.parse(item.data) : item.data,
      })),
    });

    if (response.status === 200) {
      const processedIds = queue.map((q) => q.id);
      await db.delete(syncQueue).where(inArray(syncQueue.id, processedIds));

      const tableMap: Record<TableName, any> = {
        workout_logs: workoutLogs,
        weight_logs: weightLogs,
        tasks,
        workouts,
        projects,
        project_columns: projectColumns,
        training_splits: trainingSplits,
        exercises,
        workout_exercises: workoutExercises,
        timer_sessions: timerSessions,
        user_goals: userGoals,
        expenses
      };
      for (const item of queue) {
        const table = tableMap[item.tableName as keyof typeof tableMap];
        if (table && item.action !== "DELETE") {
          await db.update(table).set({ syncStatus: "synced" }).where(eq(table.id, item.rowId));
        }
      }

      return { success: true, pushed: queue.length };
    }
  } catch (error) {
    console.error("Sync push failed:", error);
  }

  return { success: false, pushed: 0 };
};

const sanitizeRecord = (change: any) => {
  const sanitized = { ...change };

  // Convert all potential timestamp columns to Date objects for Drizzle SQLite
  const dateFields = [
    "updatedAt", "deletedAt", "createdAt", "dueDate",
    "deadline", "startTime", "endTime"
  ];

  dateFields.forEach(field => {
    if (sanitized[field] != null) {
      sanitized[field] = new Date(sanitized[field]);
    } else {
      delete sanitized[field];
    }
  });

  // Remove fields that shouldn't be in the SQLite DB directly
  delete sanitized.tableName;
  delete sanitized.syncStatus;
  return sanitized;
};

export const pullChanges = async (): Promise<{ success: boolean; pulled: number }> => {
  const lastSynced = await SecureStore.getItemAsync(LAST_SYNCED_KEY);
  const since = lastSynced || new Date(0).toISOString();

  try {
    const response = await axiosInstance.get("/api/sync/pull", {
      params: { since },
    });

    if (response.status === 200) {
      const { changes, serverTime } = response.data;
      let pulled = 0;

      for (const change of changes || []) {
        const tableMap: Record<TableName, any> = {
          workout_logs: workoutLogs,
          weight_logs: weightLogs,
          tasks,
          workouts,
          projects,
          project_columns: projectColumns,
          training_splits: trainingSplits,
          exercises,
          workout_exercises: workoutExercises,
          timer_sessions: timerSessions,
          user_goals: userGoals,
          expenses
        };
        const table = tableMap[change.tableName as keyof typeof tableMap];

        if (!table) continue;

        const sanitized = sanitizeRecord(change);

        if (sanitized.deletedAt) {
          await db.update(table).set({ deletedAt: sanitized.deletedAt }).where(eq(table.id, sanitized.id));
        } else {
          const existing = await db.select().from(table).where(eq(table.id, sanitized.id)).limit(1);
          if (existing.length > 0) {
            await db.update(table).set({ ...sanitized, syncStatus: "synced" }).where(eq(table.id, sanitized.id));
          } else {
            await db.insert(table).values({ ...sanitized, syncStatus: "synced" });
          }
        }
        pulled++;
      }

      await SecureStore.setItemAsync(LAST_SYNCED_KEY, serverTime || new Date().toISOString());
      return { success: true, pulled };
    }
  } catch (error) {
    console.error("Sync pull failed:", error);
  }

  return { success: false, pulled: 0 };
};

export const runSync = async () => {
  const pullResult = await pullChanges();
  const pushResult = await pushChanges();

  return {
    pullSuccess: pullResult.success,
    pulled: pullResult.pulled,
    pushSuccess: pushResult.success,
    pushed: pushResult.pushed,
  };
};

const INITIAL_SYNC_DONE_KEY = "initial_sync_done";

export const initialSync = async (): Promise<{ success: boolean; synced: number }> => {
  const alreadySynced = await SecureStore.getItemAsync(INITIAL_SYNC_DONE_KEY);
  if (alreadySynced === "true") {
    console.log("Initial sync already done, skipping");
    return { success: true, synced: 0 };
  }

  console.log("Starting initial data sync...");
  let synced = 0;

  try {
    const response = await axiosInstance.get("/api/sync/all");
    const {
      weights, workoutLogs: wLogs, tasks: tList, projects: pList,
      columns: cList, trainingSplits: sList, exercises: eList,
      workoutExercises: weList, userGoals: gList, expenses: exList,
      workouts: wkList, timerSessions: tsList,
      serverTime
    } = response.data;

    const syncTable = async (data: any[], table: any) => {
      if (!data) return;
      for (const item of data) {
        const sanitized = sanitizeRecord(item);
        await db.insert(table).values({
          ...sanitized,
          syncStatus: "synced",
        }).onConflictDoUpdate({
          target: table.id,
          set: { ...sanitized, syncStatus: "synced" }
        });
        synced++;
      }
    };

    await syncTable(weights, weightLogs);
    await syncTable(wLogs, workoutLogs);
    await syncTable(tList, tasks);
    await syncTable(pList, projects);
    await syncTable(cList, projectColumns);
    await syncTable(sList, trainingSplits);
    await syncTable(eList, exercises);
    await syncTable(weList, workoutExercises);
    await syncTable(gList, userGoals);
    await syncTable(exList, expenses);
    await syncTable(wkList, workouts);
    await syncTable(tsList, timerSessions);

    await SecureStore.setItemAsync(LAST_SYNCED_KEY, serverTime || new Date().toISOString());
    await SecureStore.setItemAsync(INITIAL_SYNC_DONE_KEY, "true");
    console.log(`Initial sync complete. Synced ${synced} records.`);
    return { success: true, synced };
  } catch (error) {
    console.error("Initial sync failed:", error);
    return { success: false, synced: 0 };
  }
};

export const resetAndSync = async () => {
  console.log("CRITICAL: Ensuring pending data is pushed before wipe...");

  // Try to push changes first to avoid data loss
  const pushRes = await pushChanges();
  if (!pushRes.success) {
    console.warn("Final push failed before reset. Unsynced changes will be lost.");
  }

  console.log("CRITICAL: Wiping local data for full resync...");

  const tables = [
    weightLogs, workoutLogs, tasks, projects, projectColumns,
    trainingSplits, exercises, workoutExercises, timerSessions,
    userGoals, expenses, workouts
  ];

  try {
    for (const table of tables) {
      await db.delete(table);
    }

    // Reset sync flags
    await SecureStore.deleteItemAsync(INITIAL_SYNC_DONE_KEY);
    await SecureStore.deleteItemAsync(LAST_SYNCED_KEY);

    console.log("Local wipe complete. Starting initial sync...");
    return await initialSync();
  } catch (error) {
    console.error("Reset and sync failed:", error);
    return { success: false, synced: 0 };
  }
};

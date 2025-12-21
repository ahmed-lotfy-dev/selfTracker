import { db, dbManager } from "../db/client";
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
import { queryClient } from "@/src/components/Provider/AppProviders";

// Helper to get user-specific sync keys
const getUserSyncKey = (key: string): string => {
  const userId = dbManager.getCurrentUserId();
  if (!userId) throw new Error("No user logged in");
  return `${key}_${userId}`;
};

const LAST_SYNCED_KEY = "last_synced_at";
const INITIAL_SYNC_DONE_KEY = "initial_sync_done";

export const clearUserSyncState = async () => {
  try {
    await SecureStore.deleteItemAsync(getUserSyncKey(INITIAL_SYNC_DONE_KEY));
    await SecureStore.deleteItemAsync(getUserSyncKey(LAST_SYNCED_KEY));
  } catch (error) {
    console.warn("Failed to clear sync state:", error);
  }
};

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

const ensureDbReady = () => {
  if (!dbManager.isInitialized()) {
    throw new Error("Database not initialized - user must be logged in");
  }
};

export const addToSyncQueue = async (
  action: SyncAction,
  tableName: TableName,
  rowId: string,
  data: unknown
) => {
  ensureDbReady();
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
  if (!dbManager.isInitialized()) {
    console.warn("[Sync] Skipping push - database not initialized");
    return { success: false, pushed: 0 };
  }
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

  const dateFields = [
    "updatedAt", "deletedAt", "createdAt", "dueDate",
    "deadline", "startTime", "endTime"
  ];

  dateFields.forEach(field => {
    if (sanitized[field] == null) {
      delete sanitized[field];
    } else if (typeof sanitized[field] === 'string') {
      sanitized[field] = new Date(sanitized[field]);
    } else if (typeof sanitized[field] === 'number') {
      sanitized[field] = new Date(sanitized[field]);
    }
  });

  delete sanitized.tableName;
  delete sanitized.syncStatus;
  return sanitized;
};

export const pullChanges = async (): Promise<{ success: boolean; pulled: number }> => {
  if (!dbManager.isInitialized()) {
    console.warn("[Sync] Skipping pull - database not initialized");
    return { success: false, pulled: 0 };
  }
  const lastSynced = await SecureStore.getItemAsync(getUserSyncKey(LAST_SYNCED_KEY));
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

      await SecureStore.setItemAsync(getUserSyncKey(LAST_SYNCED_KEY), serverTime || new Date().toISOString());
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



export const initialSync = async (): Promise<{ success: boolean; synced: number }> => {
  if (!dbManager.isInitialized()) {
    console.warn("[Sync] Skipping initial sync - database not initialized");
    return { success: false, synced: 0 };
  }

  const alreadySynced = await SecureStore.getItemAsync(getUserSyncKey(INITIAL_SYNC_DONE_KEY));
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

    await SecureStore.setItemAsync(getUserSyncKey(LAST_SYNCED_KEY), serverTime || new Date().toISOString());
    await SecureStore.setItemAsync(getUserSyncKey(INITIAL_SYNC_DONE_KEY), "true");
    console.log(`Initial sync complete. Synced ${synced} records.`);

    queryClient.invalidateQueries({ queryKey: ['weightLogs'] });
    queryClient.invalidateQueries({ queryKey: ['workoutLogs'] });
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    queryClient.invalidateQueries({ queryKey: ['userHomeData'] });
    queryClient.invalidateQueries({ queryKey: ['userGoals'] });
    queryClient.invalidateQueries({ queryKey: ['expenses'] });

    return { success: true, synced };
  } catch (error) {
    console.error("Initial sync failed:", error);
    return { success: false, synced: 0 };
  }
};

export const resetAndSync = async () => {
  if (!dbManager.isInitialized()) {
    console.warn("[Sync] Cannot reset - database not initialized");
    return { success: false, synced: 0 };
  }

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
    await clearUserSyncState();

    console.log("Local wipe complete. Starting initial sync...");
    return await initialSync();
  } catch (error) {
    console.error("Reset and sync failed:", error);
    return { success: false, synced: 0 };
  }
};

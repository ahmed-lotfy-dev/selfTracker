import { db } from "../db/client";
import { syncQueue, workoutLogs, weightLogs, tasks } from "../db/schema";
import { eq, inArray } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import axiosInstance from "../lib/api/axiosInstane";
import { API_BASE_URL } from "../lib/api/config";
import * as SecureStore from "expo-secure-store";

const LAST_SYNCED_KEY = "last_synced_at";

type SyncAction = "INSERT" | "UPDATE" | "DELETE";
type TableName = "workout_logs" | "weight_logs" | "tasks";

interface SyncQueueItem {
  id: string;
  action: SyncAction;
  tableName: TableName;
  rowId: string;
  data: unknown;
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
    const response = await axiosInstance.post(`${API_BASE_URL}/api/sync/push`, {
      changes: queue.map((item) => ({
        ...item,
        data: typeof item.data === "string" ? JSON.parse(item.data) : item.data,
      })),
    });

    if (response.status === 200) {
      const processedIds = queue.map((q) => q.id);
      await db.delete(syncQueue).where(inArray(syncQueue.id, processedIds));

      const tableMap = { workout_logs: workoutLogs, weight_logs: weightLogs, tasks };
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

export const pullChanges = async (): Promise<{ success: boolean; pulled: number }> => {
  const lastSynced = await SecureStore.getItemAsync(LAST_SYNCED_KEY);
  const since = lastSynced || new Date(0).toISOString();

  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/api/sync/pull`, {
      params: { since },
    });

    if (response.status === 200) {
      const { changes, serverTime } = response.data;
      let pulled = 0;

      for (const change of changes || []) {
        const tableMap = { workout_logs: workoutLogs, weight_logs: weightLogs, tasks };
        const table = tableMap[change.tableName as keyof typeof tableMap];

        if (!table) continue;

        if (change.deletedAt) {
          await db.update(table).set({ deletedAt: new Date(change.deletedAt) }).where(eq(table.id, change.id));
        } else {
          const existing = await db.select().from(table).where(eq(table.id, change.id)).limit(1);
          if (existing.length > 0) {
            await db.update(table).set({ ...change, syncStatus: "synced" }).where(eq(table.id, change.id));
          } else {
            await db.insert(table).values({ ...change, syncStatus: "synced" });
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
    const [weightsRes, workoutsRes, tasksRes] = await Promise.all([
      axiosInstance.get(`${API_BASE_URL}/api/weightLogs?limit=1000`),
      axiosInstance.get(`${API_BASE_URL}/api/workoutLogs?limit=1000`),
      axiosInstance.get(`${API_BASE_URL}/api/tasks`),
    ]);

    const weights = weightsRes.data.logs || [];
    for (const w of weights) {
      await db.insert(weightLogs).values({
        id: w.id,
        userId: w.userId,
        weight: w.weight,
        mood: w.mood,
        energy: w.energy,
        notes: w.notes,
        createdAt: w.createdAt,
        syncStatus: "synced",
      }).onConflictDoNothing();
      synced++;
    }

    const workouts = workoutsRes.data.logs || [];
    for (const w of workouts) {
      await db.insert(workoutLogs).values({
        id: w.id,
        userId: w.userId,
        workoutId: w.workoutId,
        workoutName: w.workoutName,
        notes: w.notes,
        createdAt: w.createdAt,
        syncStatus: "synced",
      }).onConflictDoNothing();
      synced++;
    }

    const taskList = tasksRes.data || [];
    for (const t of taskList) {
      await db.insert(tasks).values({
        id: t.id,
        userId: t.userId,
        title: t.title,
        completed: t.completed,
        dueDate: t.dueDate,
        category: t.category || "general",
        createdAt: t.createdAt,
        syncStatus: "synced",
      }).onConflictDoNothing();
      synced++;
    }

    await SecureStore.setItemAsync(INITIAL_SYNC_DONE_KEY, "true");
    console.log(`Initial sync complete. Synced ${synced} records.`);
    return { success: true, synced };
  } catch (error) {
    console.error("Initial sync failed:", error);
    return { success: false, synced: 0 };
  }
};

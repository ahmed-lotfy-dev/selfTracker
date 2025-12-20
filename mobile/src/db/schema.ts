import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export type SyncStatus = "pending" | "synced" | "conflict";

export const workoutLogs = sqliteTable("workout_logs", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  workoutId: text("workout_id").notNull(),
  workoutName: text("workout_name").notNull(),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
  syncStatus: text("sync_status").$type<SyncStatus>().default("pending"),
});

export const weightLogs = sqliteTable("weight_logs", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  weight: integer("weight").notNull(),
  mood: text("mood"),
  energy: text("energy"),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
  syncStatus: text("sync_status").$type<SyncStatus>().default("pending"),
});

export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  dueDate: text("due_date"),
  category: text("category").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
  syncStatus: text("sync_status").$type<SyncStatus>().default("pending"),
});

export const syncQueue = sqliteTable("sync_queue", {
  id: text("id").primaryKey(),
  action: text("action").notNull(),
  tableName: text("table_name").notNull(),
  rowId: text("row_id").notNull(),
  data: text("data", { mode: "json" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const workouts = sqliteTable("workouts", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  trainingSplitId: text("training_split_id"),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
});

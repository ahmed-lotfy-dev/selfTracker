import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export type SyncStatus = "pending" | "synced" | "conflict";

export const workoutLogs = sqliteTable("workout_logs", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  workoutId: text("workout_id").notNull(),
  workoutName: text("workout_name").notNull(),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).defaultNow(),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
  syncStatus: text("sync_status").$type<SyncStatus>().default("pending"),
});

export const weightLogs = sqliteTable("weight_logs", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  weight: text("weight").notNull(), // text to match backend numeric
  mood: text("mood"),
  energy: text("energy"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).defaultNow(),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
  syncStatus: text("sync_status").$type<SyncStatus>().default("pending"),
});

export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  projectId: text("project_id"),
  columnId: text("column_id"),
  title: text("title").notNull(),
  description: text("description"),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  dueDate: integer("due_date", { mode: "timestamp" }),
  priority: text("priority").$type<"low" | "medium" | "high">().default("medium"),
  order: integer("order").default(0),
  category: text("category").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).defaultNow(),
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
  userId: text("user_id"),
  name: text("name").notNull(),
  trainingSplitId: text("training_split_id"),
  createdAt: integer("created_at", { mode: "timestamp" }).defaultNow(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).defaultNow(),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
  syncStatus: text("sync_status").$type<SyncStatus>().default("pending"),
});

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  color: text("color").default("#000000"),
  isArchived: integer("is_archived", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).defaultNow(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).defaultNow(),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
  syncStatus: text("sync_status").$type<SyncStatus>().default("pending"),
});

export const projectColumns = sqliteTable("project_columns", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  name: text("name").notNull(),
  order: integer("order").notNull().default(0),
  type: text("type").$type<"todo" | "doing" | "done">().default("todo"),
  createdAt: integer("created_at", { mode: "timestamp" }).defaultNow(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).defaultNow(),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
  syncStatus: text("sync_status").$type<SyncStatus>().default("pending"),
});

export const userGoals = sqliteTable("user_goals", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  goalType: text("goal_type").notNull(),
  targetValue: text("target_value").notNull(), // text for numeric
  deadline: integer("deadline", { mode: "timestamp" }),
  achieved: integer("achieved", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).defaultNow(),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
  syncStatus: text("sync_status").$type<SyncStatus>().default("pending"),
});

export const exercises = sqliteTable("exercises", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: integer("created_at", { mode: "timestamp" }).defaultNow(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).defaultNow(),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

export const trainingSplits = sqliteTable("training_splits", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdBy: text("created_by"),
  isPublic: integer("is_public", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).defaultNow(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).defaultNow(),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

export const workoutExercises = sqliteTable("workout_exercises", {
  id: text("id").primaryKey(),
  workoutId: text("workout_id").notNull(),
  exerciseId: text("exercise_id").notNull(),
  sets: integer("sets").notNull(),
  reps: integer("reps").notNull(),
  weight: text("weight").notNull(), // text for numeric
  createdAt: integer("created_at", { mode: "timestamp" }).defaultNow(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).defaultNow(),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

export const expenses = sqliteTable("expenses", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  category: text("category").notNull(),
  amount: text("amount").notNull(), // text for numeric
  description: text("description"),
  createdAt: integer("created_at", { mode: "timestamp" }).defaultNow(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).defaultNow(),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
  syncStatus: text("sync_status").$type<SyncStatus>().default("pending"),
});

export const timerSessions = sqliteTable("timer_sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  taskId: text("task_id"),
  startTime: integer("start_time", { mode: "timestamp" }).notNull(),
  endTime: integer("end_time", { mode: "timestamp" }),
  duration: integer("duration"),
  type: text("type").$type<"focus" | "short_break" | "long_break">().default("focus"),
  completed: integer("completed", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).defaultNow(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).defaultNow(),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
  syncStatus: text("sync_status").$type<SyncStatus>().default("pending"),
});


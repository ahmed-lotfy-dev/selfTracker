// import { duration } from "drizzle-orm/gel-core"
import {
  pgTable,
  text,
  boolean,
  timestamp,
  uuid,
  numeric,
  integer,
} from "drizzle-orm/pg-core"

// Users Table
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role", { enum: ["admin", "user"] }).default("user"),
  isVerified: boolean("is_verified").default(false),
  resetToken: text("reset_token"),
  resetTokenExpiresAt: timestamp("reset_token_expires_at"),
  weight: numeric("weight", { precision: 5, scale: 2 }),
  height: numeric("height", { precision: 5, scale: 2 }),
  unitSystem: text("unit_system", { enum: ["metric", "imperial"] }).default(
    "metric"
  ),
  income: numeric("income", { precision: 10, scale: 2 }),
  currency: text("currency").default("EGP").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export type User = typeof users.$inferSelect

// Password Resets Table
export const passwordResets = pgTable("password_resets", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  token: text("token").unique().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
})

// Email Verifications Table
export const emailVerifications = pgTable("email_verifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  token: text("token").unique().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
})

// Refresh Tokens Table
export const refreshTokens = pgTable("refresh_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  token: text("token").unique().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
})

// Expenses Table
export const expenses = pgTable("expenses", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  category: text("category").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  date: timestamp("date").defaultNow().notNull(),
})

// Weight Logs Table
export const weightLogs = pgTable("weight_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  weight: numeric("weight", { precision: 5, scale: 2 }).notNull(),
  energy: text("energy", { enum: ["Low", "Okay", "Good", "Great"] }).notNull(),
  mood: text("mood", { enum: ["Low", "Medium", "High"] }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
})

// Training Splits (Public Splits like PPL, Upper-Lower, etc.)
export const trainingSplits = pgTable("training_splits", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(), // e.g., "Push-Pull-Legs"
  description: text("description"),
  createdBy: uuid("created_by").references(() => users.id, {
    onDelete: "set null",
  }), // Original creator (optional)
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
})

// Workouts (Push Day, Pull Day, etc. - Shared Across Users)
export const workouts = pgTable("workouts", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(), // e.g., "Push Day"
  trainingSplitId: uuid("training_split_id")
    .references(() => trainingSplits.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
})

// Exercises (Bench Press, Squats, etc.)
export const exercises = pgTable("exercises", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  createdBy: uuid("created_by").references(() => users.id, {
    onDelete: "set null",
  }), // Optional creator
  createdAt: timestamp("created_at").defaultNow(),
})

// Workout Exercises (Defines sets, reps, weight per exercise)
export const workoutExercises = pgTable("workout_exercises", {
  id: uuid("id").defaultRandom().primaryKey(),
  workoutId: uuid("workout_id")
    .references(() => workouts.id, { onDelete: "cascade" })
    .notNull(),
  exerciseId: uuid("exercise_id")
    .references(() => exercises.id, { onDelete: "cascade" })
    .notNull(),
  sets: integer("sets").notNull(),
  reps: integer("reps").notNull(),
  weight: numeric("weight", { precision: 5, scale: 2 }).notNull(), // Prescribed weight
  createdAt: timestamp("created_at").defaultNow(),
})

// Workout Logs (Tracks performed sets, reps, weight)
export const workoutLogs = pgTable("workout_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  workoutId: uuid("workout_id")
    .references(() => workouts.id, { onDelete: "cascade" })
    .notNull(),
  //TODO in the future
  // duration: interval("duration").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
})

// User Goals
export const userGoals = pgTable("user_goals", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  goalType: text("goal_type", {
    enum: ["loseWeight", "gainWeight", "bodyFat", "muscleMass"],
  }).notNull(), // Type of goal
  targetValue: numeric("target_value", { precision: 5, scale: 2 }).notNull(), // Target weight/height/body fat
  deadline: timestamp("deadline"), // Optional deadline for goal
  achieved: boolean("achieved").default(false), // Whether the goal is completed
  createdAt: timestamp("created_at").defaultNow(),
})

// User Todo Items
export const tasks = pgTable("tasks_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  completed: boolean("completed").default(false),
  dueDate: timestamp("due_date", { withTimezone: true }),
  category: text("category").default("general"), // "workout", "finance", etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

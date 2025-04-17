// import { duration } from "drizzle-orm/gel-core"
import {
  pgTable,
  text,
  boolean,
  timestamp,
  numeric,
  integer,
} from "drizzle-orm/pg-core"

// Users Table
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  email: text("email").unique().notNull(),
  password: text("password"),
  name: text("name").notNull(),
  role: text("role", { enum: ["admin", "user"] }).default("user"),
  image: text("image"),
  emailVerified: boolean("emailVerified").notNull(),
  resetToken: text("reset_token"),
  resetTokenExpiresAt: timestamp("reset_token_expires_at"),
  gender: text("gender", { enum: ["male", "female"] }),
  weight: numeric("weight", { precision: 5, scale: 2 }),
  height: numeric("height", { precision: 5, scale: 2 }),
  unitSystem: text("unitSystem", { enum: ["metric", "imperial"] }).default(
    "metric"
  ),
  income: numeric("income", { precision: 10, scale: 2 }),
  currency: text("currency").default("EGP"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
})

export type User = typeof user.$inferSelect

// Session Table
export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").unique().notNull(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
})

// Account Table
export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
})

// Verification Table
export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt"),
  updatedAt: timestamp("updatedAt"),
})

// JWKS Table
export const jwks = pgTable("jwks", {
  id: text("id").primaryKey(),
  publicKey: text("publicKey").notNull(),
  privateKey: text("privateKey").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
})

// Expenses Table
export const expense = pgTable("expense", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  category: text("category").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})

// Weight Logs Table
export const weightLog = pgTable("weight_log", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  weight: numeric("weight", { precision: 5, scale: 2 }).notNull(),
  energy: text("energy", { enum: ["Low", "Okay", "Good", "Great"] }).notNull(),
  mood: text("mood", { enum: ["Low", "Medium", "High"] }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})

// Training Splits (Public Splits like PPL, Upper-Lower, etc.)
export const trainingSplit = pgTable("training_split", {
  id: text("id").primaryKey(),
  name: text("name").notNull(), // e.g., "Push-Pull-Legs"
  description: text("description"),
  createdBy: text("created_by").references(() => user.id, {
    onDelete: "set null",
  }),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})

// Workouts (Push Day, Pull Day, etc. - Shared Across Users)
export const workout = pgTable("workout", {
  id: text("id").primaryKey(),
  name: text("name").notNull(), // e.g., "Push Day"
  trainingSplitId: text("training_split_id")
    .references(() => trainingSplit.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})

// Exercises (Bench Press, Squats, etc.)
export const exercise = pgTable("exercise", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdBy: text("created_by").references(() => user.id, {
    onDelete: "set null",
  }), // Optional creator
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})

// Workout Exercises (Defines sets, reps, weight per exercise)
export const workoutExercise = pgTable("workout_exercise", {
  id: text("id").primaryKey(),
  workoutId: text("workout_id")
    .references(() => workout.id, { onDelete: "cascade" })
    .notNull(),
  exerciseId: text("exercise_id")
    .references(() => exercise.id, { onDelete: "cascade" })
    .notNull(),
  sets: integer("sets").notNull(),
  reps: integer("reps").notNull(),
  weight: numeric("weight", { precision: 5, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})

// Workout Logs (Tracks performed sets, reps, weight)
export const workoutLog = pgTable("workout_log", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  workoutId: text("workout_id")
    .references(() => workout.id, { onDelete: "cascade" })
    .notNull(),
  workoutName: text("workout_name").notNull(),
  //TODO in the future
  // duration: interval("duration").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})

// User Goals
export const userGoal = pgTable("user_goal", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  goalType: text("goal_type", {
    enum: ["loseWeight", "gainWeight", "bodyFat", "muscleMass"],
  }).notNull(), // Type of goal
  targetValue: numeric("target_value", { precision: 5, scale: 2 }).notNull(), // Target weight/height/body fat
  deadline: timestamp("deadline"), // Optional deadline for goal
  achieved: boolean("achieved").default(false), // Whether the goal is completed
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})

// User Todo Items
export const task = pgTable("task_item", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
  title: text("title").notNull(),
  description: text("description"),
  completed: boolean("completed").default(false),
  dueDate: timestamp("due_date", { withTimezone: true }),
  category: text("category").default("general"), // "workout", "finance", etc.
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})

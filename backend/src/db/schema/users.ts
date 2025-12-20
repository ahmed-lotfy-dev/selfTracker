import { relations } from "drizzle-orm"
import {
  pgTable,
  text,
  boolean,
  timestamp,
  numeric,
  integer,
  uuid,
  date,
} from "drizzle-orm/pg-core"

import { expenses } from "./expenses"
import { tasks } from "./tasks"
import { userGoals } from "./userGoals"
import { weightLogs } from "./weightLogs"
import { workoutLogs } from "./workoutLogs"
import { z } from "zod"

// Users Table
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").unique().notNull(),
  password: text("password"),
  name: text("name").notNull(),
  dateOfBirth: date(),
  // notificationToken: text("notificationToken"),
  role: text("role"),
  image: text("image"),
  emailVerified: boolean("email_verified").notNull(),
  resetToken: text("reset_token"),
  resetTokenExpiresAt: timestamp("reset_token_expires_at"),
  gender: text("gender"),
  weight: integer("weight"),
  height: integer("height"),
  unitSystem: text("unitSystem", { enum: ["metric", "imperial"] }).default(
    "metric"
  ),
  income: numeric("income", { precision: 10, scale: 2 }),
  currency: text("currency").default("EGP"),
  theme: text("theme", { enum: ["light", "dark", "system"] }).default("system"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
})

export const userRelations = relations(users, ({ many }) => ({
  workoutLogs: many(workoutLogs),
  weightLogs: many(weightLogs),
  expenses: many(expenses),
  tasks: many(tasks),
  goals: many(userGoals),
}))

// Zod schema for user validation
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  password: z.string().optional(),
  name: z.string(),
  dateOfBirth: z.date().optional(),
  role: z.string().optional(),
  image: z.string().optional(),
  emailVerified: z.boolean(),
  resetToken: z.string().optional(),
  resetTokenExpiresAt: z.date().optional(),
  gender: z.string().optional(),
  weight: z.number().int().optional(),
  height: z.number().int().optional(),
  unitSystem: z.enum(["metric", "imperial"]).default("metric"),
  income: z.number().optional(),
  currency: z.string().default("EGP"),
  theme: z.enum(["light", "dark", "system"]).default("system"),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// TypeScript type inferred from the Zod schema
export type User = z.infer<typeof userSchema>

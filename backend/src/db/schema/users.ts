import { relations } from "drizzle-orm"
import {
  pgTable,
  text,
  boolean,
  timestamp,
  numeric,
  integer,
  uuid,
} from "drizzle-orm/pg-core"

import { expenses } from "./expenses"
import { tasks } from "./tasks"
import { userGoals } from "./userGoals"
import { weightLogs } from "./weightLogs"
import { workoutLogs } from "./workoutLogs"

// Users Table
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").unique().notNull(),
  password: text("password"),
  name: text("name").notNull(),
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

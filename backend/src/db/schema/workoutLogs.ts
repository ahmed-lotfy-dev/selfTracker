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
import { users } from "./users"
import { workouts } from "./workouts"

// Workout Logs (Tracks performed sets, reps, weight)
export const workoutLogs = pgTable("workout_logs", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  workoutId: text("workout_id")
    .references(() => workouts.id, { onDelete: "cascade" })
    .notNull(),
  workoutName: text("workout_name").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  deletedAt: timestamp("deleted_at"),
})

export const workoutLogRelations = relations(workoutLogs, ({ one }) => ({
  user: one(users, {
    fields: [workoutLogs.userId],
    references: [users.id],
  }),
  workout: one(workouts, {
    fields: [workoutLogs.workoutId],
    references: [workouts.id],
  }),
}))


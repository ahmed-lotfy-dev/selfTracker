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
import users from "./users"
import workoutLogs from "./workoutLogs"
import workouts from "./workouts"

// Weight Logs Table
const weightLogs = pgTable("weight_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("userId")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  weight: numeric("weight", { precision: 5, scale: 2 }).notNull(),
  energy: text("energy", { enum: ["Low", "Okay", "Good", "Great"] }).notNull(),
  mood: text("mood", { enum: ["Low", "Medium", "High"] }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

export default weightLogs

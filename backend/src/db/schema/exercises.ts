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
import { workoutExercises } from "./workoutExercises"

// Exercises (Bench Press, Squats, etc.)
export const exercises = pgTable("exercises", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  deletedAt: timestamp("deleted_at"),
})

export const exerciseRelations = relations(exercises, ({ many }) => ({
  workoutExercises: many(workoutExercises),
}))

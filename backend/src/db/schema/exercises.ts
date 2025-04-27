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
import workoutExercises from "./workoutExercises"

// Exercises (Bench Press, Squats, etc.)
const exercises = pgTable("exercises", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export const exerciseRelations = relations(exercises, ({ many }) => ({
  workoutExercises: many(workoutExercises),
}))

export default exercises

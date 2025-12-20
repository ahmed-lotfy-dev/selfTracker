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
import { workouts } from "./workouts"
import { exercises } from "./exercises"

// Workout Exercises (Defines sets, reps, weight per exercise)
export const workoutExercises = pgTable("workout_exercises", {
  id: text("id").primaryKey(),
  workoutId: text("workout_id")
    .references(() => workouts.id, { onDelete: "cascade" })
    .notNull(),
  exerciseId: text("exercise_id")
    .references(() => exercises.id, { onDelete: "cascade" })
    .notNull(),
  sets: integer("sets").notNull(),
  reps: integer("reps").notNull(),
  weight: numeric("weight", { precision: 5, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  deletedAt: timestamp("deleted_at"),
})

export const workoutExerciseRelations = relations(workoutExercises, ({ one }) => ({
  workout: one(workouts, {
    fields: [workoutExercises.workoutId],
    references: [workouts.id],
  }),
  exercise: one(exercises, {
    fields: [workoutExercises.exerciseId],
    references: [exercises.id],
  }),
}))


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
import { trainingSplits } from "./trainingSplits"
import {workoutLogs} from "./workoutLogs"
import {workoutExercises} from "./workoutExercises"

// Workouts (Push Day, Pull Day, etc. - Shared Across Users)
export const workouts = pgTable("workouts", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(), // e.g., "Push Day"
  trainingSplitId: uuid("training_split_id")
    .references(() => trainingSplits.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export const workoutRelations = relations(workouts, ({ many, one }) => ({
  logs: many(workoutLogs),
  exercises: many(workoutExercises),
  trainingSplit: one(trainingSplits, {
    fields: [workouts.trainingSplitId],
    references: [trainingSplits.id],
  }),
}))


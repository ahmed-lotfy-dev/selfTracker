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

// User Goals
const userGoals = pgTable("user_goals", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("userId")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  goalType: text("goal_type", {
    enum: ["loseWeight", "gainWeight", "bodyFat", "muscleMass"],
  }).notNull(), // Type of goal
  targetValue: numeric("target_value", { precision: 5, scale: 2 }).notNull(),
  deadline: timestamp("deadline"), // Optional deadline for goal
  achieved: boolean("achieved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export default userGoals
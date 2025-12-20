import { relations } from "drizzle-orm"
import {
  pgTable,
  text,
  boolean,
  timestamp,
  integer,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core"
import { users } from "./users"
import { tasks } from "./tasks"

export const sessionTypeEnum = pgEnum("session_type", [
  "focus",
  "short_break",
  "long_break",
])

export const timerSessions = pgTable("timer_sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  taskId: text("task_id").references(() => tasks.id, { onDelete: "set null" }), // Optional link to a task
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  duration: integer("duration"), // Duration in seconds
  type: sessionTypeEnum("type").default("focus"),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  deletedAt: timestamp("deleted_at"),
})

export const timerSessionsRelations = relations(timerSessions, ({ one }) => ({
  user: one(users, {
    fields: [timerSessions.userId],
    references: [users.id],
  }),
  task: one(tasks, {
    fields: [timerSessions.taskId],
    references: [tasks.id],
  }),
}))

import { relations } from "drizzle-orm"
import {
  pgTable,
  text,
  boolean,
  timestamp,
  numeric,
  integer,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core"
import { users } from "./users"

export const priorityEnum = pgEnum("task_priority", ["low", "medium", "high"])

// User Tasks Items
export const tasks = pgTable("task_items", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  // Removed Project/Column references for simplification
  projectId: text("project_id"),
  columnId: text("column_id"),
  title: text("title").notNull(),
  description: text("description"),
  completed: boolean("completed").default(false),
  dueDate: timestamp("due_date", { withTimezone: true }),
  priority: priorityEnum("priority").default("medium"),
  order: integer("order").default(0),
  category: text("category").default("general"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  deletedAt: timestamp("deleted_at"),
})

export const tasksRelations = relations(tasks, ({ one }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
}))

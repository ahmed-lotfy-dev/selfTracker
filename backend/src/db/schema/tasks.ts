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
import { projects, columns } from "./projects"

export const priorityEnum = pgEnum("task_priority", ["low", "medium", "high"])

// User Tasks Items
export const tasks = pgTable("task_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  projectId: uuid("project_id").references(() => projects.id, {
    onDelete: "cascade",
  }),
  columnId: uuid("column_id").references(() => columns.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  description: text("description"), // Added description
  completed: boolean("completed").default(false),
  dueDate: timestamp("due_date", { withTimezone: true }),
  priority: priorityEnum("priority").default("medium"),
  order: integer("order").default(0), // For Kanban sorting
  category: text("category").default("general"), // Keeping for backward compatibility or general grouping
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export const tasksRelations = relations(tasks, ({ one }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  column: one(columns, {
    fields: [tasks.columnId],
    references: [columns.id],
  }),
}))

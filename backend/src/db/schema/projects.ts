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

// Projects Table
export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  color: text("color").default("#000000"),
  isArchived: boolean("is_archived").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
  columns: many(columns),
  tasks: many(tasks),
}))

// Kanban Columns Table
export const columnTypeEnum = pgEnum("column_type", ["todo", "doing", "done"])

export const columns = pgTable("project_columns", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  order: integer("order").notNull().default(0),
  type: columnTypeEnum("type").default("todo"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export const columnsRelations = relations(columns, ({ one, many }) => ({
  project: one(projects, {
    fields: [columns.projectId],
    references: [projects.id],
  }),
  tasks: many(tasks),
}))

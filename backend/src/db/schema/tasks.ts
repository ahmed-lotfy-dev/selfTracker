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

// User Tasks Items
export const tasks = pgTable("task_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  completed: boolean("completed").default(false),
  dueDate: timestamp("due_date", { withTimezone: true }),
  category: text("category").default("general"), // "workout", "finance", etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export const tasksRelations = relations(tasks, ({ one }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
}))

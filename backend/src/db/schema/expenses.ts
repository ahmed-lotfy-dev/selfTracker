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

// Expenses Table
export const expenses = pgTable("expenses", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  category: text("category").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  deletedAt: timestamp("deleted_at"),
})

export const expensesRelations = relations(expenses, ({ one }) => ({
  user: one(users, {
    fields: [expenses.userId],
    references: [users.id],
  }),
}))

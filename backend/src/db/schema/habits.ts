import { relations } from "drizzle-orm"
import {
  pgTable,
  text,
  boolean,
  timestamp,
  integer,
} from "drizzle-orm/pg-core"
import { users } from "./users"

export const habits = pgTable("habits", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  description: text("description"),
  streak: integer("streak").default(0),
  color: text("color").default("#000000"),
  completedToday: boolean("completed_today").default(false),
  // We might want to track the last completion date to manage resets
  lastCompletedAt: timestamp("last_completed_at", { withTimezone: true }),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  deletedAt: timestamp("deleted_at"),
})

export const habitsRelations = relations(habits, ({ one }) => ({
  user: one(users, {
    fields: [habits.userId],
    references: [users.id],
  }),
}))

import { relations } from "drizzle-orm"
import {
  pgTable,
  text,
  timestamp,
  integer,
} from "drizzle-orm/pg-core"
import { users } from "./users"

export const nutritionGoals = pgTable("nutrition_goals", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  dailyCalories: integer("daily_calories").notNull(),
  proteinGrams: integer("protein_grams"),
  carbsGrams: integer("carbs_grams"),
  fatGrams: integer("fat_grams"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  deletedAt: timestamp("deleted_at"),
})

export const nutritionGoalsRelations = relations(nutritionGoals, ({ one }) => ({
  user: one(users, {
    fields: [nutritionGoals.userId],
    references: [users.id],
  }),
}))

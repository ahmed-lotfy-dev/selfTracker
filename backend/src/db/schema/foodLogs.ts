import { relations } from "drizzle-orm"
import {
  pgTable,
  text,
  timestamp,
  integer,
  jsonb,
} from "drizzle-orm/pg-core"
import { users } from "./users"

export type FoodItem = {
  name: string
  quantity: number
  unit: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

export const foodLogs = pgTable("food_logs", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  loggedAt: timestamp("logged_at").notNull(),
  mealType: text("meal_type", {
    enum: ["breakfast", "lunch", "dinner", "snack"]
  }).notNull(),
  foodItems: jsonb("food_items").$type<FoodItem[]>().notNull(),
  totalCalories: integer("total_calories").notNull(),
  totalProtein: integer("total_protein"),
  totalCarbs: integer("total_carbs"),
  totalFat: integer("total_fat"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  deletedAt: timestamp("deleted_at"),
})

export const foodLogsRelations = relations(foodLogs, ({ one }) => ({
  user: one(users, {
    fields: [foodLogs.userId],
    references: [users.id],
  }),
}))

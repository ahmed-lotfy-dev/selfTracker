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

// Training Splits (Public Splits like PPL, Upper-Lower, etc.)
export const trainingSplits = pgTable("training_splits", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(), // e.g., "Push-Pull-Legs"
  description: text("description"),
  createdBy: text("created_by").references(() => users.id, {
    onDelete: "set null",
  }),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

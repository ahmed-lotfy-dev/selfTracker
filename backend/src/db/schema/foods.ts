import { relations } from "drizzle-orm"
import {
  pgTable,
  text,
  timestamp,
  integer,
  real,
  uuid,
  index,
} from "drizzle-orm/pg-core"

export const foods = pgTable("foods", {
  id: uuid("id").defaultRandom().primaryKey(),
  nameEn: text("name_en").notNull(),
  nameAr: text("name_ar"),
  brand: text("brand"),
  category: text("category"),

  // Serving info
  servingSize: real("serving_size").notNull().default(100),
  servingUnit: text("serving_unit").notNull().default("g"),

  // Nutrition per serving
  calories: real("calories").notNull().default(0),
  protein: real("protein").notNull().default(0),
  carbs: real("carbs").notNull().default(0),
  fat: real("fat").notNull().default(0),
  fiber: real("fiber").default(0),
  sugar: real("sugar").default(0),
  sodium: real("sodium").default(0),
  saturatedFat: real("saturated_fat").default(0),
  cholesterol: real("cholesterol").default(0),
  potassium: real("potassium").default(0),

  // Source tracking
  source: text("source", { enum: ["openfoodfacts", "usda", "sfda", "manual", "seed"] }).notNull().default("manual"),
  sourceId: text("source_id"),
  barcode: text("barcode"),

  // Image
  imageUrl: text("image_url"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  // GIN trigram indexes for fuzzy search — created via raw SQL in migration
  // because Drizzle doesn't support .op("gin_trgm_ops") on text columns
  index("idx_foods_name_en").on(table.nameEn),
  index("idx_foods_name_ar").on(table.nameAr),
  index("idx_foods_brand").on(table.brand),
  index("idx_foods_category").on(table.category),
  index("idx_foods_source").on(table.source),
  index("idx_foods_barcode").on(table.barcode),
  index("idx_foods_source_id").on(table.source, table.sourceId),
])

export type Food = typeof foods.$inferSelect
export type NewFood = typeof foods.$inferInsert

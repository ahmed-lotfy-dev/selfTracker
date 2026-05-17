-- Clean migration: Drop and recreate foods table with comprehensive schema
-- This is the FINAL schema - all nutrition data from OFF, USDA, SFDA

DROP TABLE IF EXISTS foods CASCADE;

CREATE TABLE foods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic info
  name_en text NOT NULL,
  name_ar text,
  generic_name text,
  brand text,
  brand_owner text,
  gtin_upc text,

  -- Serving
  serving_size real DEFAULT 100,
  serving_unit text DEFAULT 'g',
  serving_text text,
  household_serving text,

  -- Categories
  category text,
  main_category text,
  food_groups text,
  pnns_group_1 text,
  pnns_group_2 text,

  -- Nutrition per serving (what users see)
  calories real NOT NULL DEFAULT 0,
  protein real NOT NULL DEFAULT 0,
  carbs real NOT NULL DEFAULT 0,
  fat real NOT NULL DEFAULT 0,
  fiber real DEFAULT 0,
  sugar real DEFAULT 0,
  sodium real DEFAULT 0,
  saturated_fat real DEFAULT 0,
  cholesterol real DEFAULT 0,
  potassium real DEFAULT 0,

  -- Nutrition per 100g (raw data)
  energy_kj_100g real,
  energy_kcal_100g real,
  trans_fat_100g real,
  monounsaturated_fat_100g real,
  polyunsaturated_fat_100g real,
  omega_3_100g real,
  omega_6_100g real,
  added_sugars_100g real,
  starch_100g real,
  polyols_100g real,
  soluble_fiber_100g real,
  insoluble_fiber_100g real,
  salt_100g real,
  alcohol_100g real,

  -- Vitamins per 100g
  vitamin_a_100g real,
  vitamin_d_100g real,
  vitamin_e_100g real,
  vitamin_k_100g real,
  vitamin_c_100g real,
  vitamin_b1_100g real,
  vitamin_b2_100g real,
  vitamin_b6_100g real,
  vitamin_b9_100g real,
  vitamin_b12_100g real,
  pantothenic_acid_100g real,
  biotin_100g real,
  choline_100g real,

  -- Minerals per 100g
  calcium_100g real,
  phosphorus_100g real,
  iron_100g real,
  magnesium_100g real,
  zinc_100g real,
  copper_100g real,
  manganese_100g real,
  selenium_100g real,
  iodine_100g real,
  chloride_100g real,
  caffeine_100g real,

  -- Scores
  nutriscore_score real,
  nutriscore_grade text,
  nova_group real,
  environmental_score real,

  -- Ingredients & allergens
  ingredients_text text,
  allergens text,
  traces text,
  additives text,
  labels text,

  -- Metadata
  countries text,
  completeness real,
  publication_date date,

  -- Source
  source text NOT NULL DEFAULT 'manual',
  source_id text,
  barcode text,
  image_url text,

  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_foods_name_en ON foods (name_en);
CREATE INDEX idx_foods_name_ar ON foods (name_ar);
CREATE INDEX idx_foods_brand ON foods (brand);
CREATE INDEX idx_foods_brand_owner ON foods (brand_owner);
CREATE INDEX idx_foods_category ON foods (category);
CREATE INDEX idx_foods_main_category ON foods (main_category);
CREATE INDEX idx_foods_food_groups ON foods (food_groups);
CREATE INDEX idx_foods_source ON foods (source);
CREATE INDEX idx_foods_barcode ON foods (barcode);
CREATE INDEX idx_foods_gtin ON foods (gtin_upc);
CREATE INDEX idx_foods_nutriscore ON foods (nutriscore_grade);
CREATE INDEX idx_foods_countries ON foods (countries);

-- Unique constraint for upserts
ALTER TABLE foods ADD CONSTRAINT uq_foods_source_id UNIQUE (source, source_id);

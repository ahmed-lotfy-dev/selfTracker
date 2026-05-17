-- Branded foods table for USDA Branded Foods data
-- Separate from main foods table due to different structure and volume (~2M rows)

CREATE TABLE IF NOT EXISTS branded_foods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Product info
  fdc_id text UNIQUE NOT NULL,
  name_en text NOT NULL,
  brand_owner text,
  brand_name text,
  subbrand_name text,
  gtin_upc text,
  short_description text,

  -- Category
  branded_food_category text,
  data_source text,
  market_country text,

  -- Serving
  serving_size real,
  serving_size_unit text,
  household_serving text,
  package_weight text,

  -- Nutrition (per serving)
  calories real DEFAULT 0,
  protein real DEFAULT 0,
  carbs real DEFAULT 0,
  fat real DEFAULT 0,
  fiber real DEFAULT 0,
  sugar real DEFAULT 0,
  sodium real DEFAULT 0,
  saturated_fat real DEFAULT 0,
  cholesterol real DEFAULT 0,
  potassium real DEFAULT 0,

  -- Ingredients
  ingredients_text text,

  -- Dates
  modified_date date,
  available_date date,
  discontinued_date date,

  -- Metadata
  preparation_state_code text,
  trade_channel text,
  material_code text,

  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_branded_foods_brand_owner ON branded_foods (brand_owner);
CREATE INDEX idx_branded_foods_brand_name ON branded_foods (brand_name);
CREATE INDEX idx_branded_foods_gtin ON branded_foods (gtin_upc);
CREATE INDEX idx_branded_foods_category ON branded_foods (branded_food_category);
CREATE INDEX idx_branded_foods_name ON branded_foods (name_en);

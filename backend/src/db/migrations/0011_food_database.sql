-- Migration: Add pg_trgm extension and foods table
-- Run this on Neon PostgreSQL before deploying the food database feature

-- 1. Enable pg_trgm extension for fuzzy text search (Arabic + English)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Create foods table
CREATE TABLE IF NOT EXISTS foods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en text NOT NULL,
  name_ar text,
  brand text,
  category text,
  serving_size real NOT NULL DEFAULT 100,
  serving_unit text NOT NULL DEFAULT 'g',
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
  source text NOT NULL DEFAULT 'manual',
  source_id text,
  barcode text,
  image_url text,
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW()
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_foods_name_en
  ON foods USING gin (name_en gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_foods_name_ar
  ON foods USING gin (name_ar gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_foods_brand
  ON foods (brand);

CREATE INDEX IF NOT EXISTS idx_foods_category
  ON foods (category);

CREATE INDEX IF NOT EXISTS idx_foods_source
  ON foods (source);

CREATE INDEX IF NOT EXISTS idx_foods_barcode
  ON foods (barcode);

CREATE INDEX IF NOT EXISTS idx_foods_source_id
  ON foods (source, source_id);

-- 3b. Add unique constraint for ON CONFLICT DO NOTHING in bulk imports
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_foods_source_source_id'
  ) THEN
    ALTER TABLE foods
      ADD CONSTRAINT uq_foods_source_source_id
      UNIQUE (source, source_id);
  END IF;
END $$;

-- 4. Add food_id column to food_logs for referencing foods table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'food_logs' AND column_name = 'food_id'
  ) THEN
    ALTER TABLE food_logs ADD COLUMN food_id uuid REFERENCES foods(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_food_logs_food_id
  ON food_logs (food_id);

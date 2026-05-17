-- Migration: Expand foods table with comprehensive nutrition data
-- Run this on Neon PostgreSQL before importing full food databases

-- Add new columns to existing foods table
DO $$
BEGIN
  -- Basic info
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'generic_name') THEN
    ALTER TABLE foods ADD COLUMN generic_name text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'abbreviated_name') THEN
    ALTER TABLE foods ADD COLUMN abbreviated_name text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'brand_owner') THEN
    ALTER TABLE foods ADD COLUMN brand_owner text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'gtin_upc') THEN
    ALTER TABLE foods ADD COLUMN gtin_upc text;
  END IF;

  -- Serving & quantity
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'serving_size_text') THEN
    ALTER TABLE foods ADD COLUMN serving_size_text text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'household_serving') THEN
    ALTER TABLE foods ADD COLUMN household_serving text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'product_quantity') THEN
    ALTER TABLE foods ADD COLUMN product_quantity real;
  END IF;

  -- Categories & classification
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'main_category') THEN
    ALTER TABLE foods ADD COLUMN main_category text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'food_groups') THEN
    ALTER TABLE foods ADD COLUMN food_groups text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'pnns_group_1') THEN
    ALTER TABLE foods ADD COLUMN pnns_group_1 text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'pnns_group_2') THEN
    ALTER TABLE foods ADD COLUMN pnns_group_2 text;
  END IF;

  -- Nutrition per 100g (extended)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'energy_kj_100g') THEN
    ALTER TABLE foods ADD COLUMN energy_kj_100g real;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'trans_fat_100g') THEN
    ALTER TABLE foods ADD COLUMN trans_fat_100g real;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'monounsaturated_fat_100g') THEN
    ALTER TABLE foods ADD COLUMN monounsaturated_fat_100g real;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'polyunsaturated_fat_100g') THEN
    ALTER TABLE foods ADD COLUMN polyunsaturated_fat_100g real;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'omega_3_100g') THEN
    ALTER TABLE foods ADD COLUMN omega_3_100g real;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'omega_6_100g') THEN
    ALTER TABLE foods ADD COLUMN omega_6_100g real;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'added_sugars_100g') THEN
    ALTER TABLE foods ADD COLUMN added_sugars_100g real;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'starch_100g') THEN
    ALTER TABLE foods ADD COLUMN starch_100g real;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'polyols_100g') THEN
    ALTER TABLE foods ADD COLUMN polyols_100g real;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'soluble_fiber_100g') THEN
    ALTER TABLE foods ADD COLUMN soluble_fiber_100g real;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'insoluble_fiber_100g') THEN
    ALTER TABLE foods ADD COLUMN insoluble_fiber_100g real;
  END IF;

  -- Vitamins
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'vitamin_a_100g') THEN
    ALTER TABLE foods ADD COLUMN vitamin_a_100g real;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'vitamin_d_100g') THEN
    ALTER TABLE foods ADD COLUMN vitamin_d_100g real;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'vitamin_e_100g') THEN
    ALTER TABLE foods ADD COLUMN vitamin_e_100g real;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'vitamin_k_100g') THEN
    ALTER TABLE foods ADD COLUMN vitamin_k_100g real;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'vitamin_c_100g') THEN
    ALTER TABLE foods ADD COLUMN vitamin_c_100g real;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'vitamin_b1_100g') THEN
    ALTER TABLE foods ADD COLUMN vitamin_b1_100g real;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'vitamin_b2_100g') THEN
    ALTER TABLE foods ADD COLUMN vitamin_b2_100g real;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'vitamin_b6_100g') THEN
    ALTER TABLE foods ADD COLUMN vitamin_b6_100g real;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'vitamin_b9_100g') THEN
    ALTER TABLE foods ADD COLUMN vitamin_b9_100g real;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'vitamin_b12_100g') THEN
    ALTER TABLE foods ADD COLUMN vitamin_b12_100g real;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'pantothenic_acid_100g') THEN
    ALTER TABLE foods ADD COLUMN pantothenic_acid_100g real;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'biotin_100g') THEN
    ALTER TABLE foods ADD COLUMN biotin_100g real;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'choline_100g') THEN
    ALTER TABLE foods ADD COLUMN choline_100g real;
  END IF;

  -- Minerals
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'calcium_100g') THEN
    ALTER TABLE foods ADD COLUMN calcium_100g real;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'phosphorus_100g') THEN
    ALTER TABLE foods ADD COLUMN phosphorus_100g real;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'iron_100g') THEN
    ALTER TABLE foods ADD COLUMN iron_100g real;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'magnesium_100g') THEN
    ALTER TABLE foods ADD COLUMN magnesium_100g real;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'zinc_100g') THEN
    ALTER TABLE foods ADD COLUMN zinc_100g real;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'copper_100g') THEN
    ALTER TABLE foods ADD COLUMN copper_100g real;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'manganese_100g') THEN
    ALTER TABLE foods ADD COLUMN manganese_100g real;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'selenium_100g') THEN
    ALTER TABLE foods ADD COLUMN selenium_100g real;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'iodine_100g') THEN
    ALTER TABLE foods ADD COLUMN iodine_100g real;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'chloride_100g') THEN
    ALTER TABLE foods ADD COLUMN chloride_100g real;
  END IF;

  -- Other
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'alcohol_100g') THEN
    ALTER TABLE foods ADD COLUMN alcohol_100g real;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'caffeine_100g') THEN
    ALTER TABLE foods ADD COLUMN caffeine_100g real;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'salt_100g') THEN
    ALTER TABLE foods ADD COLUMN salt_100g real;
  END IF;

  -- Scores & grades
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'nutriscore_score') THEN
    ALTER TABLE foods ADD COLUMN nutriscore_score real;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'nutriscore_grade') THEN
    ALTER TABLE foods ADD COLUMN nutriscore_grade text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'nova_group') THEN
    ALTER TABLE foods ADD COLUMN nova_group real;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'environmental_score') THEN
    ALTER TABLE foods ADD COLUMN environmental_score real;
  END IF;

  -- Ingredients & allergens
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'ingredients_text') THEN
    ALTER TABLE foods ADD COLUMN ingredients_text text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'allergens') THEN
    ALTER TABLE foods ADD COLUMN allergens text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'traces') THEN
    ALTER TABLE foods ADD COLUMN traces text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'additives') THEN
    ALTER TABLE foods ADD COLUMN additives text;
  END IF;

  -- Metadata
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'countries') THEN
    ALTER TABLE foods ADD COLUMN countries text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'labels') THEN
    ALTER TABLE foods ADD COLUMN labels text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'data_quality') THEN
    ALTER TABLE foods ADD COLUMN data_quality text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'completeness') THEN
    ALTER TABLE foods ADD COLUMN completeness real;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'foods' AND column_name = 'publication_date') THEN
    ALTER TABLE foods ADD COLUMN publication_date date;
  END IF;
END $$;

-- Add unique constraint for ON CONFLICT DO NOTHING in bulk imports
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_foods_source_source_id'
  ) THEN
    -- First, handle NULL source_id values by setting them to a unique placeholder
    -- since UNIQUE constraints in PostgreSQL treat NULLs as distinct
    UPDATE foods SET source_id = 'no-id-' || id WHERE source_id IS NULL AND source = 'openfoodfacts';

    ALTER TABLE foods
      ADD CONSTRAINT uq_foods_source_source_id
      UNIQUE (source, source_id);
  END IF;
END $$;

-- Create additional indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_foods_brand_owner ON foods (brand_owner);
CREATE INDEX IF NOT EXISTS idx_foods_gtin_upc ON foods (gtin_upc);
CREATE INDEX IF NOT EXISTS idx_foods_main_category ON foods (main_category);
CREATE INDEX IF NOT EXISTS idx_foods_food_groups ON foods (food_groups);
CREATE INDEX IF NOT EXISTS idx_foods_nutriscore_grade ON foods (nutriscore_grade);
CREATE INDEX IF NOT EXISTS idx_foods_countries ON foods (countries);
CREATE INDEX IF NOT EXISTS idx_foods_source ON foods (source);

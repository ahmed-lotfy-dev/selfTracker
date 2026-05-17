# Food Database CSV Reference
# Documentation of all columns from each data source

## 1. Open Food Facts (openfoodfacts.csv.gz)
# Tab-separated, ~653K rows, 211 columns
# URL: https://world.openfoodfacts.org/data/en.openfoodfacts.org.products.csv.gz

### Key Columns:
# 1: code (barcode)
# 11: product_name
# 12: abbreviated_product_name
# 13: generic_name
# 14: quantity (e.g. "500g")
# 19: brands
# 22: categories
# 43: ingredients_text
# 46: allergens
# 51: serving_size (e.g. "25g")
# 52: serving_quantity (numeric)
# 58: nutriscore_score
# 59: nutriscore_grade (a-e)
# 60: nova_group (1-4)
# 61: pnns_groups_1
# 62: pnns_groups_2
# 69: brand_owner
# 83: image_url
# 89: energy-kj_100g
# 90: energy-kcal_100g
# 93: fat_100g
# 94: saturated-fat_100g
# 128: trans-fat_100g
# 129: cholesterol_100g
# 130: carbohydrates_100g
# 131: sugars_100g
# 132: added-sugars_100g
# 141: starch_100g
# 147: fiber_100g
# 151: proteins_100g
# 155: salt_100g
# 157: sodium_100g
# 158: alcohol_100g
# 159: vitamin-a_100g
# 161: vitamin-d_100g
# 162: vitamin-e_100g
# 163: vitamin-k_100g
# 164: vitamin-c_100g
# 165: vitamin-b1_100g
# 166: vitamin-b2_100g
# 168: vitamin-b6_100g
# 169: vitamin-b9_100g
# 171: vitamin-b12_100g
# 173: pantothenic-acid_100g
# 176: potassium_100g
# 178: calcium_100g
# 179: phosphorus_100g
# 180: iron_100g
# 181: magnesium_100g
# 182: zinc_100g
# 183: copper_100g
# 184: manganese_100g
# 186: selenium_100g
# 189: iodine_100g
# 190: caffeine_100g
# 202: choline_100g

## 2. USDA FoodData Central - Foundation Foods
# CSV format, separate files for food, nutrient, food_nutrient, food_portion

### food.csv: fdc_id, data_type, description, food_category_id, publication_date
### nutrient.csv: id, name, unit_name, nutrient_nbr, rank
### food_nutrient.csv: id, fdc_id, nutrient_id, amount, data_points, derivation_id, min, max, median
### food_portion.csv: id, fdc_id, seq_num, amount, measure_unit_id, portion_description, modifier, gram_weight

### Key nutrient IDs:
# 1003: Protein (g)
# 1004: Total lipid (fat) (g)
# 1005: Carbohydrate (g)
# 1008: Energy (kcal)
# 1051: Water (g)
# 1079: Fiber (g)
# 1089: Iron (mg)
# 1090: Magnesium (mg)
# 1091: Phosphorus (mg)
# 1092: Potassium (mg)
# 1093: Sodium (mg)
# 1095: Zinc (mg)
# 1098: Copper (mg)
# 1101: Manganese (mg)
# 1104: Vitamin A (IU)
# 1106: Vitamin A (RAE)
# 1109: Vitamin E (mg)
# 1110: Vitamin D (IU)
# 1112: Vitamin D (D2+D3)
# 1114: Vitamin C (mg)
# 1120: Thiamin (B1) (mg)
# 1122: Riboflavin (B2) (mg)
# 1123: Niacin (B3) (mg)
# 1124: Pantothenic acid (B5) (mg)
# 1125: Vitamin B6 (mg)
# 1126: Folate (B9) (mcg)
# 1128: Vitamin B12 (mcg)
# 1162: Cholesterol (mg)
# 1253: Cholesterol (mg) [alt]
# 1257: Fatty acids, total trans (g)
# 1258: Fatty acids, total saturated (g)
# 1292: Fiber, total dietary (g)
# 1293: Soluble fiber (g)
# 1294: Insoluble fiber (g)
# 2000: Sugars, total (g)

## 3. USDA SR Legacy
# Similar structure to Foundation but older data
# Key files: sr_legacy_food.csv, food_nutrient.csv, food_portion.csv, nutrient.csv

## 4. USDA Branded Foods (~1M products)
# Key file: branded_food.csv
# Columns: fdc_id, brand_owner, brand_name, gtin_upc, ingredients,
#          serving_size, serving_size_unit, household_serving_fulltext,
#          branded_food_category, data_source, market_country
# Plus food_nutrient.csv with same structure as Foundation

## 5. SFDA (Saudi Food & Drug Authority)
# Manual download required from: https://www.sfda.gov.sa/en/food-composition-table
# Arabic food composition table with local foods
# Will be imported as seed data

#!/bin/bash
# Inspect all downloaded CSV files - headers + sample rows
# Run on VPS: bash inspect-csvs.sh

DATA_DIR="/tmp/food-downloads"
cd "$DATA_DIR"

echo "========================================"
echo "  CSV Structure Inspector"
echo "========================================"

# 1. Open Food Facts
echo ""
echo "=== OPEN FOOD FACTS ==="
echo "Columns (211 total):"
zcat openfoodfacts.csv.gz | head -1 | tr '\t' '\n' | cat -n
echo ""
echo "Sample row (first 30 fields):"
zcat openfoodfacts.csv.gz | head -2 | tail -1 | cut -f1-30
echo ""
echo "Row count:"
zcat openfoodfacts.csv.gz | wc -l

# 2. USDA Foundation Foods
echo ""
echo "=== USDA FOUNDATION FOODS ==="
echo "--- food.csv columns ---"
head -1 usda_foundation/FoodData_Central_foundation_food_csv_2026-04-30/food.csv
echo ""
echo "--- food.csv sample ---"
head -2 usda_foundation/FoodData_Central_foundation_food_csv_2026-04-30/food.csv | tail -1
echo ""
echo "--- nutrient.csv columns ---"
head -1 usda_foundation/FoodData_Central_foundation_food_csv_2026-04-30/nutrient.csv
echo ""
echo "--- nutrient.csv sample (first 5) ---"
head -6 usda_foundation/FoodData_Central_foundation_food_csv_2026-04-30/nutrient.csv
echo ""
echo "--- food_nutrient.csv columns ---"
head -1 usda_foundation/FoodData_Central_foundation_food_csv_2026-04-30/food_nutrient.csv
echo ""
echo "--- food_nutrient.csv sample ---"
head -2 usda_foundation/FoodData_Central_foundation_food_csv_2026-04-30/food_nutrient.csv | tail -1
echo ""
echo "--- food_portion.csv columns ---"
head -1 usda_foundation/FoodData_Central_foundation_food_csv_2026-04-30/food_portion.csv
echo ""
echo "--- food_portion.csv sample ---"
head -2 usda_foundation/FoodData_Central_foundation_food_csv_2026-04-30/food_portion.csv | tail -1

# 3. USDA SR Legacy
echo ""
echo "=== USDA SR LEGACY ==="
echo "--- sr_legacy_food.csv columns ---"
head -1 usda_sr_legacy/FoodData_Central_sr_legacy_food_csv_2018-04/sr_legacy_food.csv
echo ""
echo "--- sr_legacy_food.csv sample ---"
head -2 usda_sr_legacy/FoodData_Central_sr_legacy_food_csv_2018-04/sr_legacy_food.csv | tail -1
echo ""
echo "--- food_nutrient.csv columns ---"
head -1 usda_sr_legacy/FoodData_Central_sr_legacy_food_csv_2018-04/food_nutrient.csv
echo ""
echo "--- food_nutrient.csv sample ---"
head -2 usda_sr_legacy/FoodData_Central_sr_legacy_food_csv_2018-04/food_nutrient.csv | tail -1
echo ""
echo "--- food_portion.csv columns ---"
head -1 usda_sr_legacy/FoodData_Central_sr_legacy_food_csv_2018-04/food_portion.csv
echo ""
echo "--- food_portion.csv sample ---"
head -2 usda_sr_legacy/FoodData_Central_sr_legacy_food_csv_2018-04/food_portion.csv | tail -1
echo ""
echo "--- nutrient.csv columns ---"
head -1 usda_sr_legacy/FoodData_Central_sr_legacy_food_csv_2018-04/nutrient.csv
echo ""
echo "--- nutrient.csv sample (first 5) ---"
head -6 usda_sr_legacy/FoodData_Central_sr_legacy_food_csv_2018-04/nutrient.csv

# 4. USDA Branded Foods
echo ""
echo "=== USDA BRANDED FOODS ==="
echo "--- branded_food.csv columns ---"
head -1 usda_branded/FoodData_Central_branded_food_csv_2026-04-30/branded_food.csv
echo ""
echo "--- branded_food.csv sample ---"
head -2 usda_branded/FoodData_Central_branded_food_csv_2026-04-30/branded_food.csv | tail -1
echo ""
echo "--- food_nutrient.csv columns ---"
head -1 usda_branded/FoodData_Central_branded_food_csv_2026-04-30/food_nutrient.csv
echo ""
echo "--- food_nutrient.csv sample ---"
head -2 usda_branded/FoodData_Central_branded_food_csv_2026-04-30/food_nutrient.csv | tail -1
echo ""
echo "--- nutrient.csv columns ---"
head -1 usda_branded/FoodData_Central_branded_food_csv_2026-04-30/nutrient.csv
echo ""
echo "--- nutrient.csv sample (first 5) ---"
head -6 usda_branded/FoodData_Central_branded_food_csv_2026-04-30/nutrient.csv

echo ""
echo "========================================"
echo "  Inspection Complete"
echo "========================================"

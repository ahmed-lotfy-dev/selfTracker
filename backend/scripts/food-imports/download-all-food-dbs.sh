#!/bin/bash
# Master script to download all food database CSVs
# Run on VPS: bash download-all-food-dbs.sh

set -e

DATA_DIR="/tmp/food-downloads"
mkdir -p "$DATA_DIR"
cd "$DATA_DIR"

echo "========================================"
echo "  Food Database CSV Downloader"
echo "  Target: $DATA_DIR"
echo "========================================"

# 1. Open Food Facts (~1.2GB compressed, ~2.5M products)
echo ""
echo "=== [1/3] Open Food Facts ==="
if [ -f "openfoodfacts.csv.gz" ]; then
  echo "Already exists: openfoodfacts.csv.gz ($(du -h openfoodfacts.csv.gz | cut -f1))"
  read -p "Re-download? (y/n): " redl
  if [ "$redl" = "y" ]; then
    wget --show-progress "https://static.openfoodfacts.org/data/en.openfoodfacts.org.products.csv.gz" -O openfoodfacts.csv.gz
  fi
else
  wget --show-progress "https://static.openfoodfacts.org/data/en.openfoodfacts.org.products.csv.gz" -O openfoodfacts.csv.gz
fi

# 2. USDA FoodData Central - Foundation Foods (~3.7MB)
echo ""
echo "=== [2/3] USDA FoodData Central - Foundation Foods ==="
if [ -f "usda_foundation.zip" ]; then
  echo "Already exists: usda_foundation.zip ($(du -h usda_foundation.zip | cut -f1))"
  read -p "Re-download? (y/n): " redl
  if [ "$redl" = "y" ]; then
    wget --show-progress "https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_foundation_food_csv_2026-04-30.zip" -O usda_foundation.zip
  fi
else
  wget --show-progress "https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_foundation_food_csv_2026-04-30.zip" -O usda_foundation.zip
fi

# 3. USDA FoodData Central - SR Legacy (~5.8MB)
echo ""
echo "=== [3/3] USDA FoodData Central - SR Legacy ==="
if [ -f "usda_sr_legacy.zip" ]; then
  echo "Already exists: usda_sr_legacy.zip ($(du -h usda_sr_legacy.zip | cut -f1))"
  read -p "Re-download? (y/n): " redl
  if [ "$redl" = "y" ]; then
    wget --show-progress "https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_sr_legacy_food_csv_2018-04.zip" -O usda_sr_legacy.zip
  fi
else
  wget --show-progress "https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_sr_legacy_food_csv_2018-04.zip" -O usda_sr_legacy.zip
fi

# 4. USDA FoodData Central - Branded Foods (~428MB)
echo ""
echo "=== [4/4] USDA FoodData Central - Branded Foods ==="
if [ -f "usda_branded.zip" ]; then
  echo "Already exists: usda_branded.zip ($(du -h usda_branded.zip | cut -f1))"
  read -p "Re-download? (y/n): " redl
  if [ "$redl" = "y" ]; then
    wget --show-progress "https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_branded_food_csv_2026-04-30.zip" -O usda_branded.zip
  fi
else
  wget --show-progress "https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_branded_food_csv_2026-04-30.zip" -O usda_branded.zip
fi

echo ""
echo "========================================"
echo "  Downloads Complete!"
echo "========================================"
echo ""
echo "Files in $DATA_DIR:"
ls -lh "$DATA_DIR/"
echo ""
echo "Total size:"
du -sh "$DATA_DIR/"

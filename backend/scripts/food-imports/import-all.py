#!/usr/bin/env python3
"""
Master Food Database Import Script
Uses psycopg2 COPY FROM STDIN for fast bulk import

Usage:
  python3 import-all.py --limit 100
  python3 import-all.py
"""

import csv
import sys
import os
import psycopg2
from io import StringIO

DATA_DIR = "/tmp/food-imports"

USDA_NUTRIENT_MAP = {
    "1003": "protein", "1004": "fat", "1005": "carbs", "1008": "calories",
    "1079": "fiber", "1089": "iron_100g", "1090": "magnesium_100g",
    "1091": "phosphorus_100g", "1092": "potassium", "1093": "sodium",
    "1095": "zinc_100g", "1098": "copper_100g", "1101": "manganese_100g",
    "1106": "vitamin_a_100g", "1109": "vitamin_e_100g", "1112": "vitamin_d_100g",
    "1114": "vitamin_c_100g", "1120": "vitamin_b1_100g", "1122": "vitamin_b2_100g",
    "1124": "pantothenic_acid_100g", "1125": "vitamin_b6_100g",
    "1126": "vitamin_b9_100g", "1128": "vitamin_b12_100g",
    "1162": "cholesterol", "1253": "cholesterol",
    "1257": "trans_fat_100g", "1258": "saturated_fat", "1292": "fiber", "2000": "sugar",
}

BRANDED_NUTRIENT_MAP = {
    "1003": "protein", "1004": "fat", "1005": "carbs", "1008": "calories",
    "1079": "fiber", "1093": "sodium", "1092": "potassium",
    "1258": "saturated_fat", "1162": "cholesterol", "2000": "sugar",
}

def get_db_url():
    """Get database URL from environment"""
    url = os.environ.get("DATABASE_URL")
    if not url:
        # Try to read from .env file
        env_path = "/app/.env"
        if os.path.exists(env_path):
            with open(env_path) as f:
                for line in f:
                    if line.startswith("DATABASE_URL="):
                        url = line.strip().split("=", 1)[1].strip().strip('"').strip("'")
                        break
    return url

def load_csv(filepath):
    """Load CSV file into list of dicts"""
    if not os.path.exists(filepath):
        print(f"  Not found: {filepath}")
        return []
    with open(filepath, "r", encoding="utf-8", errors="replace") as f:
        reader = csv.DictReader(f)
        return list(reader)

def build_nutrient_map(nutrient_records, nutrient_map):
    """Build fdc_id -> {column: value} map"""
    result = {}
    for n in nutrient_records:
        col = nutrient_map.get(n.get("nutrient_id", ""))
        try:
            amt = float(n.get("amount", 0))
        except (ValueError, TypeError):
            continue
        if col and amt == amt:  # not NaN
            fdc_id = n.get("fdc_id", "")
            if fdc_id not in result:
                result[fdc_id] = {}
            result[fdc_id][col] = amt
    return result

def val(v, default="\\N"):
    """Format value for COPY"""
    if v is None or v == "" or v == "None":
        return "\\N"
    return str(v).replace("\t", " ").replace("\n", " ").replace("\r", "")

def import_usda(conn, source, food_file, nutrient_file, limit):
    """Import USDA foods using COPY"""
    print(f"\n[{source}] Loading...")
    foods = load_csv(food_file)
    nutrients = load_csv(nutrient_file)
    print(f"[{source}] {len(foods)} foods, {len(nutrients)} nutrients")

    nmap = build_nutrient_map(nutrients, USDA_NUTRIENT_MAP)
    print(f"[{source}] Nutrients mapped for {len(nmap)} foods")

    max_rows = min(limit, len(foods)) if limit > 0 else len(foods)

    # Build CSV data in memory
    buf = StringIO()
    for i in range(max_rows):
        f = foods[i]
        n = nmap.get(f.get("fdc_id", ""), {})
        row = [
            val(f.get("description", "Unknown")[:500]),  # name_en
            val(f.get("food_category_id")),               # category
            source,                                        # source
            val(f.get("fdc_id")),                          # source_id
            "100",                                         # serving_size
            "g",                                           # serving_unit
            str(n.get("calories", 0)),
            str(n.get("protein", 0)),
            str(n.get("carbs", 0)),
            str(n.get("fat", 0)),
            str(n.get("fiber", 0)),
            str(n.get("sugar", 0)),
            str(n.get("sodium", 0)),
            str(n.get("saturated_fat", 0)),
            str(n.get("cholesterol", 0)),
            str(n.get("potassium", 0)),
            val(n.get("calcium_100g")),
            val(n.get("iron_100g")),
            val(n.get("magnesium_100g")),
            val(n.get("phosphorus_100g")),
            val(n.get("zinc_100g")),
            val(n.get("copper_100g")),
            val(n.get("manganese_100g")),
            val(n.get("selenium_100g")),
            val(n.get("vitamin_a_100g")),
            val(n.get("vitamin_d_100g")),
            val(n.get("vitamin_e_100g")),
            val(n.get("vitamin_c_100g")),
            val(n.get("vitamin_b1_100g")),
            val(n.get("vitamin_b2_100g")),
            val(n.get("vitamin_b6_100g")),
            val(n.get("vitamin_b9_100g")),
            val(n.get("vitamin_b12_100g")),
            val(n.get("trans_fat_100g")),
            val(n.get("added_sugars_100g")),
            val(n.get("starch_100g")),
            val(f.get("publication_date")),
        ]
        buf.write("\t".join(row) + "\n")

    buf.seek(0)
    cur = conn.cursor()

    try:
        cur.copy_expert("""
            COPY foods (
                name_en, category, source, source_id, serving_size, serving_unit,
                calories, protein, carbs, fat, fiber, sugar, sodium, saturated_fat, cholesterol, potassium,
                calcium_100g, iron_100g, magnesium_100g, phosphorus_100g, zinc_100g, copper_100g,
                manganese_100g, selenium_100g, vitamin_a_100g, vitamin_d_100g, vitamin_e_100g,
                vitamin_c_100g, vitamin_b1_100g, vitamin_b2_100g, vitamin_b6_100g, vitamin_b9_100g,
                vitamin_b12_100g, trans_fat_100g, added_sugars_100g, starch_100g, publication_date
            ) FROM STDIN WITH (FORMAT text, NULL '\\N')
        """, buf)
        conn.commit()
        print(f"[{source}] Imported {max_rows} rows")
    except Exception as e:
        conn.rollback()
        print(f"[{source}] ERROR: {str(e)[:300]}")

def import_branded(conn, branded_food_file, nutrient_file, limit):
    """Import branded foods using COPY"""
    print(f"\n[usda_branded] Loading...")
    foods = load_csv(branded_food_file)
    nutrients = load_csv(nutrient_file)
    print(f"[usda_branded] {len(foods)} foods, {len(nutrients)} nutrients")

    nmap = build_nutrient_map(nutrients, BRANDED_NUTRIENT_MAP)

    max_rows = min(limit, len(foods)) if limit > 0 else len(foods)

    buf = StringIO()
    for i in range(max_rows):
        f = foods[i]
        n = nmap.get(f.get("fdc_id", ""), {})
        row = [
            val(f.get("fdc_id")),
            val(f.get("description", "Unknown")[:500]),
            val(f.get("brand_owner")),
            val(f.get("brand_name")),
            val(f.get("gtin_upc")),
            val(f.get("branded_food_category")),
            val(f.get("serving_size")) if f.get("serving_size") else "\\N",
            val(f.get("serving_size_unit")),
            val(f.get("ingredients", "")[:1000]),
            str(n.get("calories", 0)),
            str(n.get("protein", 0)),
            str(n.get("carbs", 0)),
            str(n.get("fat", 0)),
            str(n.get("fiber", 0)),
            str(n.get("sugar", 0)),
            str(n.get("sodium", 0)),
            str(n.get("saturated_fat", 0)),
            str(n.get("cholesterol", 0)),
            str(n.get("potassium", 0)),
        ]
        buf.write("\t".join(row) + "\n")

    buf.seek(0)
    cur = conn.cursor()

    try:
        cur.copy_expert("""
            COPY branded_foods (
                fdc_id, name_en, brand_owner, brand_name, gtin_upc,
                branded_food_category, serving_size, serving_size_unit, ingredients_text,
                calories, protein, carbs, fat, fiber, sugar, sodium, saturated_fat, cholesterol, potassium
            ) FROM STDIN WITH (FORMAT text, NULL '\\N')
        """, buf)
        conn.commit()
        print(f"[usda_branded] Imported {max_rows} rows")
    except Exception as e:
        conn.rollback()
        print(f"[usda_branded] ERROR: {str(e)[:300]}")

def main():
    limit = int(sys.argv[1]) if len(sys.argv) > 1 and sys.argv[1].isdigit() else 0

    print("=" * 50)
    print("  Master Food Database Import (Python COPY)")
    print("=" * 50)

    db_url = get_db_url()
    if not db_url:
        print("ERROR: DATABASE_URL not found")
        sys.exit(1)

    conn = psycopg2.connect(db_url)
    cur = conn.cursor()

    # Truncate
    print("\n[1/4] Truncating...")
    cur.execute("TRUNCATE foods, branded_foods RESTART IDENTITY CASCADE")
    conn.commit()
    print("[1/4] Done!")

    # Import USDA Foundation
    import_usda(conn, "usda_foundation",
        f"{DATA_DIR}/usda_foundation/FoodData_Central_foundation_food_csv_2026-04-30/food.csv",
        f"{DATA_DIR}/usda_foundation/FoodData_Central_foundation_food_csv_2026-04-30/food_nutrient.csv",
        limit)

    # Import SR Legacy
    import_usda(conn, "usda_sr_legacy",
        f"{DATA_DIR}/usda_sr_legacy/FoodData_Central_sr_legacy_food_csv_2018-04/food.csv",
        f"{DATA_DIR}/usda_sr_legacy/FoodData_Central_sr_legacy_food_csv_2018-04/food_nutrient.csv",
        limit)

    # Import Branded
    import_branded(conn,
        f"{DATA_DIR}/usda_branded/FoodData_Central_branded_food_csv_2026-04-30/branded_food.csv",
        f"{DATA_DIR}/usda_branded/FoodData_Central_branded_food_csv_2026-04-30/food_nutrient.csv",
        limit)

    # Stats
    cur.execute("SELECT count(*) FROM foods")
    food_count = cur.fetchone()[0]
    cur.execute("SELECT count(*) FROM branded_foods")
    branded_count = cur.fetchone()[0]

    print(f"\n{'=' * 50}")
    print(f"  Import Complete!")
    print(f"  Foods: {food_count}")
    print(f"  Branded: {branded_count}")
    print(f"{'=' * 50}")

    conn.close()

if __name__ == "__main__":
    main()

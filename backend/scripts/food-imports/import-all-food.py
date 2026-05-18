#!/usr/bin/env python3
"""
Food Database Import Script - Streaming COPY approach
Best practices: stream data in chunks, don't load everything into memory
"""

import csv
import sys
import os
import subprocess
import psycopg2
from io import StringIO

DATA_DIR = "/tmp/food-imports"
BATCH_SIZE = 5000  # rows per batch

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
    result = subprocess.run(
        ["docker", "exec", "selftracker-backend", "node", "-e", "console.log(process.env.DATABASE_URL)"],
        capture_output=True, text=True
    )
    return result.stdout.strip()

def val(v, max_len=500):
    if v is None or str(v).strip() == "" or str(v).strip() == "None":
        return "\\N"
    return str(v).replace("\t", " ").replace("\n", " ").replace("\r", "")[:max_len]

def stream_csv(filepath):
    """Generator that yields rows from CSV file - memory efficient"""
    with open(filepath, "r", encoding="utf-8", errors="replace") as f:
        reader = csv.DictReader(f)
        for row in reader:
            yield row

def build_nutrient_map_streaming(nutrient_file, nmap):
    """Build nutrient map by streaming - memory efficient for large files"""
    result = {}
    count = 0
    for row in stream_csv(nutrient_file):
        col = nmap.get(row.get("nutrient_id", ""))
        try:
            amt = float(row.get("amount", 0))
        except (ValueError, TypeError):
            continue
        if col and amt == amt:  # not NaN
            fdc = row.get("fdc_id", "")
            if fdc not in result:
                result[fdc] = {}
            result[fdc][col] = amt
        count += 1
        if count % 500000 == 0:
            print(f"  Processed {count} nutrient rows...")
    return result

def copy_batch(cur, table, columns, rows):
    """Use COPY FROM STDIN for a batch of rows"""
    buf = StringIO()
    for row in rows:
        buf.write("\t".join(str(v) for v in row) + "\n")
    buf.seek(0)
    cols = ", ".join(columns)
    cur.copy_expert(f"COPY {table} ({cols}) FROM STDIN WITH (FORMAT text, NULL '\\N')", buf)

def import_usda(db_url, source, food_file, nutrient_file, limit):
    print(f"\n[{source}] Building nutrient map (streaming)...")
    nmap = build_nutrient_map_streaming(nutrient_file, USDA_NUTRIENT_MAP)
    print(f"[{source}] Nutrients mapped for {len(nmap)} foods")

    print(f"[{source}] Importing foods (streaming)...")
    columns = [
        "name_en", "category", "source", "source_id", "serving_size", "serving_unit",
        "calories", "protein", "carbs", "fat", "fiber", "sugar", "sodium",
        "saturated_fat", "cholesterol", "potassium",
        "calcium_100g", "iron_100g", "magnesium_100g", "phosphorus_100g",
        "zinc_100g", "copper_100g", "manganese_100g", "selenium_100g",
        "vitamin_a_100g", "vitamin_d_100g", "vitamin_e_100g", "vitamin_c_100g",
        "vitamin_b1_100g", "vitamin_b2_100g", "vitamin_b6_100g",
        "vitamin_b9_100g", "vitamin_b12_100g",
        "trans_fat_100g", "added_sugars_100g", "starch_100g", "publication_date"
    ]

    conn = psycopg2.connect(db_url)
    cur = conn.cursor()

    batch = []
    imported = 0
    total = 0

    for food in stream_csv(food_file):
        if limit > 0 and total >= limit:
            break
        n = nmap.get(food.get("fdc_id", ""), {})
        batch.append([
            val(food.get("description", "Unknown")),
            val(food.get("food_category_id")),
            source,
            val(food.get("fdc_id")),
            100, "g",
            n.get("calories", 0), n.get("protein", 0), n.get("carbs", 0), n.get("fat", 0),
            n.get("fiber", 0), n.get("sugar", 0), n.get("sodium", 0),
            n.get("saturated_fat", 0), n.get("cholesterol", 0), n.get("potassium", 0),
            n.get("calcium_100g"), n.get("iron_100g"), n.get("magnesium_100g"),
            n.get("phosphorus_100g"), n.get("zinc_100g"), n.get("copper_100g"),
            n.get("manganese_100g"), n.get("selenium_100g"),
            n.get("vitamin_a_100g"), n.get("vitamin_d_100g"), n.get("vitamin_e_100g"),
            n.get("vitamin_c_100g"), n.get("vitamin_b1_100g"), n.get("vitamin_b2_100g"),
            n.get("vitamin_b6_100g"), n.get("vitamin_b9_100g"), n.get("vitamin_b12_100g"),
            n.get("trans_fat_100g"), n.get("added_sugars_100g"), n.get("starch_100g"),
            val(food.get("publication_date")),
        ])
        total += 1

        if len(batch) >= BATCH_SIZE:
            try:
                copy_batch(cur, "foods", columns, batch)
                conn.commit()
                imported += len(batch)
                print(f"[{source}] {imported} imported...")
            except Exception as e:
                conn.rollback()
                print(f"[{source}] ERROR: {str(e)[:200]}")
            batch = []

    # Final batch
    if batch:
        try:
            copy_batch(cur, "foods", columns, batch)
            conn.commit()
            imported += len(batch)
        except Exception as e:
            conn.rollback()
            print(f"[{source}] ERROR: {str(e)[:200]}")

    conn.close()
    print(f"[{source}] Done! {imported} imported")

def import_branded(db_url, branded_food_file, nutrient_file, limit):
    print(f"\n[usda_branded] Building nutrient map (streaming)...")
    nmap = build_nutrient_map_streaming(nutrient_file, BRANDED_NUTRIENT_MAP)
    print(f"[usda_branded] Nutrients mapped for {len(nmap)} foods")

    print(f"[usda_branded] Importing branded foods (streaming)...")
    columns = [
        "fdc_id", "name_en", "brand_owner", "brand_name", "gtin_upc",
        "branded_food_category", "serving_size", "serving_size_unit", "ingredients_text",
        "calories", "protein", "carbs", "fat", "fiber", "sugar", "sodium",
        "saturated_fat", "cholesterol", "potassium"
    ]

    conn = psycopg2.connect(db_url)
    cur = conn.cursor()

    batch = []
    imported = 0
    total = 0

    for food in stream_csv(branded_food_file):
        if limit > 0 and total >= limit:
            break
        n = nmap.get(food.get("fdc_id", ""), {})
        try:
            sv = str(float(food["serving_size"])) if food.get("serving_size") else "\\N"
        except:
            sv = "\\N"
        batch.append([
            val(food.get("fdc_id")), val(food.get("description", "Unknown")),
            val(food.get("brand_owner")), val(food.get("brand_name")),
            val(food.get("gtin_upc")), val(food.get("branded_food_category")),
            sv, val(food.get("serving_size_unit")),
            val((food.get("ingredients") or "")[:1000]),
            n.get("calories", 0), n.get("protein", 0), n.get("carbs", 0), n.get("fat", 0),
            n.get("fiber", 0), n.get("sugar", 0), n.get("sodium", 0),
            n.get("saturated_fat", 0), n.get("cholesterol", 0), n.get("potassium", 0),
        ])
        total += 1

        if len(batch) >= BATCH_SIZE:
            try:
                copy_batch(cur, "branded_foods", columns, batch)
                conn.commit()
                imported += len(batch)
                print(f"[usda_branded] {imported} imported...")
            except Exception as e:
                conn.rollback()
                print(f"[usda_branded] ERROR: {str(e)[:200]}")
            batch = []

    if batch:
        try:
            copy_batch(cur, "branded_foods", columns, batch)
            conn.commit()
            imported += len(batch)
        except Exception as e:
            conn.rollback()
            print(f"[usda_branded] ERROR: {str(e)[:200]}")

    conn.close()
    print(f"[usda_branded] Done! {imported} imported")

def main():
    limit = 0
    for arg in sys.argv[1:]:
        if arg.isdigit():
            limit = int(arg)
            break

    print("=" * 50)
    print("  Food Database Import (Streaming COPY)")
    print("=" * 50)

    db_url = get_db_url()
    print(f"DB: {db_url[:60]}...")

    # Truncate
    print("\n[1/4] Truncating...")
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    cur.execute("TRUNCATE foods, branded_foods RESTART IDENTITY CASCADE")
    conn.commit()
    conn.close()
    print("[1/4] Done!")

    # Import
    import_usda(db_url, "usda_foundation",
        f"{DATA_DIR}/usda_foundation/FoodData_Central_foundation_food_csv_2026-04-30/food.csv",
        f"{DATA_DIR}/usda_foundation/FoodData_Central_foundation_food_csv_2026-04-30/food_nutrient.csv",
        limit)

    import_usda(db_url, "usda_sr_legacy",
        f"{DATA_DIR}/usda_sr_legacy/FoodData_Central_sr_legacy_food_csv_2018-04/food.csv",
        f"{DATA_DIR}/usda_sr_legacy/FoodData_Central_sr_legacy_food_csv_2018-04/food_nutrient.csv",
        limit)

    import_branded(db_url,
        f"{DATA_DIR}/usda_branded/FoodData_Central_branded_food_csv_2026-04-30/branded_food.csv",
        f"{DATA_DIR}/usda_branded/FoodData_Central_branded_food_csv_2026-04-30/food_nutrient.csv",
        limit)

    # Stats
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    cur.execute("SELECT count(*) FROM foods")
    fc = cur.fetchone()[0]
    cur.execute("SELECT count(*) FROM branded_foods")
    bc = cur.fetchone()[0]
    conn.close()

    print(f"\n{'=' * 50}")
    print(f"  Import Complete!")
    print(f"  Foods: {fc}")
    print(f"  Branded: {bc}")
    print(f"{'=' * 50}")

if __name__ == "__main__":
    main()

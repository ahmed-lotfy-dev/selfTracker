# Food Database Import Scripts

Scripts to populate the `foods` table in Neon PostgreSQL from various open data sources.
**Run these on the VPS** to avoid using local internet quota.

## Quick Start

```bash
# 1. Import Arabic food seed data (built-in, ~200 foods, no download needed)
bun run scripts/food-imports/import-sfda.ts --seed

# 2. Import everything (seed + OFF + USDA if available)
bun run scripts/food-imports/import-all.ts --skip-off --skip-usda
```

## Data Sources

### 1. SFDA Arabic Food Seed (built-in)
- **Source**: Built-in seed data with ~200 common Arabic/Middle Eastern foods
- **Download**: None needed
- **Usage**: `bun run scripts/food-imports/import-sfda.ts --seed`
- **Categories**: grains, protein, dairy, vegetables, fruits, nuts, legumes, oils, beverages, arabic dishes, sweets, condiments, fast food, breakfast

### 2. Open Food Facts (OFF)
- **Source**: https://world.openfoodfacts.org/data/en.openfoodfacts.org.products.csv.gz
- **Size**: ~2-3GB compressed
- **Coverage**: ~2.5M products, international including Arabic products
- **License**: Open Database License (ODbL)
- **Usage**:
  ```bash
  # Download and import (runs on VPS)
  bun run scripts/food-imports/import-openfoodfacts.ts
  
  # Import with limit (for testing)
  bun run scripts/food-imports/import-openfoodfacts.ts --limit 1000
  
  # Skip download (if already downloaded)
  bun run scripts/food-imports/import-openfoodfacts.ts --skip-download
  ```

### 3. USDA FoodData Central
- **Source**: https://fdc.nal.usda.gov/download-datasets.html
- **Size**: ~500MB compressed
- **Coverage**: ~300K foods, primarily US products
- **License**: Public Domain
- **Usage**:
  1. Download food.csv, food_nutrient.csv, food_portion.csv from USDA website
  2. Place in `/tmp/food-imports/usda/`
  3. Run: `bun run scripts/food-imports/import-usda.ts --dir /tmp/food-imports/usda`

### 4. SFDA Food Composition Table (optional)
- **Source**: https://www.sfda.gov.sa/en/food-composition-table
- **Usage**: Download CSV from SFDA website, then:
  ```bash
  bun run scripts/food-imports/import-sfda.ts --file /path/to/sfda_foods.csv
  ```

## Setting Up Cron Job on VPS

To periodically update the food database:

```bash
# Edit crontab
crontab -e

# Run SFDA seed import weekly (in case seed data is updated)
0 2 * * 0 cd /path/to/backend && bun run scripts/food-imports/import-sfda.ts --seed >> /var/log/food-import.log 2>&1

# Run OFF import monthly (downloads fresh data)
0 3 1 * * cd /path/to/backend && bun run scripts/food-imports/import-openfoodfacts.ts --limit 50000 >> /var/log/food-import.log 2>&1
```

## API Endpoints

After import, the following endpoints are available:

| Endpoint | Description |
|----------|-------------|
| `GET /api/foods/search?q=rice&limit=20` | Search foods by name (Arabic or English) |
| `GET /api/foods/search?q=أرز&language=ar` | Search Arabic foods only |
| `GET /api/foods/:id` | Get food by ID |
| `GET /api/foods/barcode/:barcode` | Lookup by barcode |
| `GET /api/foods/meta/categories` | List all categories |
| `GET /api/foods/meta/stats` | Database statistics |

## Database Schema

See `src/db/schema/foods.ts` for the full schema. Key fields:

- `nameEn` / `nameAr` — Bilingual food names
- `servingSize` / `servingUnit` — Default serving (e.g., 100g)
- `calories`, `protein`, `carbs`, `fat`, `fiber`, `sugar`, `sodium` — Nutrition per serving
- `source` — Where the data came from (openfoodfacts, usda, sfda, seed, manual)
- `barcode` — For barcode scanning feature
- `category` — Food category for filtering

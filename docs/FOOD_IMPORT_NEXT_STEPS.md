# Food Database Import - Next Steps

## Status
- Incident occurred: Python script loaded 26M rows into memory → OPS hung → force-stop → /tmp wiped
- Fixed with streaming COPY approach (5000-row batches)
- Scripts copied to VPS at `/tmp/food-imports/`
- Incident report: `docs/INCIDENT_REPORT_FOOD_IMPORT.md`

## Commands to Run on VPS

```bash
# Step 1: Download all CSV databases (~5 minutes)
cd /tmp/food-imports
bash download-all-food-dbs.sh

# Step 2: Run the import (~10-15 minutes)
python3 import-all-food.py
```

## What Gets Imported
- USDA Foundation Foods: ~88K rows
- USDA SR Legacy Foods: ~7.8K rows
- USDA Branded Foods: ~2M rows
- Total: ~2.7M food records

## Tables
- `foods` - Main foods table (source = 'usda_foundation', 'usda_sr_legacy')
- `branded_foods` - Branded products (source = 'usda_branded')

## After Import
- Verify counts: `SELECT count(*) FROM foods` and `SELECT count(*) FROM branded_foods`
- Test search API: `GET /api/foods/search?q=chicken`
- Seed Arabic foods: `bun run scripts/food-imports/import-sfda.ts --seed`

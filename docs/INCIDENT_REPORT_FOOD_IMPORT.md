# Food Database Import - Incident Report & Technical Documentation

## Summary

Attempted to import ~2.7M food records from Open Food Facts and USDA FoodData Central into Neon PostgreSQL. The process failed multiple times due to incorrect bulk insert approaches, causing the VPS instance to hang and become unresponsive.

## Timeline of Events

### Phase 1: Schema Design
- Created `foods` table with 70+ columns (nutrition, vitamins, minerals, metadata)
- Created `branded_foods` table for USDA Branded Foods (~2M products)
- Applied unique constraint on `(source, source_id)` for upsert support

### Phase 2: Import Attempts (All Failed)

#### Attempt 1: Individual SELECT + INSERT per row
```javascript
// For EACH of 2.7M rows:
const existing = await db.query.foods.findFirst({ where: ... })  // SELECT
if (existing) {
  await db.update(foods).set(...)  // UPDATE
} else {
  await db.insert(foods).values(...)  // INSERT
}
```
**Problem**: 2.7M rows × 3 queries = 8.1M round trips to Neon. Each round trip ~25ms over internet. Estimated time: **300+ hours**.

#### Attempt 2: Drizzle `onConflictDoNothing` with bulk insert
```javascript
await db.insert(foods).values(batchOf500).onConflictDoNothing()
```
**Problem**: The unique constraint `uq_foods_source_id` didn't exist because `db:push` doesn't create constraints from raw SQL migrations. Error: `there is no unique or exclusion constraint matching the ON CONFLICT specification`.

#### Attempt 3: Raw SQL with `sql.raw` and `$1, $2` parameters
```javascript
await db.execute(sql.raw(query, allValues))
```
**Problem**: `sql.raw()` in Drizzle doesn't accept a second argument for parameters. All inserts failed silently.

#### Attempt 4: UNNEST bulk insert
```sql
INSERT INTO foods (...) SELECT * FROM UNNEST($1::text[], $2::text[], ...)
```
**Problem**: 35 columns × 2000 rows = 70,000 parameters. PostgreSQL has a limit of 65,535 parameters per query. Query failed.

#### Attempt 5: Multi-row VALUES insert
```sql
INSERT INTO foods (...) VALUES ($1,$2,...,$35), ($36,$37,...,$70), ...
```
**Problem**: Same parameter limit issue. Also, the error messages were truncated so we couldn't see the actual error.

#### Attempt 6: Python with `copy_expert` (loading all into memory)
```python
# Loaded ALL 26M nutrient rows into a Python dict
nmap = {}
for row in csv.reader(nutrient_file):
    nmap[row[0]] = { ... }  # 26M entries in memory
```
**Problem**: Loading 26M rows into a Python dictionary consumed all 18GB RAM on the VPS. The OOM killer froze the OS. Instance became unresponsive and got stuck in "Stopping" state in OCI console.

### Phase 3: The Fix (Streaming COPY)

The correct approach is **streaming COPY** - process data in chunks without loading everything into memory:

```python
# Stream CSV rows one at a time (generator)
def stream_csv(filepath):
    with open(filepath) as f:
        for row in csv.DictReader(f):
            yield row

# Build nutrient map by streaming (not loading all at once)
nmap = {}
for row in stream_csv(nutrient_file):
    nmap[row['fdc_id']] = { col: amount }

# Import in batches using PostgreSQL COPY
for food in stream_csv(food_file):
    batch.append([...])  # Add row to batch
    if len(batch) >= 5000:
        copy_batch(cur, batch)  # COPY FROM STDIN
        batch = []
```

## Root Cause Analysis

| Issue | Cause | Impact |
|-------|-------|--------|
| 300+ hour estimate | Individual SELECT+INSERT per row | Unusable |
| Unique constraint missing | `db:push` doesn't run raw SQL migrations | Silent failures |
| `sql.raw` parameter issue | Drizzle API misunderstanding | Silent failures |
| Parameter limit exceeded | Too many columns × rows in single query | Query failed |
| VPS hang / OOM | Loading 26M rows into Python dict | Instance unresponsive |
| Instance stuck "Stopping" | OS frozen, can't respond to OCI API | Manual force-stop required |

## Best Practices for Bulk Data Import (Senior Level)

### 1. Never Load Entire Dataset into Memory
```python
# BAD: Loads everything into memory
all_rows = list(csv.reader(huge_file))  # 26M rows = OOM

# GOOD: Stream rows one at a time
def stream_csv(filepath):
    with open(filepath) as f:
        for row in csv.reader(f):
            yield row
```

### 2. Use PostgreSQL COPY for Bulk Inserts
```python
# BAD: Individual INSERT statements (slow, many round trips)
for row in rows:
    cursor.execute("INSERT INTO t VALUES (%s, %s)", row)

# GOOD: COPY FROM STDIN (fast, single operation)
buf = StringIO()
for row in rows:
    buf.write("\t".join(row) + "\n")
buf.seek(0)
cursor.copy_expert("COPY t FROM STDIN WITH (FORMAT text)", buf)
```

### 3. Process in Batches
```python
# Process 5000-10000 rows at a time
BATCH_SIZE = 5000
batch = []
for row in stream:
    batch.append(row)
    if len(batch) >= BATCH_SIZE:
        copy_batch(batch)
        batch = []
```

### 4. Build Lookup Maps by Streaming
```python
# For nutrient data: stream and build map incrementally
nmap = {}
for row in stream_csv("food_nutrient.csv"):
    fdc_id = row["fdc_id"]
    if fdc_id not in nmap:
        nmap[fdc_id] = {}
    nmap[fdc_id][NUTRIENT_MAP[row["nutrient_id"]]] = float(row["amount"])
```

### 5. Monitor Memory Usage
```python
import psutil
if psutil.virtual_memory().percent > 80:
    print("WARNING: Memory usage high, reducing batch size")
    BATCH_SIZE = 1000
```

### 6. Use Connection Pooling
```python
# Don't open/close connections for each batch
conn = psycopg2.connect(DATABASE_URL)
for batch in batches:
    copy_batch(conn.cursor(), batch)
    conn.commit()
conn.close()
```

### 7. Handle Errors Gracefully
```python
try:
    copy_batch(cur, batch)
    conn.commit()
except Exception as e:
    conn.rollback()
    log_error(e)
    # Continue with next batch instead of crashing
```

## Files Created

| File | Purpose |
|------|---------|
| `0013_clean_foods_table.sql` | Clean foods table schema |
| `0014_branded_foods_table.sql` | Branded foods table schema |
| `add-unique-constraint.ts` | Adds unique constraint for upserts |
| `import-all-food.py` | **Final working script** - streaming COPY |
| `CSV_REFERENCE.md` | Column mappings for all CSV sources |

## Data Sources

| Source | Rows | Nutrients File | Size |
|--------|------|----------------|------|
| USDA Foundation | 88K | 170K rows | 3.7MB |
| USDA SR Legacy | 7.8K | 644K rows | 5.8MB |
| USDA Branded | 2M | 26M rows | 428MB |
| Open Food Facts | 653K | 211 cols/row | 1.2GB |

## Final Solution

The `import-all-food.py` script uses:
1. **Streaming CSV parsing** - never loads entire file into memory
2. **PostgreSQL COPY FROM STDIN** - fastest bulk insert method
3. **5000-row batches** - balances speed vs memory
4. **Direct psycopg2 connection** - reads DATABASE_URL from container via `docker exec`
5. **Proper error handling** - logs errors, continues with next batch

Expected import time: **~10-15 minutes** for all 2.7M records.

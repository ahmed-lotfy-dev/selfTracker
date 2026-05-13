# pgvector & Embeddings Architecture

## pgvector Setup

### Installation (Neon)
Neon already supports pgvector — no extension installation needed. Just run:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### Drizzle Integration

Add to `backend/src/db/schema/pgvector.ts`:

```typescript
import { sql } from "drizzle-orm"
import { customType } from "drizzle-orm/pg-core"

export const vector = customType<{ data: number[]; driverData: string }>({
  dataType() {
    return "vector(1024)"
  },
  toDriver(value: number[]): string {
    return `[${value.join(",")}]`
  },
  fromDriver(value: string): number[] {
    return JSON.parse(value)
  },
})
```

Then add `embedding` column to each table schema. We use a **separate embedding table** approach (not adding the column to every existing table) to keep migration clean:

```typescript
// backend/src/db/schema/embeddings.ts
import { pgTable, text, timestamp, uuid, vector } from "drizzle-orm/pg-core"
import { users } from "./users"

export const embeddings = pgTable("embeddings", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  resourceType: text("resource_type").notNull(), // 'weight_log', 'workout_log', 'workout_exercise', 'food_log', 'habit', 'task'
  resourceId: text("resource_id").notNull(),
  content: text("content").notNull(),          // The natural-language string that was embedded
  embedding: vector("embedding").notNull(),    // vector(1024)
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})
```

**Why a separate table**:
- No schema migration on every existing table
- Easy to query across all user data for RAG
- Can rebuild embeddings independently
- Milvus/pgvector best practice for heterogeneous data

**Index for performance**:
```sql
CREATE INDEX idx_embeddings_user_resource 
  ON embeddings (user_id, resource_type);
CREATE INDEX idx_embeddings_vector 
  ON embeddings USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
```

## Embedding Pipeline

### 1. Content Template Generation

Each resource type gets a natural-language template:

```
weight_log  → "On May 12, 2025 you recorded a weight of 78.5 kg. Notes: Looking leaner this week."
workout_log → "On May 12, 2025 you did a Push workout for 45 minutes. Intensity: high. Notes: Great session."
workout_exercise → "In workout XX, you did Bench Press: 4 sets × 8 reps at 60 kg."
food_log    → "On May 12, 2025 for breakfast you ate Oatmeal with banana (350 calories, 45g carbs, 12g protein, 8g fat)."
habit       → "Your habit 'Morning Walk' has a 12-day streak. Description: Walk for 20 minutes after waking up."
task        → "Task 'Buy groceries' is pending. Priority: high. Category: personal."
```

### 2. Embedding Service

```typescript
// backend/src/services/embedding.ts
export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch(`${NIM_BASE}/embeddings`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${NVIDIA_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "nvidia/nv-embed-qa-4",
      input: text,
      input_type: "passage", // nv-embed-qa-4 requires this field
    }),
  })
  const data = await response.json()
  return data.data[0].embedding
}

export async function generateEmbeddingBatch(texts: string[]): Promise<number[][]> {
  // Process in batches of 10 due to rate limits
  const batches = chunk(texts, 10)
  const results: number[][] = []
  for (const batch of batches) {
    const embeddings = await Promise.all(
      batch.map(t => generateEmbedding(t))
    )
    results.push(...embeddings)
  }
  return results
}
```

### 3. CRUD Integration

Using Elysia's lifecycle hooks:

```typescript
// For weight logs example
import { generateEmbedding } from "../services/embedding"
import { embeddings } from "../db/schema/embeddings"

// On CREATE/UPDATE
async function onWeightLogChange(log: WeightLog) {
  const content = templateWeightLog(log)
  const embedding = await generateEmbedding(content)
  await db.insert(embeddings).values({
    userId: log.userId,
    resourceType: "weight_log",
    resourceId: log.id,
    content,
    embedding,
  }).onConflictDoUpdate({
    target: [embeddings.resourceType, embeddings.resourceId],
    set: { content, embedding, updatedAt: new Date() },
  })
}

// On DELETE
async function onWeightLogDelete(logId: string) {
  await db.delete(embeddings)
    .where(and(
      eq(embeddings.resourceType, "weight_log"),
      eq(embeddings.resourceId, logId)
    ))
}
```

Use `onConflictDoUpdate` so CREATE and UPDATE share the same handler.

### 4. Backfill Script

```typescript
// backend/src/scripts/backfill-embeddings.ts
// Reads ALL existing records across all tables
// Generates embeddings in batches of 10
// Inserts into embeddings table
// Handles rate limiting and errors gracefully
// Reports progress: "Backfilling weight_logs: 45/120 records..."
```

Run once after deployment:
```
bun run scripts/backfill-embeddings.ts
```

## Vector Search

```typescript
// backend/src/services/vectorSearch.ts

export async function searchUserData(
  userId: string,
  query: string,
  limit: number = 10,
  resourceTypes?: string[]
): Promise<SearchResult[]> {
  // 1. Embed the query
  const queryEmbedding = await generateEmbedding(query)
  
  // 2. Search via pgvector
  const results = await db.execute(sql`
    SELECT 
      e.resource_type,
      e.resource_id,
      e.content,
      1 - (e.embedding <=> ${queryEmbedding}::vector) AS similarity
    FROM embeddings e
    WHERE e.user_id = ${userId}
      ${resourceTypes ? sql`AND e.resource_type = ANY(${resourceTypes})` : sql``}
    ORDER BY e.embedding <=> ${queryEmbedding}::vector
    LIMIT ${limit}
  `)
  
  return results
}

export async function getInsightsForUser(userId: string): Promise<Insight[]> {
  // Check if enough data exists
  const counts = await getUserDataCounts(userId)
  
  // Generate insight cards based on available data
  const insights: Insight[] = []
  
  if (counts.weightLogs < 3) {
    insights.push({ type: "insufficient", message: "Not enough weight data..." })
  } else {
    // Query weight trend via vector + SQL aggregation
    // Generate insight card
  }
  
  // ... same for workouts, habits, nutrition
  
  return insights
}
```

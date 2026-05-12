# AI Chat RAG, pgvector, and Qdrant Architecture

This document explains how the SelfTracker AI chat feature should retrieve user data for questions like:

- "Summarize my weight trend this month"
- "How was my workout consistency latest month?"
- "في بيانات عن الوزن في ٢٠٢٦؟"
- "من شهرين كان وزني عامل ايه؟"
- "What changed in my weight loss and training recently?"

It also explains the bug where the assistant returned December 2024 data for a recent-month question, and how mature AI product teams prevent that class of failure.

## Relevant Repo Files

Mobile chat UI and API client:

- `mobile/src/components/features/ai/AiChatModal.tsx`
- `mobile/src/components/features/ai/AnalyticsTab.tsx`
- `mobile/src/components/features/ai/SuggestedPrompts.tsx`
- `mobile/src/lib/api/ai.ts`
- `mobile/src/types/aiTypes.ts`

Backend chat and retrieval:

- `backend/src/routes/ai.ts`
- `backend/src/services/aiChat.ts`
- `backend/src/services/vectorSearch.ts`
- `backend/src/services/embedding.ts`
- `backend/src/services/embeddingHelper.ts`
- `backend/src/services/embeddingWorker.ts`
- `backend/src/scripts/backfill-embeddings.ts`
- `backend/src/scripts/debug-ai-rag.ts`

Database schema:

- `backend/src/db/schema/embeddings.ts`
- `backend/src/db/schema/pgvector.ts`
- `backend/src/db/schema/weightLogs.ts`
- `backend/src/db/schema/workoutLogs.ts`
- `backend/src/db/migrations/0007_ai_embeddings.sql`

Ignore `database-mine/` for current AI behavior. That folder contains historical restore/export data and is not the live source for chat answers.

## Current Implementation

SelfTracker currently uses PostgreSQL with pgvector, not Qdrant.

The backend stores one natural-language embedding row per source record in the `embeddings` table:

- `user_id`
- `resource_type`, such as `weight_log` or `workout_log`
- `resource_id`
- `content`, the text that was embedded
- `embedding`, a `vector(1024)` pgvector column
- `created_at` and `updated_at` for the embedding row itself

The chat flow is:

1. Mobile sends `POST /api/ai/chat` with the message and chat history.
2. Backend authenticates the user.
3. Backend classifies the message:
   - normal chat, or
   - a question about the user's tracked data.
4. If it is normal chat, backend sends the message directly to the model with the general assistant prompt.
5. If it is a tracked-data question, backend parses time intent and retrieves relevant records.
6. Backend formats summaries and supporting rows as context.
7. Backend sends context plus the question to NVIDIA NIM chat.
8. Backend streams tokens back to React Native as SSE-style chunks over `XMLHttpRequest`.

## Root Cause of the December 2024 Bug

The original retrieval path treated every question as a semantic vector-search problem:

```text
query: "Summarize my weight trend this latest month"
```

Vector search does not understand that "latest month" is a hard date constraint. It embeds the whole sentence and searches for semantically similar text. Old notes like these scored highly:

```text
On December 1, 2024 you recorded a weight of 112.50 kg. Notes: Legs new week new month
On November 26, 2024 you recorded a weight of 112.90 kg. Notes: Push ...
```

Those old rows matched words like "month", "weight", "Push", and "Legs", even though they were not recent.

There was also a backend bug in `fetchRecentRecords()`:

```ts
.where(weightLogs.userId as any)
```

That is not a valid `user_id = ...` filter. The fixed version is:

```ts
.where(and(eq(weightLogs.userId, userId), isNull(weightLogs.deletedAt)))
```

## Correct Mental Model

RAG is not just "vector search + LLM".

Production RAG is a retrieval pipeline with multiple retrieval tools:

- Structured SQL filters for facts with exact fields: dates, user IDs, deleted rows, numeric values.
- Vector search for fuzzy semantic recall: notes, names, descriptions, intent.
- Aggregation code for counts, deltas, totals, trends, and date ranges.
- Prompt assembly that clearly tells the model which context is authoritative.

For fitness and health tracking, dates and numbers are not optional metadata. They are primary retrieval keys.

## Normal Chat vs Data Chat

The assistant should not retrieve user data for every message.

Normal chat examples:

```text
ازاي ازود البروتين؟
What is progressive overload?
How should I warm up before legs?
```

These should get normal assistant answers in the user's language.

Tracked-data examples:

```text
ايه رايك في اوزاني الشهر ده؟
في بيانات عن الوزن في ٢٠٢٦؟
طيب بالنسبه ٢٠٢٦؟
How was my workout consistency last 2 months?
```

These should trigger retrieval. The classifier should use both the current message and recent chat history, because follow-ups like `طيب بالنسبه ٢٠٢٦؟` depend on the previous topic.

## Time Intent Parsing

The backend now has a deterministic time-intent layer in `backend/src/services/aiTimeIntent.ts`.

It handles:

- Arabic-Indic digits: `٢٠٢٦` becomes `2026`.
- Arabic and English month names: `مايو ٢٠٢٦`, `December 2025`.
- Explicit years: `في ٢٠٢٦` becomes `2026-01-01` to now if the year is current.
- Rolling ranges: `last 2 months`, `اخر شهرين`.
- Calendar offsets: `two months ago`, `من شهرين`.
- Current and previous calendar months: `this month`, `الشهر اللي فات`.

This is separate from embeddings. Embeddings help find similar text. Time intent parsing decides which dates are allowed into the context.

## Fixed Retrieval Behavior

For time-scoped prompts, `backend/src/services/aiChat.ts` now:

1. Detects whether the user is asking normal chat or asking about tracked data.
2. Detects time intent from the user message.
3. Infers relevant resource types, currently `weight_log` and/or `workout_log`, using the current message plus recent user history.
4. Queries source tables directly with:
   - `user_id = current user`
   - `deleted_at IS NULL`
   - `created_at >= start`
   - `created_at <= end`
5. Builds deterministic summary records:
   - Weight first value, latest value, and net delta.
   - Workout total count and counts by workout type.
6. Sends those summary records and raw scoped rows to the model.

This prevents old vector matches from contaminating "latest month" answers.

Example verified live result for `2026-04-11` to `2026-05-12`:

```text
Weight summary:
2 weight logs.
113.90 kg on 2026-04-15.
115.00 kg on 2026-05-11.
Net change: +1.10 kg.

Workout summary:
12 workout sessions.
Legs: 2, Pull: 5, Push: 5.
```

## Why Deterministic Summaries Matter

LLMs are weak at reliable counting when given many raw records. They can skip rows, double count, or produce inconsistent totals.

A senior RAG system does not ask the model to calculate important metrics from scratch. It calculates metrics in code, then asks the model to explain them.

Bad pattern:

```text
Here are 50 workout logs. Count them and summarize.
```

Better pattern:

```text
Authoritative summary:
12 workout sessions. Legs: 2, Pull: 5, Push: 5.

Supporting records:
...
```

The model should be used for explanation, not as the source of truth for arithmetic.

## pgvector vs Qdrant

SelfTracker currently uses pgvector because it is simple and co-located with app data.

pgvector is a good fit when:

- The app already uses Postgres.
- Data volume is moderate.
- You want simple deployment.
- You need SQL joins, filters, and transactions.
- You prefer fewer infrastructure services.

Qdrant is a good fit when:

- Vector search becomes a dedicated high-scale workload.
- You need advanced vector filtering, payload indexes, hybrid retrieval, or collection management.
- You want independent vector infrastructure.
- You need easier operational tuning for approximate nearest-neighbor search.

The important concept is the same in both systems: every vector must carry metadata.

For SelfTracker, vector payload/metadata should include:

```json
{
  "user_id": "user-id",
  "resource_type": "weight_log",
  "resource_id": "row-id",
  "source_created_at": "2026-05-11T20:40:07.704Z",
  "source_deleted_at": null,
  "content": "On May 11, 2026 you recorded a weight of 115.00 kg."
}
```

Without `source_created_at`, vector search cannot enforce "latest", "this month", "last week", or "recent".

## Senior-Level RAG Design

A mature AI company would usually design this feature as a retrieval orchestrator, not a single search function.

The orchestrator stages:

1. Normalize the request.
   - Detect language.
   - Extract entities: weight, workout, calories, habits.
   - Extract time intent: today, this week, last 30 days, latest month.
   - Extract metric intent: trend, count, consistency, comparison.

2. Plan retrieval.
   - Use SQL for exact filters and aggregates.
   - Use vector search for notes and fuzzy matching.
   - Use hybrid search when both structured and semantic relevance matter.

3. Retrieve evidence.
   - Filter by `user_id`.
   - Exclude soft-deleted rows.
   - Apply date filters before semantic ranking when time is explicit.
   - Limit context size.

4. Compute metrics.
   - Counts.
   - Deltas.
   - Min/max.
   - Average.
   - Streaks.
   - Group-by summaries.

5. Build model context.
   - Put deterministic summaries first.
   - Put raw supporting records second.
   - Include the time window.
   - Tell the model not to use data outside the provided scope.

6. Generate answer.
   - Model explains the facts.
   - Model does not invent missing values.
   - Model cites dates and numbers from context.

7. Return sources.
   - Return the exact records used.
   - Include summaries as synthetic sources.
   - Log retrieval diagnostics for debugging.

## Recommended Future Migration: Add Source Metadata

The current fix is intentionally low-risk: it uses source tables for time-scoped chat. The stronger long-term design is to add source metadata to the embedding table.

Recommended columns:

```sql
ALTER TABLE embeddings
  ADD COLUMN source_created_at timestamp,
  ADD COLUMN source_updated_at timestamp,
  ADD COLUMN source_deleted_at timestamp,
  ADD COLUMN metadata jsonb DEFAULT '{}'::jsonb;

CREATE INDEX idx_embeddings_user_type_source_created
  ON embeddings (user_id, resource_type, source_created_at DESC);
```

Then vector search can do:

```sql
WHERE user_id = $1
  AND resource_type = ANY($2)
  AND source_deleted_at IS NULL
  AND source_created_at >= $3
  AND source_created_at <= $4
ORDER BY embedding <=> $5::vector
LIMIT 10;
```

For Qdrant, the equivalent is a payload filter:

```ts
filter: {
  must: [
    { key: "user_id", match: { value: userId } },
    { key: "resource_type", match: { any: ["weight_log", "workout_log"] } },
    { key: "source_deleted_at", is_null: true },
    { key: "source_created_at", range: { gte: startIso, lte: endIso } }
  ]
}
```

## Debugging Workflow

Use the debug script:

```bash
cd backend
bun run ai:debug-rag eJnk22vEJ3zmj4YaiUnN4e44Iiba4Oe4 "Summarize my weight loss and workout consistency latest month"
```

It prints:

- Source table freshness.
- Embedding table counts.
- Recent weight rows.
- Recent workout rows.
- Raw vector search results.

This separates three failure classes:

- Source data is missing.
- Embeddings are missing/stale.
- Vector search is returning semantically related but temporally wrong records.

## Practical Rules for This App

- Never answer user-specific questions without `user_id` filtering.
- Never include soft-deleted rows in AI context.
- Do not rely on embeddings for hard filters like date ranges.
- Compute counts and trends in code.
- Use vector search for fuzzy notes and semantic intent.
- Return the actual context sources to the mobile app.
- Log enough retrieval diagnostics to reproduce bad answers.

The highest-quality RAG systems are boring in the right places: strict filters, explicit metadata, deterministic metrics, small context, and clear source attribution.

# AI Assistant Feature — Main Plan

## Overview

Add an on-device AI assistant to selfTracker that:
1. Lets users chat with their data via a floating action button (FAB)
2. Provides a dedicated analytics tab with pre-built insight cards + Q&A
3. Uses pgvector for semantic search over all user data
4. Generates embeddings automatically on every CRUD operation (backend)

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| LLM provider | NVIDIA NIM (free tier) | Already have API key, `meta/llama-3.3-70b-instruct` available |
| Embedding model | nvidia/nv-embed-qa-4 | 1024-dim, free tier, works with NVIDIA NIM API |
| API format | OpenAI-compatible | Both NIM chat & embedding endpoints follow OpenAI API format |
| Analytics tab layout | Cards (top) + Chat (bottom) | Instant value from cards, depth from Q&A |
| Chat trigger | FAB from any screen | Plus inline chat input on analytics tab |
| Embedding timing | Server-side on CRUD + backfill script | Mobile stays thin, embeddings computed after DB write |
| Vector storage | pgvector in existing PostgreSQL | No new infra, Drizzle supports it |
| Sync compatibility | Embeddings are server-only | Electric sync doesn't need to replicate vectors to mobile |

## Implementation Order

```
Phase 1: Foundation
  ├── 1. Install pgvector extension on Neon
  ├── 2. Add pgvector Drizzle extension + migration
  ├── 3. Create embedding service (NVIDIA NIM client)
  └── 4. Create vector_search utility functions

Phase 2: Embeddings Pipeline
  ├── 5. Add embedding columns to all tables
  ├── 6. Backfill script (generate embeddings for existing data)
  ├── 7. CRUD hooks — auto-generate embedding after INSERT/UPDATE
  └── 8. DELETE cleanup (remove vector on record deletion)

Phase 3: Backend API
  ├── 9. POST /api/ai/chat — chat endpoint (RAG over user's vectors)
  ├── 10. GET /api/ai/insights — pre-built insight cards
  └── 11. GET /api/ai/search — vector similarity search

Phase 4: Mobile UI
  ├── 12. FAB component — floating on all main screens
  ├── 13. Chat bottom sheet / full screen — conversation UI
  ├── 14. Analytics tab screen with insight cards
  ├── 15. "Not enough data" empty states
  └── 16. Wire up to backend API

Phase 5: Polish
  ├── 17. Streaming chat responses
  ├── 18. Conversation history (local storage)
  └── 19. Error states, loading skeletons, retry
```

## Tables to Vectorize

| Table | Embedding Content | Use Case |
|-------|-------------------|----------|
| weight_logs | "On {date} weighed {weight}kg. Notes: {notes}" | Weight trends, progress |
| workout_logs | "On {date} did {duration}min {type} workout. Notes: {notes}" | Workout consistency |
| workout_exercises | "{reps}x{weight}kg {exercise_name}" per set | Exercise progress |
| food_logs | "On {date} ate {meal_type}: {food_name} ({calories}cal)" | Nutrition patterns |
| habits | "Habit: {name} — {description}. Streak: {streak} days" | Habit analysis |
| tasks | "Task: {title} — {description}. Status: {completed/pending}" | Task patterns |
| training_splits | "Split: {name}. Exercises: {exercise_list}" | Training program analysis |
| user_goals | "Goal: {name}. Target: {target}. Progress: {progress}" | Goal tracking |

## Embedding Strategy

- **Dimension**: 1024 (matching nv-embed-qa-4)
- **Distance**: cosine similarity (standard for semantic search)
- **Content template**: Each record gets stringified into a natural-language sentence before embedding (see table above)
- **Batch size**: 10 records per API call (NIM free tier rate limits)
- **Re-embedding**: On UPDATE, regenerate the embedding. On DELETE, remove the vector.
- **User isolation**: All vectors are per-user — queries filter by user_id first

## Key Components

```
backend/
├── src/
│   ├── services/
│   │   ├── embedding.ts          # NVIDIA NIM embedding client
│   │   ├── vectorSearch.ts       # pgvector similarity search
│   │   └── aiChat.ts             # RAG chat with LLM
│   ├── routes/
│   │   └── ai.ts                 # AI API endpoints
│   ├── db/schema/
│   │   ├── pgvector.ts           # pgvector extension setup
│   │   └── embeddings.ts         # vector columns on each table
│   └── middleware/
│       └── embeddingHook.ts      # Auto-embed on CRUD
```

## NVIDIA NIM Setup

- **API Base**: `https://integrate.api.nvidia.com/v1`
- **Chat Model**: `meta/llama-3.3-70b-instruct`
- **Embedding Model**: `nvidia/nv-embed-qa-4`
- **Auth**: `NVIDIA_API_KEY` env var (nvapi-... format, already in .env)
- **Timeout**: 120s (free tier is slow)
- **Rate Limits**: ~1000 req/day free tier, throttle accordingly

## "Not Enough Data" Handling

- **Check**: If user has < 3 records in any category, show empty state
- **Empty state message**: "Not enough data to generate insights yet. Keep tracking your {workouts/weight/habits} and check back soon!"
- **Chat**: If vector search returns 0 results, respond with "I don't have enough data to answer that yet. Track some data first and I'll be able to help!"

# NVIDIA NIM Integration

## API Details

### Base URL
```
https://integrate.api.nvidia.com/v1
```

### Authentication
```
Authorization: Bearer nvapi-XXXXXXXXXXXXXXXXXXXXXXXXXX
```
(Already in `.env` as `NVIDIA_API_KEY`)

---

## Chat Model: meta/llama-3.3-70b-instruct

### Endpoint
```
POST https://integrate.api.nvidia.com/v1/chat/completions
```

### Parameters
| Parameter | Value |
|-----------|-------|
| model | `meta/llama-3.3-70b-instruct` |
| temperature | 0.3 (factual, data-driven analysis) |
| max_tokens | 2048 |
| top_p | 0.9 |
| timeout | 120s |

### System Prompt (for chat)
```
You are an AI fitness and wellness assistant integrated into selfTracker, a personal tracking app.

You analyze the user's tracked data and provide insights, trends, and recommendations.

You have access to the user's data via vector search results which will be provided as context.

Rules:
- Be concise and specific. Use numbers and dates.
- If the user asks about something not in the context, say "I don't have that data yet."
- Never make up data. Only reference what's in the context.
- Be encouraging and supportive.
- Format responses with short paragraphs and bullet points where helpful.
```

### System Prompt (for insights)
```
You are an AI data analyst for selfTracker. Generate concise insight cards from the user's data.

Each insight must be:
- A single sentence summary
- Include a numerical comparison where possible
- Note the trend direction (up/down/stable)

If the data is insufficient, say "Not enough data" and recommend what to track.
```

### Integration Code Pattern

```typescript
// backend/src/services/aiChat.ts
import { NIM_CONFIG } from "../config/nim"

interface ChatOptions {
  message: string
  history: { role: string; content: string }[]
  context: SearchResult[]
}

export async function streamChat(options: ChatOptions, onToken: (token: string) => void) {
  const response = await fetch(`${NIM_CONFIG.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${NIM_CONFIG.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: NIM_CONFIG.chatModel,
      messages: [
        { role: "system", content: CHAT_SYSTEM_PROMPT },
        { role: "user", content: `Relevant data:\n${formatContext(options.context)}\n\nQuestion: ${options.message}` },
      ],
      temperature: 0.3,
      max_tokens: 2048,
      stream: true,
    }),
  })

  const reader = response.body?.getReader()
  // ... SSE parsing loop
}
```

---

## Embedding Model: nvidia/nv-embed-qa-4

### Endpoint
```
POST https://integrate.api.nvidia.com/v1/embeddings
```

### Parameters
| Parameter | Value |
|-----------|-------|
| model | `nvidia/nv-embed-qa-4` |
| input_type | `passage` (required by this model) |
| input | The text string(s) to embed |
| dimensions | 1024 |

### Important Notes
- `input_type` must be `"passage"` for storing, `"query"` for search queries
- Returns 1024-dimensional vectors
- Max 1000 tokens per input
- Rate limit: ~100 requests/minute on free tier
- Batch up to 10 texts per request

### Response Format
```json
{
  "data": [
    {
      "embedding": [0.0123, -0.0456, ...],
      "index": 0
    }
  ],
  "model": "nvidia/nv-embed-qa-4",
  "usage": { "total_tokens": 45 }
}
```

---

## Free Tier Limits

| Limit | Value |
|-------|-------|
| Requests per day | ~1000 |
| Requests per minute | ~100 |
| Max tokens (chat) | 4096 per request |
| Max tokens (embedding) | 1024 per input |
| Timeout tendency | Slower during peak hours |

### Mitigation Strategy
- Use 120s timeout for all requests
- Batch embedding calls (up to 10 texts per API call)
- Cache embedding results with `resource_id + updated_at` as key
- Retry with exponential backoff (1s, 2s, 4s, max 3 retries)
- Queue non-critical embeddings (backfill runs at low priority)
- If rate limited (429), back off and resume

---

## Config

```typescript
// backend/src/config/nim.ts
export const NIM_CONFIG = {
  baseUrl: "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.NVIDIA_API_KEY!,
  chatModel: "meta/llama-3.3-70b-instruct",
  embeddingModel: "nvidia/nv-embed-qa-4",
  embeddingDimensions: 1024,
}
```

### Required Environment Variables
```
NVIDIA_API_KEY=nvapi-...  (already exists in .env)
```
No new env vars needed.

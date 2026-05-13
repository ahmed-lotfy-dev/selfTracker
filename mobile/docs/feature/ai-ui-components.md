# AI UI Components

## Overview

Two entry points:
1. **FAB (Floating Action Button)** — available on all main screens (Home, Food, Habits, Profile)
2. **Analytics tab** — dedicated screen under a new bottom tab "AI"

Both lead to the same chat interface, but the analytics tab also shows pre-built insight cards.

---

## 1. Floating Action Button (FAB)

### Position
- Bottom-right corner, 16px from edges
- Sits above the tab bar (z-index)
- Visible on: home, tasks, habits, workouts, nutrition screens
- Hidden on: auth screens, onboarding, add/edit forms

### Behavior
- Pulsing glow animation when there's a new insight available
- Tapping opens the AI Chat Modal (full-screen modal from bottom)
- Smooth spring animation on appear

### Component
```
mobile/src/components/features/ai/AiFab.tsx
```

---

## 2. AI Chat Modal

### Opening
- Slides up from bottom (modal presentation)
- Dark overlay on background
- Full screen on mobile

### Layout

```
┌──────────────────────────────┐
│  [X]  AI Assistant    [⋮]   │ ← Header with close button
├──────────────────────────────┤
│                              │
│  ┌──────────────────────┐    │
│  │ Hello! I can analyze │    │ ← Chat messages
│  │ your data...         │    │
│  └──────────────────────┘    │
│                              │
│  ┌──────────────────────┐    │
│  │ How many workouts    │    │ ← User message
│  │ did I do this week?  │    │
│  └──────────────────────┘    │
│                              │
│  ┌──────────────────────┐    │
│  │ You did 4 workouts   │    │ ← AI response with context
│  │ this week. Here's    │    │   from vector search
│  │ the breakdown...     │    │
│  └──────────────────────┘    │
│                              │
├──────────────────────────────┤
│ [🔍 Ask about your data...] │ ← Input bar
├──────────────────────────────┤
│ Send button                  │
└──────────────────────────────┘
```

### Components
```
mobile/src/components/features/ai/AiChatModal.tsx    — Modal wrapper
mobile/src/components/features/ai/ChatMessage.tsx     — Single message bubble
mobile/src/components/features/ai/ChatInput.tsx       — Text input + send
mobile/src/components/features/ai/SuggestedPrompts.tsx — Quick action chips
```

### Suggested Prompts (shown when chat is empty)
- "How was my workout consistency this week?"
- "Summarize my weight trend this month"
- "What habits am I doing best at?"
- "Any patterns in my nutrition?"
- "Am I meeting my goals?"

### Data Flow
1. User types question → POST /api/ai/chat
2. Backend embeds the query → pgvector similarity search
3. Top 10 most relevant records returned as context
4. LLM generates response from context + chat history
5. Response streamed back to mobile (SSE)

---

## 3. Analytics Tab

### Tab Bar Entry
Add to `(drawer)/(tabs)/_layout.tsx`:
```tsx
<NativeTabs.Trigger name="ai">
  <NativeTabs.Trigger.Label>AI</NativeTabs.Trigger.Label>
  <NativeTabs.Trigger.Icon
    sf={{ default: "sparkle", selected: "sparkle.fill" }}
    md="auto_awesome"
  />
</NativeTabs.Trigger>
```

### Route
`(drawer)/(tabs)/ai/index.tsx`

### Screen Layout

```
┌──────────────────────────────┐
│ Header: "AI Analytics"       │
├──────────────────────────────┤
│                              │
│  ┌──────────────────────┐    │
│  │ 💪 Workout           │    │ ← Insight Card
│  │ You've worked out    │    │
│  │ 4 days this week     │    │
│  │ [+20% vs last week]  │    │
│  └──────────────────────┘    │
│                              │
│  ┌──────────────────────┐    │
│  │ ⚖️ Weight            │    │ ← Insight Card
│  │ Trending down        │    │
│  │ -0.5kg this month    │    │
│  └──────────────────────┘    │
│                              │
│  ┌──────────────────────┐    │
│  │ 🔥 Habits            │    │ ← Insight Card
│  │ Morning Walk streak  │    │
│  │ 12 days — keep it up │    │
│  └──────────────────────┘    │
│                              │
│  [Or ask something...]       │ ← Quick chat input
│                              │
├──────────────────────────────┤
│ FAB also visible here        │
└──────────────────────────────┘
```

### Insight Card Types (generated on tab open)

| Card | Data Source | Content |
|------|-------------|---------|
| Workout Consistency | workout_logs (last 2 weeks) | "You've worked out X/Y days this week" vs last week |
| Weight Trend | weight_logs (last 30 days) | "Trending up/down/stable — X kg change" |
| Habit Champion | habits (completion_dates) | "Your best habit streak: {name} — {N} days" |
| Nutrition Summary | food_logs (today/last 7 days) | "Average daily intake: {X} calories" |
| Task Momentum | tasks (last 7 days) | "You completed X tasks this week" |

### "Not Enough Data" States

When a data category has < 3 records, show a greyed-out card with:

```
┌──────────────────────────────┐
│ 🔄 Workout Consistency       │
│                              │
│ Not enough data to generate  │
│ insights yet. Keep tracking  │
│ your workouts and check back │
│ soon!                        │
│                              │
│ [Log a Workout →]            │ ← Action button
└──────────────────────────────┘
```

For the overall page when ALL categories have < 3 records:

```
┌──────────────────────────────┐
│                              │
│        🤔                    │
│                              │
│   Not enough data to         │
│   generate insights yet.     │
│                              │
│   Start tracking your daily  │
│   activities and come back   │
│   when you have more data!   │
│                              │
│   [Explore Dashboard]        │
│                              │
└──────────────────────────────┘
```

### Components
```
mobile/src/components/features/ai/AnalyticsTab.tsx      — Main screen
mobile/src/components/features/ai/InsightCard.tsx       — Single insight card
mobile/src/components/features/ai/InsufficientDataCard.tsx — Empty state card
mobile/src/components/features/ai/EmptyState.tsx        — Full page empty state
```

---

## 4. API Endpoints (Backend)

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/ai/chat | Chat with AI (question → vector search → LLM → response) |
| GET | /api/ai/insights | Get pre-built insight cards for user |
| GET | /api/ai/search?q=... | Direct vector search (debug/advanced) |

### POST /api/ai/chat

Request:
```json
{
  "message": "How was my workout consistency this week?",
  "history": [
    {"role": "user", "content": "..."},
    {"role": "assistant", "content": "..."}
  ]
}
```

Response (SSE stream):
```
event: token
data: {"token": "You"}

event: token
data: {"token": " worked"}

event: token
data: {"token": " out"}

event: done
data: {"sources": [{"type": "workout_log", "id": "xxx", "similarity": 0.89}]}
```

### GET /api/ai/insights

Response:
```json
{
  "insights": [
    {
      "type": "workout_consistency",
      "title": "Workout Consistency",
      "summary": "You've worked out 4 days this week, 2 more than last week.",
      "trend": "up",
      "hasData": true
    },
    {
      "type": "weight_trend",
      "title": "Weight Trend",
      "summary": "Not enough data to analyze weight trends.",
      "hasData": false,
      "actionLabel": "Log Weight",
      "actionRoute": "/(drawer)/(tabs)/home/weights/add"
    }
  ]
}
```

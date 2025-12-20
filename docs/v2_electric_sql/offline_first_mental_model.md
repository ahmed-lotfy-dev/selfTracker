# The Offline-First Guide: Mental Model & Decisions

> [!NOTE]
> **Purpose**: This is not just technical documentation; it is a **Guide** to understanding Distributed Systems on the client-side. It answers "Why?" for every decision using your specific app (SelfTracker) as the case study.

## Part 1: The Core Philosophy (The "Why")

### The Problem: The "Lie" of Online-Only
Most apps pretend the internet is always there. They are "fragile".
*   **Fragile App**: Click "Start Timer" -> Loading Spinner -> Server says OK -> Timer starts.
*   **Reality**: You are on a train. The request fails. The timer never starts. You lose your flow.

### The Solution: The "Truth" of Offline-First
In an Offline-First app, **The Local Device is the Center of the Universe.**
*   **Robust App**: Click "Start Timer" -> Timer starts instantly (Saved to SQLite). -> Background process whispers to server later.
*   **Result**: The user trusts your tool because it *always works*.

---

## Part 2: Applying it to SelfTracker (The Case Studies)

We have two very different use cases. This dictates why our architecture splits in certain places.

### Case Study A: The Desktop App (Pomodoro / Project Timer)
*   **Nature of Data**: High frequency, ephemeral, utility-focused.
*   **User Context**: Sitting at a desk, maybe WiFi drops, maybe they just want a quick timer without "signing up for a startup".
*   **Risk**: Low. If I lose one pomodoro session because my hard drive crashed, it's annoying but not tragic.
*   **Decision**: **Guest Mode First**.
    *   *Why?* Friction kills utility tools. If I have to Login just to set a timer, I'll uninstall. Let me use it, fall in love with it, then Login to sync my projects.

### Case Study B: The Mobile App (Weight / Workout Logs)
*   **Nature of Data**: Low frequency, high value, long-term trends (Health Data).
*   **User Context**: Gym (bad signal), Bathroom scale (quick entry), On the go.
*   **Risk**: **Critical**. If I track my weight loss for 6 months and lose my phone, I lose *months of progress*. I cannot "re-record" a workout from last year.
*   **Decision**: **Early Auth (Sign-In First)**.
    *   *Why?* The risk of data loss outweighs the friction of login. We *must* have a cloud bucket to back this up immediately.

---

## Part 3: The Architecture (The "How")

### 1. The Database is King
The UI **never** talks to the API.
*   **Bad**: `axios.post('/api/workouts', data)` inside a Component.
*   **Good**: `db.insert(workouts).values(data)` inside a Component.

### 2. The Sync Queue (The "messenger")
Why do we need a special table? Why not just a flag `synced: false`?

**The Scenario**:
1.  **Offline**: You create a Project "Deep Work" (ID: A).
2.  **Offline**: You delete Project "Deep Work" (ID: A).
3.  **Online**: Sync runs.

**If you used Flags (`synced: false`)**:
*   Row A is deleted from SQLite.
*   The Sync engine looks for "dirty rows". It finds nothing (Row A is gone).
*   **Result**: The Server never knows you created it or deleted it. If the server had an old copy, it might *send it back* to you!

**If you use a Sync Queue**:
1.  `INSERT` event added to Queue (ID: A).
2.  `DELETE` event added to Queue (ID: A).
3.  Sync runs: Replays `INSERT` (Server creates A) -> Replays `DELETE` (Server deletes A).
4.  **Result**: Perfect consistency. State is eventually consistent.

### 3. Conflict Resolution (The "Referee")
**The Scenario**:
*   **Desktop**: You edit Project A name to "Coding".
*   **Mobile**: You edit Project A name to "Programming" (at the same time offline).

**Resolution: Last Write Wins (LWW)**
We rely on the `updated_at` timestamp.
*   Server compares timestamps. "Programming" was 1 second later. "Programming" wins.
*   **Why?** For personal tracking apps, "collaborative text editing" complexity is overkill. LWW works 99% of the time.

---

## Part 4: Implementation Roadmap (Your Cheat Sheet)

| Step | Component | Role | Tech Stack |
| :--- | :--- | :--- | :--- |
| **1** | **Local DB** | The Single Source of Truth | `expo-sqlite`, `drizzle-orm` |
| **2** | **Sync Queue** | The "Outbox" for changes | SQLite Table (`sync_queue`) |
| **3** | **Sync Engine** | The Background Service | `sync.ts` (Pure TS Loop) |
| **4** | **API** | The Backup / Sync Hub | Hono (Backs up valid Sync Payloads) |
| **5** | **Auth** | The Identity Key | `better-auth` (Links Device UUID to User UUID) |

### The "Divergent" Onboarding Flow
This is the unique part of your app's DNA.

*   **Mobile**:
    1.  Splash Screen
    2.  **Sign In / Sign Up** (Secure the Cloud Bucket)
    3.  Home (Full Offline capability starts here)
*   **Desktop**:
    1.  App Window Opens
    2.  **Dashboard** (Guest User created silently)
    3.  "Sync" button in corner (Optional Login)

---

## Part 5: The ElectricSQL Alternative (Architecture Variant)

The user asked: *"How does this change if we use ElectricSQL?"*

| Feature | Manual Sync (Our Current Plan) | ElectricSQL (The Declarative Future) |
| :--- | :--- | :--- |
| **Philosophy** | **Imperative**. "I push this row, then I pull that row." | **Declarative**. "I want data of this shape. Make it happen." |
| **Mechanics** | `Sync Queue` table + Custom API Endpoints. | **Replication Protocol**. Connects directly to Postgres WAL. |
| **Backend** | Hono + Any DB (Flexible). | **Must use PostgreSQL** (WAL level = logical). Electric Proxy sits in front. |
| **Conflict** | You code it (LWW). | Built-in (Causal Consistency / LWW). |

### What You Delete
1.  **`sync_queue`** table. Electric handles the "Outbox".
2.  **`/sync/push` and `/sync/pull`** endpoints.
3.  **Manual dirty flags** (`sync_status`). Electric tracks changes via WAL.

### What You Keep (This is important!)
Even with ElectricSQL, your schema still needs:
*   **`updated_at`**: For conflict resolution timestamps.
*   **`deleted_at`**: Soft deletes are still the safest pattern.
*   **Stable UUIDs**: Immutable IDs are required.

> [!WARNING]
> **Mobile Caveat**: ElectricSQL works best in long-lived JS runtimes. Mobile background execution is limited by iOS/Android. Sync happens when the app is **foregrounded**. Offline still works perfectly, but background sync is "best-effort", not guaranteed. This is an OS reality, not an Electric flaw.

### Auth Flow With ElectricSQL
ElectricSQL does *not* replace your auth system. The flow becomes:
1.  App starts offline -> Local SQLite works.
2.  User signs in -> You get a `better-auth` session.
3.  You exchange that session for an **Electric Auth Token**.
4.  Electric client connects and starts syncing.
5.  If auth expires -> Sync **pauses**, but local usage **continues**.

### The Final Mental Reframe
> Without ElectricSQL: *"I am building a sync engine."*
> With ElectricSQL: *"I am declaring data ownership and letting replication happen."*

You are no longer wiring pipes. You are designing **data reality across devices**.

**Verdict**: ElectricSQL is a *superpower* if you commit to Postgres. For this guide, we focus on **Manual Sync** because it teaches the fundamentals and works with your existing Hono/Drizzle stack immediately.

---

## Part 6: Code Examples (The "How-To")

### 1. The Schema (Drizzle)
```typescript
// db/schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const workouts = sqliteTable('workouts', {
  id: text('id').primaryKey(), // UUID
  title: text('title').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }), // Soft Delete
  syncStatus: text('sync_status').default('pending') // 'pending' | 'synced'
});

export const syncQueue = sqliteTable('sync_queue', {
  id: text('id').primaryKey(),
  action: text('action').notNull(), // 'CREATE' | 'UPDATE' | 'DELETE'
  tableName: text('table_name').notNull(),
  data: text('data', { mode: 'json' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});
```

### 2. The Offline Mutation (The "Optimistic Update")
```typescript
// hooks/useCreateWorkout.ts
import { v4 as uuidv4 } from 'uuid';

export const useCreateWorkout = () => {
  return async (title: string) => {
    const newWorkout = {
      id: uuidv4(),
      title,
      updatedAt: new Date(),
      syncStatus: 'pending'
    };

    await db.transaction(async (tx) => {
      // 1. Write to Local DB (UI sees this instantly)
      await tx.insert(workouts).values(newWorkout);

      // 2. Write to Sync Queue (Background job sees this)
      await tx.insert(syncQueue).values({
        id: uuidv4(),
        action: 'CREATE',
        tableName: 'workouts',
        data: newWorkout,
        createdAt: new Date()
      });
    });
  };
};
```

### 3. The Sync Loop (Background Service)
```typescript
// services/sync.ts
export const pushChanges = async () => {
  // 1. Get pending mutations
  const queue = await db.select().from(syncQueue).orderBy(syncQueue.createdAt);
  
  if (queue.length === 0) return;

  // 2. Send to Server
  const response = await fetch('/api/sync/push', {
    method: 'POST',
    body: JSON.stringify(queue)
  });

  if (response.ok) {
    // 3. Cleanup on Success
    await db.transaction(async (tx) => {
      // Delete processed queue items
      await tx.delete(syncQueue).where(inArray(syncQueue.id, queue.map(q => q.id)));
      // Mark actual rows as synced
      // ... logic to update syncStatus ...
    });
  }
};
```

---

> [!TIP]
> **To solidify your knowledge**: Try to explain this to a rubber duck. "I write to the local DB so it's fast. The Queue records *what* I did, so the server can replay it later. Mobile logs in first because my workout data is too precious to lose."

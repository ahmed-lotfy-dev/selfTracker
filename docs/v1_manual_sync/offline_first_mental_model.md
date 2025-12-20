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

> [!TIP]
> **To solidify your knowledge**: Try to explain this to a rubber duck. "I write to the local DB so it's fast. The Queue records *what* I did, so the server can replay it later. Mobile logs in first because my workout data is too precious to lose."

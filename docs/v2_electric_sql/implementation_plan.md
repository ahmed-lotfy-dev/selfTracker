# Implementation Plan - Offline-First Architecture

## Goal
Transform **SelfTracker** into a true Offline-First application where the Local Database is the single source of truth, enabling instant UI interactions and reliable data synchronization across Mobile (Expo) and Desktop (Tauri).

## User Review Required
> [!IMPORTANT]
> **Database Migration**: This change requires significant schema updates (adding `updated_at`, `deleted_at`, `sync_status` to all tables). Existing data on the server/client might need migration scripts.

## Proposed Changes

### Phase 1: The Local Foundation (UI & SQLite)
**Objective**: Make the app work fully offline using a local database. The UI stops talking to the API directly.

#### [MODIFY] Database Schema (Drizzle)
- Update Drizzle schema to include `uuid` (primary keys).
- Add `updated_at`, `deleted_at`, `sync_status` columns to all syncable tables.
- Create `sync_queue` table for tracking mutations.

#### [NEW] Database Client
- Initialize `expo-sqlite` (Mobile) and Tauri SQLite plugin (Desktop).
- Set up Drizzle adapter for both platforms.

#### [MODIFY] Data Access Layer (Repositories)
- Refactor all data fetching hooks (`useWorkouts`, etc.) to read from **Local DB**.
- Refactor all mutations (`addWorkout`) to write to **Local DB** and insert into `sync_queue`.
- **Remove** direct API calls from UI components.

### Phase 2: The Sync Engine (Background Service)
**Objective**: Implement the mechanism that moves data between Local DB and Server without blocking UI.

#### [NEW] Sync Logic Module
- `sync.ts`: Pure TypeScript module containing the core loop.
- `pull()`: Fetches changes from `/sync/pull` since `last_synced_at`.
- `push()`: Reads `sync_queue` and POSTs to `/sync/push`.

#### [MODIFY] Backend API (Hono)
- Create `/sync/pull` endpoint: Accepts `since` timestamp, returns delta changes.
- Create `/sync/push` endpoint: Accepts batch mutations, updates Server DB, handles "Last Write Wins".

#### [NEW] Triggers
- **Mobile**: Hook into `NetInfo` and `AppState` to trigger sync on reconnect/foreground.
- **Desktop**: Hook into Tauri event system.

### Phase 3: Auth & advanced Reliability
**Objective**: Converge Auth with Sync and handle conflicts.

#### [MODIFY] Authentication Flow (Divergent Strategy)
- **Mobile (Priority: Data Safety)**:
    - Implement "Early Auth" screen (Sign In / Sign Up) as the *first* screen.
    - Persist Session Token in `SecureStore`.
    - **Remove** Guest Mode logic for Mobile.
- **Desktop (Priority: Low Friction)**:
    - Keep "Guest Mode" (Anonymous user) by default.
    - Implement "Merge" logic only for Desktop (Upload anonymous data -> associate with user on login).

#### [NEW] Conflict Resolution
- Implement "Last Write Wins" (LWW) based on `updated_at`.
- (Optional) UI for manual conflict resolution if LWW is insufficient.

## Verification Plan

### Automated Tests
- **Unit Tests**: Test `sync.ts` logic with mocked Local DB and Network.
- **Integration**: Verify `sync_queue` items are processed and removed after successful push.

### Manual Verification
1.  **Offline Write**: Turn off WiFi. Create a Workout. Verify it appears in UI instantly.
2.  **Queue Check**: Verify the mutation is in `sync_queue`.
3.  **Online Sync**: Turn on WiFi. Watch console logs for "Sync Complete".
4.  **Remote Check**: Check Server DB to see the new Workout.
5.  **Cross-Device**: Open app on second device. Verify the Workout appears after Pull Sync.

## Alternative Path: ElectricSQL Adoption
If we decide to switch to the **ElectricSQL** variant in the future, Phase 2 (Sync Engine) becomes obsolete.
*   **Remove**: `sync_queue` table and `sync.ts` loop.
*   **Install**: ElectricSQL Proxy and Client.
*   **Result**: The "Implementation Plan" simplifies to just defining the Schema, and Electric handles the rest. This guide presumes the **Manual Sync** path for now as it doesn't require infrastructure changes.

# Offline-First with Authentication: Complete Mental Model

> A thorough explanation of how offline-first architecture works when authentication is required, covering data storage, sync mechanisms, and the thinking process behind it all.

---

## The Core Question

**"How do we do offline-first when users MUST be authenticated, and all data belongs to specific users?"**

This is the exact challenge apps like **Notion**, **Linear**, **Todoist**, and **Obsidian** solve. Let me walk you through the complete mental model.

---

## Mental Model: The Three States

Think of your app as existing in **three states**:

```
State 1: UNAUTHENTICATED (No local data)
   ↓
State 2: AUTHENTICATED + SYNCED (Has local copy of server data)
   ↓
State 3: AUTHENTICATED + OFFLINE (Working with local data only)
```

### State 1: Unauthenticated (Fresh Install)

**What exists:**
- ❌ No local database
- ❌ No user data
- ❌ No auth token

**User must:**
1. Sign up or log in (requires internet)
2. Get auth token from server
3. Download initial data snapshot

**Code flow:**
```typescript
// On app launch
if (!hasAuthToken()) {
  // Show login screen
  // User CANNOT use app yet
  return <LoginScreen />;
}

// If has token, proceed to State 2
```

---

### State 2: Authenticated + Synced (First Time / Online)

**What exists:**
- ✅ Auth token saved in secure storage
- ✅ Empty local SQLite database (schema created)
- ✅ Internet connection

**What happens (INITIAL SYNC):**
```typescript
async function initialSync(userId: string, authToken: string) {
  // 1. Save auth token
  await SecureStore.setItemAsync('auth_token', authToken);
  
  // 2. Create local database schema
  await initializeDatabase(userId);
  
  // 3. Download ALL user's data from server
  const userData = await fetchUserData(authToken);
  
  // 4. Populate local database
  await saveToLocalDB(userData);
  
  // 5. Mark as synced
  await markInitialSyncComplete(userId);
}

async function fetchUserData(authToken: string) {
  // Single API call to get everything
  const response = await fetch(`${API_URL}/sync/initial`, {
    headers: { Authorization: `Bearer ${authToken}` }
  });
  
  return response.json(); // { tasks: [...], projects: [...], timers: [...] }
}
```

**Where data lives now:**

| Data | Server (PostgreSQL) | Local (SQLite) |
|------|---------------------|----------------|
| Tasks | ✅ Exists | ✅ **Copied** |
| Projects | ✅ Exists | ✅ **Copied** |
| User settings | ✅ Exists | ✅ **Copied** |

**Critical insight:** The local database is now a **complete replica** of the user's server data.

---

### State 3: Authenticated + Offline (Normal Usage)

**What exists:**
- ✅ Auth token (saved locally)
- ✅ Full local database (from State 2)
- ❌ No internet connection (or poor connection)

**What the user can do:**
- ✅ View all their existing data
- ✅ Create new tasks/projects
- ✅ Edit existing data
- ✅ Delete data
- ❌ Cannot fetch NEW data from other devices (yet)

**How it works:**

```typescript
// User creates a task OFFLINE
function createTask(title: string) {
  const task = {
    id: generateUUID(),        // Client-side ID
    title,
    created_at: Date.now(),
    synced: 0,                 // ❌ Not synced yet
    user_id: currentUserId
  };
  
  // 1. Save to local SQLite immediately
  db.runSync('INSERT INTO tasks (...) VALUES (...)', [task]);
  
  // 2. Add to sync queue
  syncQueue.add({
    operation: 'CREATE',
    entity: 'tasks',
    entity_id: task.id,
    data: task
  });
  
  // 3. Return task immediately (optimistic UI)
  return task;
}
```

**What just happened?**
1. Task saved to LOCAL database instantly → User sees it immediately
2. Task added to SYNC QUEUE → Will upload when online
3. Task marked as `synced: 0` → We know it needs syncing

---

## The Sync Layer: How It All Connects

### Architecture Overview

```
┌─────────────────────────────────┐
│     Mobile/Desktop App          │
│                                 │
│  ┌───────────────────────────┐ │
│  │   UI Layer (React)        │ │
│  │   - Shows local data      │ │
│  └───────┬───────────────────┘ │
│          │                      │
│  ┌───────▼───────────────────┐ │
│  │   SQLite Database         │ │
│  │   - tasks                 │ │
│  │   - projects              │ │
│  │   - sync_queue ←          │ │
│  └───────┬───────────────┬───┘ │
│          │               │      │
│  ┌───────▼──────┐  ┌────▼────┐ │
│  │  Read Data   │  │ Sync    │ │
│  │  (Instant)   │  │ Manager │ │
│  └──────────────┘  └────┬────┘ │
└─────────────────────────┼──────┘
                          │
                    [Network Check]
                          │
                     ┌────▼────┐
                     │  Online?│
                     └────┬────┘
                          │
                    Yes   │   No
                     ┌────▼────┐
                     │ Backend │
                     │   API   │
                     └────┬────┘
                          │
                  ┌───────▼────────┐
                  │   PostgreSQL   │
                  │ (Source of     │
                  │  Truth)        │
                  └────────────────┘
```

### Sync Queue: The Bridge Between Local and Remote

**The sync_queue table:**
```sql
CREATE TABLE sync_queue (
  id TEXT PRIMARY KEY,           -- Queue item ID
  entity TEXT NOT NULL,          -- 'tasks', 'projects', etc.
  entity_id TEXT NOT NULL,       -- The actual task/project ID
  operation TEXT NOT NULL,       -- 'CREATE', 'UPDATE', 'DELETE'
  data TEXT NOT NULL,            -- JSON of the full entity
  timestamp INTEGER NOT NULL,    -- When operation happened
  synced INTEGER DEFAULT 0,      -- 0 = pending, 1 = synced
  retry_count INTEGER DEFAULT 0, -- How many times we tried
  user_id TEXT NOT NULL
);
```

**Example: User creates task offline, goes online later**

```typescript
// === OFFLINE: User creates task ===
{
  id: 'queue_001',
  entity: 'tasks',
  entity_id: 'task_abc123',
  operation: 'CREATE',
  data: '{"id":"task_abc123","title":"Buy milk","status":"todo"}',
  timestamp: 1734523200000,
  synced: 0,                // ← Not synced yet
  user_id: 'user_xyz'
}

// === ONLINE: Sync manager processes queue ===
async function processSyncQueue() {
  // 1. Check if online
  if (!navigator.onLine) return;
  
  // 2. Get all unsynced operations for this user
  const pending = await db.select(
    'SELECT * FROM sync_queue WHERE user_id = ? AND synced = 0 ORDER BY timestamp ASC',
    [currentUserId]
  );
  
  // 3. Process each operation
  for (const op of pending) {
    try {
      // Send to backend
      const response = await fetch(`${API_URL}/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          operation: op.operation,
          entity: op.entity,
          entity_id: op.entity_id,
          data: JSON.parse(op.data),
          client_timestamp: op.timestamp
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // 4. Mark as synced in queue
        await db.update('sync_queue')
          .set({ synced: 1 })
          .where('id = ?', [op.id]);
        
        // 5. Update local entity with server data
        await db.update(op.entity)
          .set({ 
            synced: 1,
            updated_at: result.server_timestamp // Use server time
          })
          .where('id = ?', [op.entity_id]);
      }
    } catch (error) {
      // Log error, will retry later
      console.error(`Sync failed for ${op.id}:`, error);
    }
  }
}
```

---

## The Complete User Journey

### Scenario: User installs app, uses it, goes offline, comes back online

#### **Day 1: 9:00 AM - First Install** (State 1 → State 2)

```
User: Opens app for first time
App:  Shows login screen (no local data exists)

User: Signs in with Google
App:  1. Receives auth token from backend
      2. Saves token to secure storage
      3. Creates local SQLite database
      4. Fetches ALL user data from server
      5. Populates local database

Database State:
┌──────────────────────┬─────────┐
│ tasks                │ synced  │
├──────────────────────┼─────────┤
│ task_1: "Review PR"  │ ✅ 1    │
│ task_2: "Write docs" │ ✅ 1    │
└──────────────────────┴─────────┘

User: Sees their 2 existing tasks immediately
```

#### **Day 1: 10:00 AM - Create Task While Online** (State 2)

```
User: Creates "Buy groceries"
App:  1. Generates client-side UUID
      2. Saves to local SQLite
      3. Adds to sync_queue
      4. Immediately syncs (online)
      5. Backend confirms, returns server_id

Database State:
┌──────────────────────────┬─────────┐
│ tasks                    │ synced  │
├──────────────────────────┼─────────┤
│ task_1: "Review PR"      │ ✅ 1    │
│ task_2: "Write docs"     │ ✅ 1    │
│ task_3: "Buy groceries"  │ ✅ 1    │ ← Synced immediately
└──────────────────────────┴─────────┘

┌──────────────────────────┬─────────┐
│ sync_queue               │ synced  │
├──────────────────────────┼─────────┤
│ CREATE task_3            │ ✅ 1    │ ← Processed
└──────────────────────────┴─────────┘
```

#### **Day 1: 2:00 PM - User Goes Offline** (State 2 → State 3)

```
User: Phone in airplane mode
App:  Detects offline, continues working with local data

User: Creates "Call dentist"
App:  1. Saves to local SQLite (instant)
      2. Adds to sync_queue
      3. UI shows checkmark (optimistic)
      4. Small "offline" indicator shown

Database State:
┌──────────────────────────┬─────────┐
│ tasks                    │ synced  │
├──────────────────────────┼─────────┤
│ task_1: "Review PR"      │ ✅ 1    │
│ task_2: "Write docs"     │ ✅ 1    │
│ task_3: "Buy groceries"  │ ✅ 1    │
│ task_4: "Call dentist"   │ ❌ 0    │ ← Not synced yet
└──────────────────────────┴─────────┘

┌──────────────────────────┬─────────┐
│ sync_queue               │ synced  │
├──────────────────────────┼─────────┤
│ CREATE task_4            │ ❌ 0    │ ← Pending
└──────────────────────────┴─────────┘

User: Sees all 4 tasks (including new one)
      No difference in UX - works perfectly
```

#### **Day 1: 6:00 PM - User Comes Back Online** (State 3 → State 2)

```
App:  Detects internet connection
      Sync manager wakes up
      
Sync: 1. Finds pending operations in sync_queue
      2. Sends to backend: CREATE task_4
      3. Backend validates, saves to PostgreSQL
      4. Returns confirmation
      5. Marks task_4 as synced locally

Database State:
┌──────────────────────────┬─────────┐
│ tasks                    │ synced  │
├──────────────────────────┼─────────┤
│ task_1: "Review PR"      │ ✅ 1    │
│ task_2: "Write docs"     │ ✅ 1    │
│ task_3: "Buy groceries"  │ ✅ 1    │
│ task_4: "Call dentist"   │ ✅ 1    │ ← Now synced!
└──────────────────────────┴─────────┘

┌──────────────────────────┬─────────┐
│ sync_queue               │ synced  │
├──────────────────────────┼─────────┤
│ CREATE task_4            │ ✅ 1    │ ← Processed
└──────────────────────────┴─────────┘
```

---

## The Authentication Flow: Where Data Lives

### First Login (New User)

```typescript
// 1. User logs in
const { token, user } = await authClient.signIn.email({ email, password });

// 2. Save auth token
await SecureStore.setItemAsync('auth_token', token);

// 3. Create local database for this user
const db = SQLite.openDatabaseSync(`selftracker_${user.id}.db`);

// 4. Initialize schema
db.execSync(`
  CREATE TABLE IF NOT EXISTS tasks (...);
  CREATE TABLE IF NOT EXISTS projects (...);
  CREATE TABLE IF NOT EXISTS sync_queue (...);
`);

// 5. Fetch initial data (INITIAL SYNC)
const initialData = await fetch(`${API_URL}/sync/initial`, {
  headers: { Authorization: `Bearer ${token}` }
}).then(r => r.json());

// 6. Populate local database
for (const task of initialData.tasks) {
  db.runSync('INSERT INTO tasks (...) VALUES (...)', [
    task.id, task.title, ..., 1 // synced = 1
  ]);
}

// 7. User can now use app (even offline)
```

### Subsequent Launches (Returning User)

```typescript
// On app launch
const token = await SecureStore.getItemAsync('auth_token');

if (!token) {
  // Not logged in → show login screen
  return <LoginScreen />;
}

// Has token → open local database
const userId = extractUserIdFromToken(token);
const db = SQLite.openDatabaseSync(`selftracker_${userId}.db`);

// Verify token is still valid
const isValid = await verifyToken(token);

if (!isValid) {
  // Token expired → show login screen
  await logout();
  return <LoginScreen />;
}

// Token valid → use app with local data
// Sync in background if online
if (navigator.onLine) {
  syncManager.processPendingOperations();
}

return <AppShell />;
```

---

## Multi-Device Sync: The Hard Part

### Problem: User has app on phone AND tablet

**Scenario:**
1. User creates task on phone (offline)
2. User creates different task on tablet (offline)
3. Both devices come online
4. Both try to sync

**Solution: Operation-Based Sync**

```typescript
// Backend API endpoint
POST /sync
{
  operations: [
    {
      id: 'op_123',
      entity: 'tasks',
      entity_id: 'task_abc',
      operation: 'CREATE',
      data: { title: 'From phone' },
      client_timestamp: 1734523200000,
      device_id: 'phone_001'
    }
  ]
}

// Backend response
{
  processed: ['op_123'],
  server_state: {
    tasks: [
      { id: 'task_abc', title: 'From phone', updated_at: 1734523201000 }
    ]
  },
  conflicts: [] // None in this case
}
```

### Incremental Sync: After Initial Download

```typescript
// Don't re-download everything
// Just get changes since last sync

async function incrementalSync() {
  const lastSyncTime = await getLastSyncTimestamp();
  
  const response = await fetch(
    `${API_URL}/sync/changes?since=${lastSyncTime}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  
  const changes = await response.json();
  // { 
  //   tasks: { created: [...], updated: [...], deleted: [...] },
  //   projects: { ... }
  // }
  
  // Apply changes to local database
  for (const task of changes.tasks.created) {
    db.runSync('INSERT INTO tasks (...) VALUES (...)', [task]);
  }
  
  for (const task of changes.tasks.updated) {
    db.runSync('UPDATE tasks SET ... WHERE id = ?', [task]);
  }
  
  for (const taskId of changes.tasks.deleted) {
    db.runSync('DELETE FROM tasks WHERE id = ?', [taskId]);
  }
}
```

---

## Conflict Resolution: When Things Get Messy

### The Classic Conflict

```
User edits task on phone (offline):
  task_123: { title: "Buy milk", status: "done" }

User edits SAME task on tablet (offline):
  task_123: { title: "Buy milk and bread", status: "todo" }

Both sync. Who wins?
```

### Strategy 1: Last-Write-Wins (Simple)

```typescript
function resolveConflict(local, remote) {
  // Use timestamp to decide
  if (local.updated_at > remote.updated_at) {
    return local; // Local is newer
  }
  return remote; // Remote is newer
}
```

**Pros:** Simple, easy to implement  
**Cons:** Can lose data

### Strategy 2: Operational Transform (Complex)

```typescript
function mergeOperations(localOps, remoteOps) {
  // Merge both sets of changes
  const merged = {
    title: remoteOps.title || localOps.title,
    status: localOps.status, // Prefer local status
    // Custom merge logic per field
  };
  return merged;
}
```

**Pros:** Preserves more data  
**Cons:** Complex, field-specific logic

---

## Key Insights

### 1. **Local-First, Server-Truth**
- Local database is the **working copy**
- Server is the **source of truth**
- Sync reconciles the two

### 2. **Every Operation is Queued**
- Don't try to sync immediately
- Queue everything
- Process queue when online

### 3. **Client-Side IDs are Essential**
- Generate UUIDs on client
- Don't wait for server IDs
- Enables offline creation

### 4. **Optimistic UI**
- Show changes immediately
- Don't wait for sync confirmation
- Handle failures gracefully

### 5. **Sync is Incremental**
- Initial sync: Download everything
- Incremental sync: Only changes
- Use timestamps to track

---

## Implementation Checklist

- [ ] **Auth token storage** (SecureStore)
- [ ] **User-specific database** (`selftracker_${userId}.db`)
- [ ] **Initial sync endpoint** (GET /sync/initial)
- [ ] **Incremental sync endpoint** (GET /sync/changes?since=timestamp)
- [ ] **Sync queue table** (operations waiting to upload)
- [ ] **Background sync worker** (processes queue when online)
- [ ] **Conflict resolution strategy** (LWW or custom)
- [ ] **Network state detection** (NetInfo)
- [ ] **Optimistic UI updates** (show changes immediately)
- [ ] **Sync status indicators** (show user what's synced)

---

## Real-World Example: Linear's Approach

Linear (issue tracker) uses this strategy:

1. **Initial sync:** Download all your issues on first login
2. **Local database:** SQLite with full replica
3. **Offline edits:** Work normally, queued for sync
4. **Background sync:** Every 30 seconds when online
5. **Real-time sync:** WebSocket for immediate updates from others
6. **Conflict resolution:** Last-write-wins with conflict UI

**Result:** Feels instant, works offline, syncs seamlessly.

---

## Conclusion

**The mental model:**
1. **Login required** → User MUST authenticate first
2. **Initial sync** → Download their data to local SQLite
3. **Local-first** → All operations happen locally
4. **Sync queue** → Track what needs uploading
5. **Background sync** → Upload when online
6. **Incremental sync** → Download only new changes

**The secret:** Your local SQLite database becomes a per-user replica of their server data. The sync layer keeps both in sync.

This is how world-class offline-first apps work. It's complex, but once you understand the mental model, implementation becomes clear.

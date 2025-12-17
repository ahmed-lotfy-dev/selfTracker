# Offline-First Architecture Guide

> **Best practices for implementing offline-first data storage and synchronization in SelfTracker's Tauri (Desktop) and Expo (Mobile) applications.**

---

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Tauri Desktop Setup](#tauri-desktop-setup)
4. [Expo Mobile Setup](#expo-mobile-setup)
5. [Shared Architecture](#shared-architecture)
6. [Sync Strategy](#sync-strategy)
7. [Implementation Roadmap](#implementation-roadmap)

---

## Overview

### Why Offline-First?

- **Better UX**: App works without internet connection
- **Performance**: No network latency for reads
- **Reliability**: Data persists locally, syncs when online
- **Mobile-friendly**: Essential for intermittent connectivity

### Architecture Pattern

```
┌─────────────────┐         ┌─────────────────┐
│  Tauri Desktop  │         │   Expo Mobile   │
│   (SQLite DB)   │         │   (SQLite DB)   │
└────────┬────────┘         └────────┬────────┘
         │                           │
         └───────────┬───────────────┘
                     │
              ┌──────▼──────┐
              │  Backend    │
              │ PostgreSQL  │
              └─────────────┘
```

---

## Technology Stack

### Database Layer

| Platform | Database | Plugin/Library |
|----------|----------|----------------|
| **Tauri** | SQLite | `@tauri-apps/plugin-sql` |
| **Expo** | SQLite | `expo-sqlite` |
| **Backend** | PostgreSQL | Drizzle ORM |

### Sync & Cache Layer

- **TanStack Query (React Query)**: Client-side caching and sync state management
- **Drizzle ORM**: Type-safe database operations (works with SQLite and PostgreSQL)
- **Zod**: Schema validation for data integrity

### Connectivity Detection

- **Tauri**: `@tauri-apps/plugin-network`
- **Expo**: `@react-native-community/netinfo`

---

## Tauri Desktop Setup

### 1. Install Dependencies

```bash
cd desktop
bun add @tauri-apps/plugin-sql drizzle-orm drizzle-kit
bun add -D @tauri-apps/cli
```

### 2. Configure Tauri

**`src-tauri/tauri.conf.json`:**
```json
{
  "plugins": {
    "sql": {
      "preload": ["sqlite:selftracker.db"]
    }
  }
}
```

**`src-tauri/Cargo.toml`:**
```toml
[dependencies]
tauri-plugin-sql = { git = "https://github.com/tauri-apps/plugins-workspace", features = ["sqlite"] }
```

**`src-tauri/src/lib.rs`:**
```rust
fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::default().build())
        // ... other plugins
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### 3. Database Client Setup

**`src/lib/database.ts`:**
```typescript
import Database from '@tauri-apps/plugin-sql';

let db: Database | null = null;

export async function initDatabase() {
  if (db) return db;
  
  db = await Database.load('sqlite:selftracker.db');
  
  // Run migrations
  await db.execute(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      synced INTEGER DEFAULT 0,
      user_id TEXT NOT NULL
    )
  `);
  
  return db;
}

export async function getDatabase() {
  if (!db) {
    await initDatabase();
  }
  return db!;
}
```

### 4. CRUD Operations

**`src/services/tasks.ts`:**
```typescript
import { getDatabase } from '@/lib/database';
import { v4 as uuidv4 } from 'uuid';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  created_at: number;
  updated_at: number;
  synced: 0 | 1;
  user_id: string;
}

export const tasksService = {
  async create(data: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'synced'>) {
    const db = await getDatabase();
    const now = Date.now();
    const id = uuidv4();
    
    await db.execute(
      'INSERT INTO tasks (id, title, description, status, created_at, updated_at, synced, user_id) VALUES (?, ?, ?, ?, ?, ?, 0, ?)',
      [id, data.title, data.description, data.status, now, now, data.user_id]
    );
    
    return { id, ...data, created_at: now, updated_at: now, synced: 0 as const };
  },

  async getAll(userId: string): Promise<Task[]> {
    const db = await getDatabase();
    const result = await db.select<Task[]>(
      'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return result;
  },

  async update(id: string, data: Partial<Omit<Task, 'id' | 'created_at'>>) {
    const db = await getDatabase();
    const now = Date.now();
    
    await db.execute(
      'UPDATE tasks SET title = COALESCE(?, title), description = COALESCE(?, description), status = COALESCE(?, status), updated_at = ?, synced = 0 WHERE id = ?',
      [data.title, data.description, data.status, now, id]
    );
  },

  async delete(id: string) {
    const db = await getDatabase();
    await db.execute('DELETE FROM tasks WHERE id = ?', [id]);
  }
};
```

---

## Expo Mobile Setup

### 1. Install Dependencies

```bash
cd mobile
npx expo install expo-sqlite drizzle-orm
bun add @react-native-community/netinfo
```

### 2. Database Client Setup

**`src/lib/database.ts`:**
```typescript
import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export function initDatabase() {
  if (db) return db;
  
  db = SQLite.openDatabaseSync('selftracker.db');
  
  // Run migrations
  db.execSync(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      synced INTEGER DEFAULT 0,
      user_id TEXT NOT NULL
    );
  `);
  
  return db;
}

export function getDatabase() {
  if (!db) {
    initDatabase();
  }
  return db!;
}
```

### 3. CRUD Operations

**`src/services/tasks.ts`:**
```typescript
import { getDatabase } from '@/lib/database';
import { v4 as uuidv4 } from 'uuid';

export const tasksService = {
  create(data: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'synced'>) {
    const db = getDatabase();
    const now = Date.now();
    const id = uuidv4();
    
    db.runSync(
      'INSERT INTO tasks (id, title, description, status, created_at, updated_at, synced, user_id) VALUES (?, ?, ?, ?, ?, ?, 0, ?)',
      [id, data.title, data.description, data.status, now, now, data.user_id]
    );
    
    return { id, ...data, created_at: now, updated_at: now, synced: 0 as const };
  },

  getAll(userId: string): Task[] {
    const db = getDatabase();
    return db.getAllSync<Task>(
      'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
  },

  update(id: string, data: Partial<Omit<Task, 'id' | 'created_at'>>) {
    const db = getDatabase();
    const now = Date.now();
    
    db.runSync(
      'UPDATE tasks SET title = COALESCE(?, title), description = COALESCE(?, description), status = COALESCE(?, status), updated_at = ?, synced = 0 WHERE id = ?',
      [data.title, data.description, data.status, now, id]
    );
  },

  delete(id: string) {
    const db = getDatabase();
    db.runSync('DELETE FROM tasks WHERE id = ?', [id]);
  }
};
```

---

## Shared Architecture

### Shared Types (Works for Both Platforms)

**`shared/types/task.ts`:**
```typescript
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  created_at: number;
  updated_at: number;
  synced: 0 | 1;
  user_id: string;
}

export interface SyncOperation {
  id: string;
  entity: 'tasks' | 'projects' | 'timers';
  entity_id: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  data: Record<string, any>;
  timestamp: number;
  synced: 0 | 1;
  user_id: string;
}
```

### React Query Integration

**`src/hooks/useTasks.ts`:**
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksService } from '@/services/tasks';
import { syncQueue } from '@/services/sync';

export function useTasks(userId: string) {
  return useQuery({
    queryKey: ['tasks', userId],
    queryFn: () => tasksService.getAll(userId),
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: tasksService.create,
    onMutate: async (newTask) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['tasks'] });
      const previousTasks = queryClient.getQueryData(['tasks']);
      
      queryClient.setQueryData(['tasks'], (old: Task[]) => [
        newTask,
        ...old
      ]);
      
      return { previousTasks };
    },
    onSuccess: (task) => {
      // Add to sync queue
      syncQueue.addOperation({
        entity: 'tasks',
        entity_id: task.id,
        operation: 'CREATE',
        data: task,
      });
    },
    onError: (err, newTask, context) => {
      // Rollback on error
      queryClient.setQueryData(['tasks'], context?.previousTasks);
    },
  });
}
```

---

## Sync Strategy

### 1. Sync Queue Table

```sql
CREATE TABLE IF NOT EXISTS sync_queue (
  id TEXT PRIMARY KEY,
  entity TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  operation TEXT NOT NULL,
  data TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  synced INTEGER DEFAULT 0,
  retry_count INTEGER DEFAULT 0,
  user_id TEXT NOT NULL
);
```

### 2. Sync Service

**`src/services/sync.ts`:**
```typescript
import { getDatabase } from '@/lib/database';
import { v4 as uuidv4 } from 'uuid';

export const syncQueue = {
  async addOperation(op: Omit<SyncOperation, 'id' | 'timestamp' | 'synced'>) {
    const db = await getDatabase();
    const id = uuidv4();
    const timestamp = Date.now();
    
    await db.execute(
      'INSERT INTO sync_queue (id, entity, entity_id, operation, data, timestamp, synced, user_id) VALUES (?, ?, ?, ?, ?, ?, 0, ?)',
      [id, op.entity, op.entity_id, op.operation, JSON.stringify(op.data), timestamp, op.user_id]
    );
  },

  async getPending(userId: string): Promise<SyncOperation[]> {
    const db = await getDatabase();
    const result = await db.select<any[]>(
      'SELECT * FROM sync_queue WHERE user_id = ? AND synced = 0 ORDER BY timestamp ASC',
      [userId]
    );
    
    return result.map(row => ({
      ...row,
      data: JSON.parse(row.data)
    }));
  },

  async markSynced(id: string) {
    const db = await getDatabase();
    await db.execute(
      'UPDATE sync_queue SET synced = 1 WHERE id = ?',
      [id]
    );
  },

  async processQueue(userId: string) {
    const pending = await this.getPending(userId);
    
    for (const op of pending) {
      try {
        // Send to backend
        const response = await fetch(`${API_URL}/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(op)
        });

        if (response.ok) {
          await this.markSynced(op.id);
          
          // Update local entity as synced
          const db = await getDatabase();
          await db.execute(
            `UPDATE ${op.entity} SET synced = 1 WHERE id = ?`,
            [op.entity_id]
          );
        }
      } catch (error) {
        console.error(`Failed to sync operation ${op.id}:`, error);
        // Retry logic can be added here
      }
    }
  }
};
```

### 3. Background Sync

**Tauri (Desktop):**
```typescript
// In App.tsx or RootLayout
useEffect(() => {
  const syncInterval = setInterval(() => {
    if (navigator.onLine) {
      syncQueue.processQueue(userId);
    }
  }, 30000); // Every 30 seconds

  return () => clearInterval(syncInterval);
}, [userId]);
```

**Expo (Mobile):**
```typescript
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';

const SYNC_TASK = 'background-sync';

TaskManager.defineTask(SYNC_TASK, async () => {
  try {
    await syncQueue.processQueue(userId);
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Register task
await BackgroundFetch.registerTaskAsync(SYNC_TASK, {
  minimumInterval: 60 * 15, // 15 minutes
  stopOnTerminate: false,
  startOnBoot: true,
});
```

### 4. Conflict Resolution: Last-Write-Wins

```typescript
async function resolveConflict(local: Task, remote: Task): Promise<Task> {
  // Use timestamp to determine winner
  if (local.updated_at > remote.updated_at) {
    return local; // Local is newer
  }
  return remote; // Remote is newer
}
```

---

## Implementation Roadmap

### Phase 1: Local Database Setup
- [ ] Install SQLite plugins for Tauri and Expo
- [ ] Create database initialization scripts
- [ ] Define shared TypeScript interfaces
- [ ] Set up migrations for core entities (tasks, projects, timers)

### Phase 2: CRUD Operations
- [ ] Implement local CRUD services for all entities
- [ ] Add React Query hooks with optimistic updates
- [ ] Test offline functionality

### Phase 3: Sync Infrastructure
- [ ] Create sync_queue table
- [ ] Implement sync queue service
- [ ] Add background sync workers
- [ ] Set up connectivity detection

### Phase 4: Backend Integration
- [ ] Create sync API endpoints on backend
- [ ] Implement conflict resolution logic
- [ ] Add proper error handling and retry logic
- [ ] Test full sync cycle

### Phase 5: Testing & Optimization
- [ ] Test offline → online → sync flow
- [ ] Handle edge cases (concurrent edits, deletions)
- [ ] Optimize sync performance
- [ ] Add sync status UI indicators

---

## Benefits of This Approach

✅ **Shared Codebase**: Same database structure and sync logic across platforms  
✅ **Type Safety**: TypeScript + Drizzle ORM ensures compile-time safety  
✅ **Offline-First**: App works without internet, syncs when available  
✅ **Performance**: Local reads are instant, no network latency  
✅ **Scalability**: Proven pattern used by Notion, Linear, and other modern apps  
✅ **Developer Experience**: Familiar SQL with type-safe operations  

---

## Next Steps

Ready to implement? Follow the roadmap above, starting with Phase 1. Each phase builds on the previous one, ensuring a robust offline-first architecture.

For questions or implementation help, refer to:
- [Tauri SQL Plugin Docs](https://tauri.app/v1/guides/features/sql)
- [Expo SQLite Docs](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- [Drizzle ORM Docs](https://orm.drizzle.team/)

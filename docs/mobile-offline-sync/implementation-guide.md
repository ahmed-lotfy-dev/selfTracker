# Mobile App Offline-First Implementation Guide

> **Complete step-by-step guide** for implementing offline-first architecture in the SelfTracker mobile app (Expo/React Native).

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Step 1: Backend - Initial Sync Endpoint](#step-1-backend---initial-sync-endpoint)
4. [Step 2: Mobile - Install Dependencies](#step-2-mobile---install-dependencies)
5. [Step 3: Mobile - Database Schema](#step-3-mobile---database-schema)
6. [Step 4: Mobile - Initial Sync Service](#step-4-mobile---initial-sync-service)
7. [Step 5: Integration with Auth Flow](#step-5-integration-with-auth-flow)
8. [Step 6: React Query Hooks](#step-6-react-query-hooks)
9. [Step 7: Offline Operations & Sync Queue](#step-7-offline-operations--sync-queue)
10. [Testing & Verification](#testing--verification)

---

## Overview

**Goal:** Enable the mobile app to work offline by:
1. Downloading all user data on first login
2. Storing it in local SQLite database
3. Allowing CRUD operations offline
4. Syncing changes when back online

**Entities to sync:**
- Tasks (with project/column relations)
- Projects + Columns
- Timer Sessions
- Weight Logs
- Workout Logs
- Expenses

---

## Prerequisites

**Backend:**
- Hono server running
- Better-auth authentication working
- Database schema defined (already done ✅)

**Mobile:**
- Expo app running
- Authentication working (user can log in)
- React Query installed

---

## Step 1: Backend - Initial Sync Endpoint

### Why This Step?

We need a single API endpoint that returns ALL user data at once. This is more efficient than making multiple requests and ensures atomic data fetch.

### Implementation

**File:** `backend/src/routes/sync.ts`

```typescript
import { Hono } from 'hono';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { 
  tasks, 
  projects, 
  columns, 
  timerSessions, 
  weightLogs, 
  workoutLogs, 
  expenses 
} from '../db/schema';

const sync = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
  };
}>();

// Initial sync endpoint - returns ALL user data
sync.get('/initial', async (c) => {
  const user = c.get('user');
  
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    // Fetch all user data in parallel for performance
    const [
      userTasks,
      userProjects,
      userTimerSessions,
      userWeightLogs,
      userWorkoutLogs,
      userExpenses
    ] = await Promise.all([
      // Tasks
      db.select().from(tasks).where(eq(tasks.userId, user.id)),
      
      // Projects (will get columns separately)
      db.select().from(projects).where(eq(projects.userId, user.id)),
      
      // Timer Sessions
      db.select().from(timerSessions).where(eq(timerSessions.userId, user.id)),
      
      // Weight Logs
      db.select().from(weightLogs).where(eq(weightLogs.userId, user.id)),
      
      // Workout Logs
      db.select().from(workoutLogs).where(eq(workoutLogs.userId, user.id)),
      
      // Expenses
      db.select().from(expenses).where(eq(expenses.userId, user.id))
    ]);

    // Get columns for all user projects
    const projectIds = userProjects.map(p => p.id);
    const userColumns = projectIds.length > 0 
      ? await db.select().from(columns).where(
          // Get columns for any of the user's projects
          sql`${columns.projectId} IN ${projectIds}`
        )
      : [];

    return c.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      },
      tasks: userTasks,
      projects: userProjects,
      columns: userColumns,
      timerSessions: userTimerSessions,
      weightLogs: userWeightLogs,
      workoutLogs: userWorkoutLogs,
      expenses: userExpenses,
      syncedAt: new Date().toISOString() // Track when sync happened
    });
  } catch (error) {
    console.error('Initial sync failed:', error);
    return c.json({ error: 'Sync failed' }, 500);
  }
});

export default sync;
```

**Thinking:**
- Using `Promise.all()` to fetch data in parallel = faster
- Each query filters by `userId` = secure, only returns user's data
- Returning ISO timestamp = helps track when sync happened
- Error handling = graceful failure

### Register Route

**File:** `backend/src/index.ts`

```typescript
import syncRouter from './routes/sync.js';

// ... existing code ...

app.route('/api/sync', syncRouter);
```

### Test It

```bash
# Terminal
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/sync/initial
```

Expected response:
```json
{
  "user": { "id": "...", "email": "...", "name": "..." },
  "tasks": [...],
  "projects": [...],
  "columns": [...],
  "syncedAt": "2025-12-18T15:35:00.000Z"
}
```

---

## Step 2: Mobile - Install Dependencies

### Why expo-sqlite?

- **Native SQLite** on iOS/Android
- **Synchronous API** = simpler code, no async headaches
- **Official Expo support** = well maintained
- **Works offline** by default

### Install

```bash
cd mobile
npx expo install expo-sqlite
```

### Verify Install

**File:** `mobile/package.json`

```json
{
  "dependencies": {
    "expo-sqlite": "^14.0.3" // or latest version
  }
}
```

---

## Step 3: Mobile - Database Schema

### Why This Step?

We need to create local tables that mirror the backend PostgreSQL schema. SQLite doesn't support all Postgres types, so we translate them.

**Type Mapping:**
- `uuid` → `TEXT` (store as string)
- `boolean` → `INTEGER` (0 or 1)
- `timestamp` → `TEXT` (ISO string)
- `numeric` → `REAL` (floating point)

### Implementation

**File:** `mobile/src/lib/database.ts`

```typescript
import * as SQLite from 'expo-sqlite';

const DB_NAME = 'selftracker.db';

// Open database connection
export function openDatabase() {
  return SQLite.openDatabaseSync(DB_NAME);
}

// Initialize database schema
export function initializeDatabase(userId: string) {
  const db = openDatabase();
  
  console.log('Initializing database for user:', userId);
  
  // Create all tables in a single transaction
  db.execSync(`
    -- ========================================
    -- TASKS TABLE
    -- ========================================
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      project_id TEXT,
      column_id TEXT,
      title TEXT NOT NULL,
      description TEXT,
      completed INTEGER DEFAULT 0,
      due_date TEXT,
      priority TEXT DEFAULT 'medium',
      \`order\` INTEGER DEFAULT 0,
      category TEXT DEFAULT 'general',
      created_at TEXT,
      updated_at TEXT,
      synced INTEGER DEFAULT 1
    );

    CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);

    -- ========================================
    -- PROJECTS TABLE
    -- ========================================
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      color TEXT DEFAULT '#000000',
      is_archived INTEGER DEFAULT 0,
      created_at TEXT,
      updated_at TEXT,
      synced INTEGER DEFAULT 1
    );

    CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);

    -- ========================================
    -- PROJECT COLUMNS TABLE
    -- ========================================
    CREATE TABLE IF NOT EXISTS project_columns (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      name TEXT NOT NULL,
      \`order\` INTEGER DEFAULT 0,
      type TEXT DEFAULT 'todo',
      created_at TEXT,
      updated_at TEXT,
      synced INTEGER DEFAULT 1,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_columns_project_id ON project_columns(project_id);

    -- ========================================
    -- TIMER SESSIONS TABLE
    -- ========================================
    CREATE TABLE IF NOT EXISTS timer_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      task_id TEXT,
      start_time TEXT NOT NULL,
      end_time TEXT,
      duration INTEGER,
      type TEXT DEFAULT 'focus',
      completed INTEGER DEFAULT 0,
      created_at TEXT,
      synced INTEGER DEFAULT 1
    );

    CREATE INDEX IF NOT EXISTS idx_timer_sessions_user_id ON timer_sessions(user_id);

    -- ========================================
    -- WEIGHT LOGS TABLE
    -- ========================================
    CREATE TABLE IF NOT EXISTS weight_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      weight REAL NOT NULL,
      energy TEXT NOT NULL,
      mood TEXT NOT NULL,
      notes TEXT,
      created_at TEXT,
      updated_at TEXT,
      synced INTEGER DEFAULT 1
    );

    CREATE INDEX IF NOT EXISTS idx_weight_logs_user_id ON weight_logs(user_id);

    -- ========================================
    -- WORKOUT LOGS TABLE
    -- ========================================
    CREATE TABLE IF NOT EXISTS workout_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      workout_id TEXT NOT NULL,
      workout_name TEXT NOT NULL,
      notes TEXT,
      created_at TEXT,
      updated_at TEXT,
      synced INTEGER DEFAULT 1
    );

    CREATE INDEX IF NOT EXISTS idx_workout_logs_user_id ON workout_logs(user_id);

    -- ========================================
    -- EXPENSES TABLE
    -- ========================================
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT,
      created_at TEXT,
      updated_at TEXT,
      synced INTEGER DEFAULT 1
    );

    CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);

    -- ========================================
    -- SYNC QUEUE (for offline operations)
    -- ========================================
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

    CREATE INDEX IF NOT EXISTS idx_sync_queue_synced ON sync_queue(synced);

    -- ========================================
    -- SYNC METADATA (track last sync time)
    -- ========================================
    CREATE TABLE IF NOT EXISTS sync_metadata (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT
    );
  `);

  console.log('Database schema created successfully');
  return db;
}
```

**Thinking:**
- `synced` column on every table = track what needs uploading
- Indexes on foreign keys = faster queries
- `sync_queue` table = queue for offline operations
- `sync_metadata` table = store last sync timestamp

### Test It

```typescript
// In your app
import { initializeDatabase } from '@/lib/database';

const db = initializeDatabase('test_user_id');
console.log('Database initialized!');
```

---

## Step 4: Mobile - Initial Sync Service

### Why This Step?

This service downloads data from backend and populates the local database. It's the bridge between server and local storage.

### Implementation

**File:** `mobile/src/services/sync.ts`

```typescript
import { openDatabase } from '@/lib/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

interface SyncData {
  user: {
    id: string;
    email: string;
    name: string;
  };
  tasks: any[];
  projects: any[];
  columns: any[];
  timerSessions: any[];
  weightLogs: any[];
  workoutLogs: any[];
  expenses: any[];
  syncedAt: string;
}

export async function performInitialSync(
  authToken: string, 
  userId: string
): Promise<boolean> {
  try {
    console.log('🔄 Starting initial sync for user:', userId);

    // 1. Fetch data from backend
    const response = await fetch(`${API_URL}/api/sync/initial`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.statusText}`);
    }

    const data: SyncData = await response.json();
    const db = openDatabase();

    console.log('📦 Received data:', {
      tasks: data.tasks.length,
      projects: data.projects.length,
      columns: data.columns.length,
      weightLogs: data.weightLogs.length,
    });

    // 2. Insert tasks
    console.log('Inserting tasks...');
    for (const task of data.tasks) {
      db.runSync(
        `INSERT OR REPLACE INTO tasks (
          id, user_id, project_id, column_id, title, description,
          completed, due_date, priority, \`order\`, category,
          created_at, updated_at, synced
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          task.id,
          task.userId,
          task.projectId,
          task.columnId,
          task.title,
          task.description,
          task.completed ? 1 : 0,
          task.dueDate,
          task.priority,
          task.order,
          task.category,
          task.createdAt,
          task.updatedAt,
        ]
      );
    }

    // 3. Insert projects
    console.log('Inserting projects...');
    for (const project of data.projects) {
      db.runSync(
        `INSERT OR REPLACE INTO projects (
          id, user_id, name, color, is_archived, 
          created_at, updated_at, synced
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          project.id,
          project.userId,
          project.name,
          project.color,
          project.isArchived ? 1 : 0,
          project.createdAt,
          project.updatedAt,
        ]
      );
    }

    // 4. Insert columns
    console.log('Inserting columns...');
    for (const column of data.columns) {
      db.runSync(
        `INSERT OR REPLACE INTO project_columns (
          id, project_id, name, \`order\`, type, 
          created_at, updated_at, synced
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          column.id,
          column.projectId,
          column.name,
          column.order,
          column.type,
          column.createdAt,
          column.updatedAt,
        ]
      );
    }

    // 5. Insert timer sessions
    console.log('Inserting timer sessions...');
    for (const session of data.timerSessions) {
      db.runSync(
        `INSERT OR REPLACE INTO timer_sessions (
          id, user_id, task_id, start_time, end_time, 
          duration, type, completed, created_at, synced
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          session.id,
          session.userId,
          session.taskId,
          session.startTime,
          session.endTime,
          session.duration,
          session.type,
          session.completed ? 1 : 0,
          session.createdAt,
        ]
      );
    }

    // 6. Insert weight logs
    console.log('Inserting weight logs...');
    for (const log of data.weightLogs) {
      db.runSync(
        `INSERT OR REPLACE INTO weight_logs (
          id, user_id, weight, energy, mood, notes,
          created_at, updated_at, synced
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          log.id,
          log.userId,
          log.weight,
          log.energy,
          log.mood,
          log.notes,
          log.createdAt,
          log.updatedAt,
        ]
      );
    }

    // 7. Insert workout logs
    console.log('Inserting workout logs...');
    for (const log of data.workoutLogs) {
      db.runSync(
        `INSERT OR REPLACE INTO workout_logs (
          id, user_id, workout_id, workout_name, notes,
          created_at, updated_at, synced
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          log.id,
          log.userId,
          log.workoutId,
          log.workoutName,
          log.notes,
          log.createdAt,
          log.updatedAt,
        ]
      );
    }

    // 8. Insert expenses
    console.log('Inserting expenses...');
    for (const expense of data.expenses) {
      db.runSync(
        `INSERT OR REPLACE INTO expenses (
          id, user_id, category, amount, description,
          created_at, updated_at, synced
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          expense.id,
          expense.userId,
          expense.category,
          expense.amount,
          expense.description,
          expense.createdAt,
          expense.updatedAt,
        ]
      );
    }

    // 9. Save sync metadata
    await AsyncStorage.setItem('last_sync_time', data.syncedAt);
    await AsyncStorage.setItem('initial_sync_complete', 'true');
    await AsyncStorage.setItem(`user_${userId}_synced`, 'true');

    console.log('✅ Initial sync completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Initial sync failed:', error);
    throw error;
  }
}

export async function hasCompletedInitialSync(userId: string): Promise<boolean> {
  const synced = await AsyncStorage.getItem(`user_${userId}_synced`);
  return synced === 'true';
}

export async function clearSyncData(userId: string): Promise<void> {
  await AsyncStorage.removeItem(`user_${userId}_synced`);
  await AsyncStorage.removeItem('initial_sync_complete');
  await AsyncStorage.removeItem('last_sync_time');
  console.log('Sync data cleared');
}
```

**Thinking:**
- `INSERT OR REPLACE` = idempotent (safe to run multiple times)
- Logging at each step = easy to debug
- Boolean values → 0/1 for SQLite
- Save sync complete flag = know when to skip on next login

---

## Step 5: Integration with Auth Flow

### Why This Step?

After user logs in, we need to trigger initial sync BEFORE letting them into the app. This ensures they have data to work with.

### Implementation

**File:** `mobile/src/contexts/AuthContext.tsx` (or wherever your auth logic is)

```typescript
import { performInitialSync, hasCompletedInitialSync } from '@/services/sync';
import { initializeDatabase } from '@/lib/database';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isInitialSyncing, setIsInitialSyncing] = useState(false);
  
  async function handleLogin(email: string, password: string) {
    try {
      // 1. Authenticate with backend
      const { data, error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error || !data) {
        throw new Error(error?.message || 'Login failed');
      }

      const { user, session } = data;

      // 2. Save auth token
      await SecureStore.setItemAsync('auth_token', session.token);
      await AsyncStorage.setItem('user_id', user.id);

      // 3. Initialize database schema
      console.log('Initializing database...');
      initializeDatabase(user.id);

      // 4. Check if we need initial sync
      const hasSynced = await hasCompletedInitialSync(user.id);

      if (!hasSynced) {
        console.log('First login - performing initial sync');
        setIsInitialSyncing(true);

        try {
          await performInitialSync(session.token, user.id);
          toast.success('Data synced successfully!');
        } catch (syncError) {
          console.error('Sync failed:', syncError);
          toast.error('Failed to sync data. You can retry later.');
          // Continue to app anyway - they can try manual sync
        } finally {
          setIsInitialSyncing(false);
        }
      } else {
        console.log('Returning user - skipping initial sync');
      }

      // 5. Navigate to app
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed');
    }
  }

  return (
    <AuthContext.Provider value={{ handleLogin, isInitialSyncing }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### Loading UI

**File:** `mobile/src/app/login.tsx`

```typescript
export default function LoginScreen() {
  const { handleLogin, isInitialSyncing } = useAuth();

  if (isInitialSyncing) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.text}>Syncing your data...</Text>
        <Text style={styles.subtext}>This may take a moment on first login</Text>
      </View>
    );
  }

  return (
    // ... normal login form ...
  );
}
```

**Thinking:**
- Show loading screen during sync = user knows something is happening
- Don't block login on sync failure = better UX, they can retry
- Skip sync for returning users = faster app start

---

## Step 6: React Query Hooks

### Why This Step?

React Query provides:
- Automatic caching
- Background refetching
- Optimistic updates
- Sync state management

It's perfect for offline-first because it handles the complexity of keeping UI and database in sync.

### Implementation

**File:** `mobile/src/hooks/useTasks.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { openDatabase } from '@/lib/database';
import { v4 as uuidv4 } from 'uuid';

interface Task {
  id: string;
  userId: string;
  projectId?: string;
  columnId?: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  order: number;
  category: string;
  createdAt: string;
  updatedAt: string;
  synced: boolean;
}

// Fetch all tasks from local database
export function useTasks(userId: string) {
  return useQuery({
    queryKey: ['tasks', userId],
    queryFn: () => {
      const db = openDatabase();
      const tasks = db.getAllSync<Task>(
        'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );
      
      // Convert SQLite integers back to booleans
      return tasks.map(task => ({
        ...task,
        completed: task.completed === 1,
        synced: task.synced === 1,
      }));
    },
  });
}

// Create task (offline-first)
export function useCreateTask(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { title: string; projectId?: string }) => {
      const db = openDatabase();
      const now = new Date().toISOString();
      const id = uuidv4();

      const newTask: Task = {
        id,
        userId,
        projectId: data.projectId,
        title: data.title,
        completed: false,
        priority: 'medium',
        order: 0,
        category: 'general',
        createdAt: now,
        updatedAt: now,
        synced: false, // Not synced yet
      };

      // 1. Insert into local database
      db.runSync(
        `INSERT INTO tasks (
          id, user_id, project_id, title, completed, priority, 
          \`order\`, category, created_at, updated_at, synced
        ) VALUES (?, ?, ?, ?, 0, ?, 0, ?, ?, ?, 0)`,
        [id, userId, data.projectId, data.title, 'medium', 'general', now, now]
      );

      // 2. Add to sync queue
      db.runSync(
        `INSERT INTO sync_queue (
          id, entity, entity_id, operation, data, timestamp, user_id
        ) VALUES (?, 'tasks', ?, 'CREATE', ?, ?, ?)`,
        [
          uuidv4(),
          id,
          JSON.stringify(newTask),
          Date.now(),
          userId,
        ]
      );

      return newTask;
    },
    onSuccess: (newTask) => {
      // Optimistically update UI
      queryClient.setQueryData<Task[]>(['tasks', userId], (old) => 
        old ? [newTask, ...old] : [newTask]
      );
    },
  });
}

// Update task
export function useUpdateTask(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Task> }) => {
      const db = openDatabase();
      const now = new Date().toISOString();

      // Build UPDATE query dynamically
      const fields = Object.keys(updates);
      const values = Object.values(updates);
      const setClause = fields.map(f => `${f} = ?`).join(', ');

      db.runSync(
        `UPDATE tasks SET ${setClause}, updated_at = ?, synced = 0 WHERE id = ?`,
        [...values, now, id]
      );

      // Add to sync queue
      db.runSync(
        `INSERT INTO sync_queue (
          id, entity, entity_id, operation, data, timestamp, user_id
        ) VALUES (?, 'tasks', ?, 'UPDATE', ?, ?, ?)`,
        [uuidv4(), id, JSON.stringify(updates), Date.now(), userId]
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', userId] });
    },
  });
}
```

**Thinking:**
- `queryKey: ['tasks', userId]` = cache per user
- `synced: false` on create/update = track what needs uploading
- Optimistic updates = UI feels instant
- Sync queue = will upload when online

---

## Step 7: Offline Operations & Sync Queue

### Why This Step?

When user goes offline and makes changes, we need to track those changes and upload them when back online.

### Implementation

**File:** `mobile/src/services/syncQueue.ts`

```typescript
import { openDatabase } from '@/lib/database';
import NetInfo from '@react-native-community/netinfo';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

export async function processSyncQueue(authToken: string, userId: string) {
  // 1. Check if online
  const netInfo = await NetInfo.fetch();
  if (!netInfo.isConnected) {
    console.log('Offline - skipping sync queue processing');
    return;
  }

  const db = openDatabase();

  // 2. Get pending operations
  const pendingOps = db.getAllSync(
    `SELECT * FROM sync_queue 
     WHERE user_id = ? AND synced = 0 
     ORDER BY timestamp ASC`,
    [userId]
  );

  console.log(`Processing ${pendingOps.length} pending operations`);

  // 3. Process each operation
  for (const op of pendingOps) {
    try {
      const response = await fetch(`${API_URL}/api/sync/operation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entity: op.entity,
          entityId: op.entity_id,
          operation: op.operation,
          data: JSON.parse(op.data),
          timestamp: op.timestamp,
        }),
      });

      if (response.ok) {
        // Mark as synced
        db.runSync(
          'UPDATE sync_queue SET synced = 1 WHERE id = ?',
          [op.id]
        );

        // Update entity as synced
        db.runSync(
          `UPDATE ${op.entity} SET synced = 1 WHERE id = ?`,
          [op.entity_id]
        );

        console.log(`✅ Synced ${op.operation} on ${op.entity}:${op.entity_id}`);
      } else {
        console.error(`Failed to sync operation ${op.id}:`, response.statusText);
      }
    } catch (error) {
      console.error(`Error syncing operation ${op.id}:`, error);
      // Will retry next time
    }
  }
}

// Auto-sync every 30 seconds when online
export function startBackgroundSync(authToken: string, userId: string) {
  const interval = setInterval(() => {
    processSyncQueue(authToken, userId);
  }, 30000); // 30 seconds

  return () => clearInterval(interval);
}
```

**File:** `mobile/src/app/_layout.tsx`

```typescript
export default function RootLayout() {
  const { user, authToken } = useAuth();

  useEffect(() => {
    if (user && authToken) {
      // Start background sync
      const cleanup = startBackgroundSync(authToken, user.id);
      return cleanup;
    }
  }, [user, authToken]);

  return <Slot />;
}
```

**Thinking:**
- Check connectivity before syncing = don't waste battery
- Process in order (timestamp ASC) = maintain causality
- Don't delete failed ops = retry later
- Background sync = user doesn't think about it

---

## Testing & Verification

### Test 1: Fresh Install Flow

1. **Uninstall app** (or clear data)
2. **Install and open**
3. **Login with credentials**
4. **Watch for:**
   - "Syncing your data..." message
   - Console logs showing data counts
   - Successful navigation to app

5. **Verify database:**
```typescript
const db = openDatabase();
const taskCount = db.getFirstSync('SELECT COUNT(*) as count FROM tasks');
console.log('Tasks in database:', taskCount.count);
```

### Test 2: Offline Creation

1. **Turn on airplane mode**
2. **Create a new task**
3. **Verify:**
   - Task appears in UI immediately
   - No error messages
4. **Check sync queue:**
```typescript
const db = openDatabase();
const pending = db.getAllSync('SELECT * FROM sync_queue WHERE synced = 0');
console.log('Pending operations:', pending.length);
```

### Test 3: Online Sync

1. **Turn off airplane mode**
2. **Wait 30 seconds** (or manually trigger sync)
3. **Verify:**
   - Console shows "Synced CREATE on tasks:..."
   - Task marked as `synced = 1`
   - Backend has the task

### Test 4: Returning User

1. **Close app**
2. **Reopen app**
3. **Login again**
4. **Verify:**
   - No sync message (skipped)
   - Data still there from before
   - App loads quickly

---

## Troubleshooting

### Issue: "Database is locked"
**Solution:** Make sure you're not opening multiple connections. Use singleton pattern.

### Issue: "Data not appearing"
**Check:**
1. Console logs - did sync complete?
2. Database - `SELECT COUNT(*) FROM tasks`
3. Network - did request succeed?

### Issue: "Sync queue not processing"
**Check:**
1. Are you online? `NetInfo.fetch()`
2. Is background sync started? Check interval
3. Any errors in console?

---

## Next Steps

After completing this guide:

1. ✅ **Initial sync working** - Data downloads on first login
2. ✅ **Offline CRUD working** - Can create/edit/delete offline
3. ✅ **Sync queue working** - Changes upload when online

**Future enhancements:**
- Incremental sync (only fetch changes since last sync)
- Conflict resolution (handle concurrent edits)
- Real-time sync (WebSocket for instant updates)
- Sync status UI (show user what's pending)

---

## Summary

You now have a complete offline-first mobile app that:

1. Downloads all user data on first login
2. Stores it in local SQLite
3. Lets users work offline
4. Syncs changes when back online
5. Feels instant and native

This is the same pattern used by Linear, Notion, and Todoist. Congrats! 🎉

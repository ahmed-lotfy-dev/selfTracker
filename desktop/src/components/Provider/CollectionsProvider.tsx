import { ReactNode, useEffect, useState } from 'react';
import { createCollection } from '@tanstack/react-db';
import { electricCollectionOptions } from '@tanstack/electric-db-collection';
import { _setCollections } from '@/db/collections';
import { useUserStore } from '@/lib/user-store';
import { CollectionsContext } from './CollectionsContext';
import {
  weightLogSchema,
  workoutLogSchema,
  expenseSchema,
  workoutSchema,
  userGoalSchema,
  exerciseSchema,
  timerSessionSchema,
  taskSchema,
} from '@/db/schema';

type Collections = {
  tasks: any;
  weightLogs: any;
  workoutLogs: any;
  expenses: any;
  workouts: any;
  userGoals: any;
  exercises: any;
  timerSessions: any;
} | null;

export function CollectionsProvider({ children }: { children: ReactNode }) {
  const [collections, setCollections] = useState<Collections>(null);

  useEffect(() => {
    // Check auth state from our store
    const checkAuth = () => {
      const userState = useUserStore.getState();
      const hasToken = !!localStorage.getItem("bearer_token");

      if (hasToken && userState.isGuest) {
        useUserStore.getState().setAuthenticated(localStorage.getItem("user_id") || "unknown");
      } else if (!hasToken && !userState.isGuest) {
        useUserStore.getState().setGuest();
      }
    };
    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const isGuest = useUserStore(state => state.isGuest);

  useEffect(() => {
    console.log(`[CollectionsProvider] Initializing (isGuest: ${isGuest})`);

    const backendUrl = import.meta.env.VITE_BACKEND_URL || (import.meta.env.PROD ? "https://selftracker.ahmedlotfy.site" : "http://localhost:8000");

    // --- "From Scratch" Local Collection Implementation ---
    const createLocalCollection = (id: string, schema: any) => {
      console.log(`[${id}] Creating Local Collection (Manual Mode)`);
      const key = `local_collection_${id}`;

      // 1. Create the base collection (In-Memory)
      const col = createCollection({
        id: id as any,
        schema: schema as any,
        getKey: (row: any) => row.id,
        // No sync config needed for pure local mode if we handle hydration manually clearly
        sync: { sync: (p: any) => { p?.markReady?.(); return () => { }; } }
      } as any);

      // 2. Hydrate (Load from Disk synchronously)
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const data = JSON.parse(raw);
          if (Array.isArray(data)) {
            // We use the internal 'upsert' to load data without triggering our own listeners if possible,
            // or just let it be.
            (col as any).upsert(data);
            console.log(`[${id}] Hydrated ${data.length} items`);
          }
        }
      } catch (err) {
        console.error(`[${id}] Failed to load local data`, err);
      }

      // 3. Override Actions (The "Action Layer")
      // We manually wrap the methods to ensure they execute AND save.

      // Capture original methods bound to the instance
      const _insert = col.insert.bind(col);
      const _update = col.update.bind(col);
      // const _remove = col.remove.bind(col); // If we implement delete later

      // Override INSERT
      col.insert = (data: any) => {
        console.log(`[${id}] Action: Insert`, data);

        // A. Update In-Memory (Triggers UI)
        const result = _insert(data);

        // B. Save to Disk
        try {
          const currentRaw = localStorage.getItem(key);
          const current = currentRaw ? JSON.parse(currentRaw) : [];
          current.push(data);
          localStorage.setItem(key, JSON.stringify(current));
        } catch (e) { console.error(`[${id}] Failed to save insert`, e); }

        return result;
      };

      // Override UPDATE
      col.update = (keyToUpdate: any, callback: any) => {
        console.log(`[${id}] Action: Update`, keyToUpdate);

        // Just pass through to TanStack DB (for authenticated users with Electric sync)
        // Guest mode uses Zustand stores, not this collection
        return _update(keyToUpdate, callback);
      };

      return col;
    };

    const createElectricCollection = (table: string, schema: any) => {
      // (Electric code logic remains similar but separated)
      return createCollection(
        electricCollectionOptions({
          id: table as any,
          schema: schema as any,
          getKey: (row: any) => row.id,
          shapeOptions: {
            url: `${backendUrl}/api/electric/v1/shape`,
            params: { table },
          },
        })
      );
    };

    // Use our manual local collection if guest
    const createFn = !isGuest ? createElectricCollection : createLocalCollection;

    const newCollections = {
      tasks: createFn('tasks', taskSchema),
      weightLogs: createFn('weight_logs', weightLogSchema),
      workoutLogs: createFn('workout_logs', workoutLogSchema),
      expenses: createFn('expenses', expenseSchema),
      workouts: createFn('workouts', workoutSchema),
      userGoals: createFn('user_goals', userGoalSchema),
      exercises: createFn('exercises', exerciseSchema),
      timerSessions: createFn('timer_sessions', timerSessionSchema),
    };

    console.log('[CollectionsProvider] Collections initialized:', Object.keys(newCollections));
    setCollections(newCollections);
    _setCollections(newCollections);

    // Trigger Migration if we just logged in (transitioned from guest to auth)
    if (!isGuest) {
      const userId = useUserStore.getState().userId;
      if (userId && userId !== 'local') {
        import('@/lib/migration').then(({ migrateLocalData }) => {
          // Basic check to ensure we have collections
          if (newCollections) migrateLocalData(newCollections, userId);
        });
      }
    }
  }, [isGuest]);

  if (!collections) {
    if (window.location.pathname === '/timer-overlay') {
      return null;
    }

    return (
      <div className="h-screen w-full flex items-center justify-center bg-background text-muted-foreground">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm">Initializing database...</p>
        </div>
      </div>
    );
  }

  return (
    <CollectionsContext.Provider value={collections}>
      {children}
    </CollectionsContext.Provider>
  );
}

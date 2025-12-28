import { ReactNode, useEffect, useState } from 'react';
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
  habitSchema,
} from '@/db/schema';

type Collections = {
  tasks: any;
  weightLogs: any;
  workoutLogs: any;
  expenses: any;
  workouts: any;
  userGoals: any;
  exercises: any;
  habits: any;
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
    const initCollections = async () => {
      try {
        const { createCollection } = await import('@tanstack/react-db');
        const { electricCollectionOptions } = await import('@tanstack/electric-db-collection');

        const backendUrl = import.meta.env.VITE_BACKEND_URL || (import.meta.env.PROD ? "https://selftracker.ahmedlotfy.site" : "http://localhost:8000");

        const createLocalCollection = (id: string, schema: any) => {
          const key = `local_collection_${id}`;

          const col = createCollection({
            id: id as any,
            schema: schema as any,
            getKey: (row: any) => row.id,
            sync: { sync: (p: any) => { p?.markReady?.(); return () => { }; } }
          } as any);

          try {
            const raw = localStorage.getItem(key);
            if (raw) {
              const data = JSON.parse(raw);
              if (Array.isArray(data)) {
                (col as any).upsert(data);
                console.log(`[${id}] Hydrated ${data.length} items`);
              }
            }
          } catch (err) {
            console.error(`[${id}] Failed to load local data`, err);
          }

          const _insert = col.insert.bind(col);
          const _update = col.update.bind(col);

          col.insert = (data: any) => {
            console.log(`[${id}] Action: Insert`, data);
            const result = _insert(data);
            try {
              const currentRaw = localStorage.getItem(key);
              const current = currentRaw ? JSON.parse(currentRaw) : [];
              current.push(data);
              localStorage.setItem(key, JSON.stringify(current));
            } catch (e) { }
            return result;
          };

          col.update = (keyToUpdate: any, callback: any) => {
            console.log(`[${id}] Action: Update`, keyToUpdate);
            return _update(keyToUpdate, callback);
          };

          return col;
        };

        const createElectricCollection = (table: string, schema: any) => {
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

        const createFn = !isGuest ? createElectricCollection : createLocalCollection;

        const newCollections = {
          tasks: createFn('tasks', taskSchema),
          weightLogs: createFn('weight_logs', weightLogSchema),
          workoutLogs: createFn('workout_logs', workoutLogSchema),
          expenses: createFn('expenses', expenseSchema),
          workouts: createFn('workouts', workoutSchema),
          userGoals: createFn('user_goals', userGoalSchema),
          habits: createFn('habits', habitSchema),
          exercises: createFn('exercises', exerciseSchema),
          timerSessions: createFn('timer_sessions', timerSessionSchema),
        };

        setCollections(newCollections);
        _setCollections(newCollections);

        if (!isGuest) {
          const userId = useUserStore.getState().userId;
          if (userId && userId !== 'local' && userId !== 'unknown') {
            import('@/lib/migration').then(({ migrateLocalData }) => {
              if (newCollections) {
                migrateLocalData(newCollections, userId).catch(err => {
                  console.error('[CollectionsProvider] Migration failed:', err);
                });
              }
            });
          }
        }
      } catch (err: any) {
        console.error('[CollectionsProvider] Critical Initialization Error:', err);
        throw err;
      }
    };

    initCollections();
  }, [isGuest]);

  if (!collections) {
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

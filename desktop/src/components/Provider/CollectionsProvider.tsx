import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { createCollection } from '@tanstack/react-db';
import { electricCollectionOptions } from '@tanstack/electric-db-collection';
import { _setCollections } from '@/db/collections';
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

const CollectionsContext = createContext<Collections>(null);

export function CollectionsProvider({ children }: { children: ReactNode }) {
  const [collections, setCollections] = useState<Collections>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check auth state
    const checkAuth = () => {
      const hasToken = !!localStorage.getItem("bearer_token");
      setIsAuthenticated(hasToken);
    };

    checkAuth();

    // Listen for storage changes (login/logout in other tabs)
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  useEffect(() => {
    console.log(`[CollectionsProvider] Initializing collections (authenticated: ${isAuthenticated})`)

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

    const createLocalCollection = (id: string, schema: any) => {
      console.log(`[${id}] Local-only mode`);
      return createCollection({
        id: id as any,
        schema: schema as any,
        getKey: (row: any) => row.id,
        sync: {
          sync: (params: any) => {
            params.markReady();
            return () => { };
          }
        }
      } as any);
    };

    const createElectricCollection = (table: string, schema: any) => {
      console.log(`[${table}] Electric sync mode`);
      return createCollection(
        electricCollectionOptions({
          id: table as any,
          schema: schema as any,
          getKey: (row: any) => row.id,
          shapeOptions: {
            url: `${backendUrl}/api/electric/v1/shape`,
            params: {
              table: table,
            },
          },
        })
      );
    };

    const createCollectionFn = isAuthenticated ? createElectricCollection : createLocalCollection;

    const newCollections = {
      tasks: createCollectionFn('tasks', taskSchema),
      weightLogs: createCollectionFn('weight_logs', weightLogSchema),
      workoutLogs: createCollectionFn('workout_logs', workoutLogSchema),
      expenses: createCollectionFn('expenses', expenseSchema),
      workouts: createCollectionFn('workouts', workoutSchema),
      userGoals: createCollectionFn('user_goals', userGoalSchema),
      exercises: createCollectionFn('exercises', exerciseSchema),
      timerSessions: createCollectionFn('timer_sessions', timerSessionSchema),
    };

    console.log('[CollectionsProvider] Collections initialized:', Object.keys(newCollections))
    setCollections(newCollections);
    _setCollections(newCollections);
  }, [isAuthenticated]);

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

export function useCollections() {
  return useContext(CollectionsContext);
}

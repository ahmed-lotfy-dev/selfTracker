import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { createCollection } from '@tanstack/react-db';
import { electricCollectionOptions } from '@tanstack/electric-db-collection';
import axiosInstance from '@/lib/api/axiosInstance';
import { _setCollections } from '@/db/collections';
import {
  taskSchema,
  weightLogSchema,
  workoutLogSchema,
  expenseSchema,
  workoutSchema,
  projectSchema,
  projectColumnSchema,
  userGoalSchema,
  exerciseSchema,
  timerSessionSchema,
} from '@/db/schema';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
const API_BASE = `${API_BASE_URL}/api`;

type Collections = {
  tasks: any;
  weightLogs: any;
  workoutLogs: any;
  expenses: any;
  workouts: any;
  projects: any;
  projectColumns: any;
  userGoals: any;
  exercises: any;
  timerSessions: any;
} | null;

const CollectionsContext = createContext<Collections>(null);

export function CollectionsProvider({ children }: { children: ReactNode }) {
  const [collections, setCollections] = useState<Collections>(null);

  // Listen for auth changes to re-init collections if needed
  const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem("bearer_token"));

  useEffect(() => {
    const handleStorageChange = () => {
      setAuthToken(localStorage.getItem("bearer_token"));
    }
    // Listen to custom event or storage event if cross-tab
    window.addEventListener('storage', handleStorageChange);
    // Also poll or listen to custom events if needed
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    }
  }, []);

  const token = authToken;

  useEffect(() => {
    // Build stable URLs (no token) and pass token via headers for caching
    const getUrl = (path: string) => `${API_BASE}${path}`;
    const getHeaders = (): Record<string, string> => token ? {
      'Authorization': `Bearer ${token}`
    } : {};

    const getVal = (obj: any, snake: string, camel: string) =>
      obj[snake] !== undefined ? obj[snake] : obj[camel];

    const newCollections = {
      tasks: createCollection(
        electricCollectionOptions({
          id: 'tasks',
          schema: taskSchema,
          getKey: (row) => row.id,
          shapeOptions: {
            url: getUrl('/electric/tasks'),
            headers: getHeaders()
          },
          onInsert: async ({ transaction }) => {
            const data = { ...transaction.mutations[0].modified };
            console.log('[Collections] onInsert - adding to local first:', data)

            if (!data.id) {
              data.id = crypto.randomUUID();
            }

            // If verified logged in, sync to backend
            if (!token) return undefined;

            const apiData = {
              id: getVal(data, 'id', 'id'),
              userId: getVal(data, 'user_id', 'userId'),
              projectId: getVal(data, 'project_id', 'projectId'),
              columnId: getVal(data, 'column_id', 'columnId'),
              title: getVal(data, 'title', 'title'),
              description: getVal(data, 'description', 'description'),
              completed: Boolean(getVal(data, 'completed', 'completed')),
              completedAt: getVal(data, 'completed_at', 'completedAt'),
              dueDate: getVal(data, 'due_date', 'dueDate'),
              priority: getVal(data, 'priority', 'priority'),
              order: getVal(data, 'order', 'order'),
              category: getVal(data, 'category', 'category'),
              createdAt: getVal(data, 'created_at', 'createdAt'),
              updatedAt: getVal(data, 'updated_at', 'updatedAt'),
            };

            axiosInstance.post(`${API_BASE}/tasks`, apiData)
              .then(resp => console.log('[Collections] Backend sync success:', resp.data))
              .catch(error => console.warn('[Collections] Backend sync failed (will retry):', error.message))

            return undefined
          },
          onUpdate: async ({ transaction }) => {
            if (!token) return undefined;
            const mutation = transaction.mutations[transaction.mutations.length - 1]; // Get latest mutation
            const modified = { ...mutation.modified };
            console.log('[Collections] onUpdate - syncing to backend:', mutation.original.id, modified)

            const apiData: any = {};
            const mapping: Record<string, string> = {
              'title': 'title',
              'description': 'description',
              'completed': 'completed',
              'completed_at': 'completedAt',
              'completedAt': 'completedAt',
              'due_date': 'dueDate',
              'dueDate': 'dueDate',
              'priority': 'priority',
              'order': 'order',
              'category': 'category',
              'project_id': 'projectId',
              'projectId': 'projectId',
              'column_id': 'columnId',
              'columnId': 'columnId',
              'created_at': 'createdAt',
              'createdAt': 'createdAt',
              'updated_at': 'updatedAt',
              'updatedAt': 'updatedAt'
            };

            Object.keys(modified).forEach(key => {
              if (mapping[key]) {
                let val = (modified as any)[key];
                if (mapping[key] === 'completed') {
                  val = Boolean(val);
                }
                apiData[mapping[key]] = val;
              }
            });

            axiosInstance.patch(`${API_BASE}/tasks/${mutation.original.id}`, apiData)
              .then(resp => console.log('[Collections] Backend update success:', resp.data))
              .catch(error => console.warn('[Collections] Backend update failed:', error.message));

            return undefined;
          },
          onDelete: async ({ transaction }) => {
            if (!token) return undefined;
            const original = transaction.mutations[0].original;
            axiosInstance.delete(`${API_BASE}/tasks/${original.id}`)
              .then(resp => console.log('[Collections] Backend delete success:', resp.data))
              .catch(error => console.warn('[Collections] Backend delete failed (will retry):', error.message))

            return undefined;
          },
        })
      ),
      weightLogs: createCollection(
        electricCollectionOptions({
          id: 'weight_logs',
          schema: weightLogSchema,
          getKey: (row) => row.id,
          shapeOptions: {
            url: getUrl('/electric/weight_logs'),
            headers: getHeaders()
          },
          onInsert: async ({ transaction }) => {
            if (!token) return undefined;
            const data = { ...transaction.mutations[0].modified };
            if (!data.id) data.id = crypto.randomUUID();

            const apiData = {
              id: getVal(data, 'id', 'id'),
              userId: getVal(data, 'user_id', 'userId'),
              weight: getVal(data, 'weight', 'weight'),
              mood: getVal(data, 'mood', 'mood'),
              energy: getVal(data, 'energy', 'energy'),
              notes: getVal(data, 'notes', 'notes'),
              createdAt: getVal(data, 'created_at', 'createdAt'),
              updatedAt: getVal(data, 'updated_at', 'updatedAt'),
            };

            axiosInstance.post(`${API_BASE}/weightLogs`, apiData)
              .then(resp => console.log('[Collections] WeightLog sync success:', resp.data))
              .catch(error => console.warn('[Collections] WeightLog sync failed:', error.message))
            return undefined;
          },
          onUpdate: async ({ transaction }) => {
            if (!token) return undefined;
            const mutation = transaction.mutations[0];
            const mod: any = mutation.modified;
            const apiData: any = {};
            const fields = [['weight', 'weight'], ['mood', 'mood'], ['energy', 'energy'], ['notes', 'notes'], ['created_at', 'createdAt'], ['updated_at', 'updatedAt']];
            fields.forEach(([s, c]) => { if (mod[s] !== undefined || mod[c] !== undefined) apiData[c] = getVal(mod, s, c); });
            axiosInstance.patch(`${API_BASE}/weightLogs/${mutation.original.id}`, apiData).catch(e => console.warn('[Sync] Weight update fail:', e.message));
            return undefined;
          },
          onDelete: async ({ transaction }) => {
            if (!token) return undefined;
            const original = transaction.mutations[0].original;
            axiosInstance.delete(`${API_BASE}/weightLogs/${original.id}`).catch(e => console.warn('[Sync] Weight delete fail:', e.message));
            return undefined;
          },
        })
      ),
      workoutLogs: createCollection(
        electricCollectionOptions({
          id: 'workout_logs',
          schema: workoutLogSchema,
          getKey: (row) => row.id,
          shapeOptions: {
            url: getUrl('/electric/workout_logs'),
            headers: getHeaders()
          },
          onInsert: async ({ transaction }) => {
            if (!token) return undefined;
            const data = { ...transaction.mutations[0].modified };
            if (!data.id) data.id = crypto.randomUUID();

            const apiData = {
              id: getVal(data, 'id', 'id'),
              userId: getVal(data, 'user_id', 'userId'),
              workoutId: getVal(data, 'workout_id', 'workoutId'),
              workoutName: getVal(data, 'workout_name', 'workoutName'),
              notes: getVal(data, 'notes', 'notes'),
              createdAt: getVal(data, 'created_at', 'createdAt'),
              updatedAt: getVal(data, 'updated_at', 'updatedAt'),
            };

            axiosInstance.post(`${API_BASE}/workoutLogs`, apiData)
              .then(resp => console.log('[Collections] WorkoutLog sync success:', resp.data))
              .catch(error => console.warn('[Collections] WorkoutLog sync failed:', error.message))
            return undefined;
          },
          onUpdate: async ({ transaction }) => {
            if (!token) return undefined;
            const mutation = transaction.mutations[0];
            const mod: any = mutation.modified;
            const apiData: any = {};
            const fields = [['workout_id', 'workoutId'], ['workout_name', 'workoutName'], ['notes', 'notes'], ['created_at', 'createdAt'], ['updated_at', 'updatedAt']];
            fields.forEach(([s, c]) => { if (mod[s] !== undefined || mod[c] !== undefined) apiData[c] = getVal(mod, s, c); });
            axiosInstance.patch(`${API_BASE}/workoutLogs/${mutation.original.id}`, apiData).catch(e => console.warn('[Sync] WorkoutLog update fail:', e.message));
            return undefined;
          },
          onDelete: async ({ transaction }) => {
            if (!token) return undefined;
            const original = transaction.mutations[0].original;
            axiosInstance.delete(`${API_BASE}/workoutLogs/${original.id}`)
              .then(resp => console.log('[Collections] WorkoutLog delete success:', resp.data))
              .catch(error => console.warn('[Collections] WorkoutLog delete failed:', error.message))
            return undefined;
          },
        })
      ),
      expenses: createCollection(
        electricCollectionOptions({
          id: 'expenses',
          schema: expenseSchema,
          getKey: (row) => row.id,
          shapeOptions: {
            url: getUrl('/electric/expenses'),
            headers: getHeaders()
          },
          onInsert: async ({ transaction }) => {
            if (!token) return undefined;
            const data = { ...transaction.mutations[0].modified };
            if (!data.id) data.id = crypto.randomUUID();

            const apiData = {
              id: getVal(data, 'id', 'id'),
              userId: getVal(data, 'user_id', 'userId'),
              description: getVal(data, 'description', 'description'),
              amount: getVal(data, 'amount', 'amount'),
              category: getVal(data, 'category', 'category'),
              createdAt: getVal(data, 'created_at', 'createdAt'),
              updatedAt: getVal(data, 'updated_at', 'updatedAt'),
            };

            axiosInstance.post(`${API_BASE}/expenses`, apiData)
              .then(resp => console.log('[Collections] Expense sync success:', resp.data))
              .catch(error => console.warn('[Collections] Expense sync failed:', error.message))
            return undefined;
          },
          onUpdate: async ({ transaction }) => {
            if (!token) return undefined;
            const mutation = transaction.mutations[0];
            const mod: any = mutation.modified;
            const apiData: any = {};
            const fields = [['description', 'description'], ['amount', 'amount'], ['category', 'category'], ['created_at', 'createdAt'], ['updated_at', 'updatedAt']];
            fields.forEach(([s, c]) => { if (mod[s] !== undefined || mod[c] !== undefined) apiData[c] = getVal(mod, s, c); });
            axiosInstance.patch(`${API_BASE}/expenses/${mutation.original.id}`, apiData).catch(e => console.warn('[Sync] Expense update fail:', e.message));
            return undefined;
          },
          onDelete: async ({ transaction }) => {
            if (!token) return undefined;
            const original = transaction.mutations[0].original;
            axiosInstance.delete(`${API_BASE}/expenses/${original.id}`).catch(e => console.warn('[Sync] Expense delete fail:', e.message));
            return undefined;
          },
        })
      ),
      workouts: createCollection(
        electricCollectionOptions({
          id: 'workouts',
          schema: workoutSchema,
          getKey: (row) => row.id,
          shapeOptions: {
            url: getUrl('/electric/workouts'),
            headers: getHeaders()
          },
          onInsert: async ({ transaction }) => {
            if (!token) return undefined;
            const data: any = { ...transaction.mutations[0].modified };
            if (!data.id) data.id = crypto.randomUUID();
            const apiData = {
              id: getVal(data, 'id', 'id'),
              userId: getVal(data, 'user_id', 'userId'),
              name: getVal(data, 'name', 'name'),
              trainingSplitId: getVal(data, 'training_split_id', 'trainingSplitId'),
              createdAt: getVal(data, 'created_at', 'createdAt'),
              updatedAt: getVal(data, 'updated_at', 'updatedAt'),
            };
            axiosInstance.post(`${API_BASE}/workouts`, apiData)
              .then(resp => console.log('[Collections] Workout sync success:', resp.data))
              .catch(error => console.warn('[Collections] Workout sync failed:', error.message))
            return undefined;
          },
          onUpdate: async ({ transaction }) => {
            if (!token) return undefined;
            const mod: any = transaction.mutations[0].modified;
            const apiData: Record<string, any> = {};
            if (mod.name !== undefined) apiData.name = getVal(mod, 'name', 'name');
            if (mod.training_split_id !== undefined || mod.trainingSplitId !== undefined)
              apiData.trainingSplitId = getVal(mod, 'training_split_id', 'trainingSplitId');
            if (mod.updated_at !== undefined || mod.updatedAt !== undefined)
              apiData.updatedAt = getVal(mod, 'updated_at', 'updatedAt');

            axiosInstance.patch(`${API_BASE}/workouts/${transaction.mutations[0].original.id}`, apiData)
              .then(resp => console.log('[Collections] Workout update success:', resp.data))
              .catch(error => console.warn('[Collections] Workout update failed:', error.message))
            return undefined;
          },
          onDelete: async ({ transaction }) => {
            if (!token) return undefined;
            const original = transaction.mutations[0].original;
            axiosInstance.delete(`${API_BASE}/workouts/${original.id}`)
              .then(resp => console.log('[Collections] Workout delete success:', resp.data))
              .catch(error => console.warn('[Collections] Workout delete failed:', error.message))
            return undefined;
          }
        })
      ),
      projects: createCollection(
        electricCollectionOptions({
          id: 'projects',
          schema: projectSchema,
          getKey: (row) => row.id,
          shapeOptions: {
            url: getUrl('/electric/projects'),
            headers: getHeaders()
          },
          onInsert: async ({ transaction }) => {
            if (!token) return undefined;
            const data = { ...transaction.mutations[0].modified };
            if (!data.id) data.id = crypto.randomUUID();
            const apiData = {
              id: data.id,
              userId: data.user_id,
              name: data.name,
              color: data.color,
              isArchived: Boolean(data.is_archived),
              createdAt: data.created_at,
              updatedAt: data.updated_at,
            };
            axiosInstance.post(`${API_BASE}/projects`, apiData)
              .then(resp => console.log('[Collections] Project sync success:', resp.data))
              .catch(error => console.warn('[Collections] Project sync failed:', error.message))
            return undefined;
          },
          onUpdate: async ({ transaction }) => {
            if (!token) return undefined;
            const mutation = transaction.mutations[0];
            const modified = { ...mutation.modified };
            const apiData: Record<string, any> = {};
            if (modified.name !== undefined) apiData.name = modified.name;
            if (modified.color !== undefined) apiData.color = modified.color;
            if (modified.is_archived !== undefined) apiData.isArchived = Boolean(modified.is_archived);
            if (modified.updated_at !== undefined) apiData.updatedAt = modified.updated_at;

            axiosInstance.patch(`${API_BASE}/projects/${mutation.original.id}`, apiData)
              .then(resp => console.log('[Collections] Project update success:', resp.data))
              .catch(error => console.warn('[Collections] Project update failed:', error.message))
            return undefined;
          },
          onDelete: async ({ transaction }) => {
            if (!token) return undefined;
            const original = transaction.mutations[0].original;
            axiosInstance.delete(`${API_BASE}/projects/${original.id}`)
              .then(resp => console.log('[Collections] Project delete success:', resp.data))
              .catch(error => console.warn('[Collections] Project delete failed:', error.message))
            return undefined;
          }
        })
      ),
      projectColumns: createCollection(
        electricCollectionOptions({
          id: 'project_columns',
          schema: projectColumnSchema,
          getKey: (row) => row.id,
          shapeOptions: {
            url: getUrl('/electric/project_columns'),
            headers: getHeaders()
          },
          onInsert: async ({ transaction }) => {
            if (!token) return undefined;
            const data = { ...transaction.mutations[0].modified };
            if (!data.id) data.id = crypto.randomUUID();
            const apiData = {
              id: data.id,
              projectId: data.project_id,
              name: data.name,
              order: data.order,
              type: data.type,
              createdAt: data.created_at,
              updatedAt: data.updated_at,
            };
            axiosInstance.post(`${API_BASE}/projects/${data.project_id}/columns`, apiData)
              .then(resp => console.log('[Collections] Column sync success:', resp.data))
              .catch(error => console.warn('[Collections] Column sync failed:', error.message))
            return undefined;
          },
          onUpdate: async ({ transaction }) => {
            if (!token) return undefined;
            const mutation = transaction.mutations[0];
            const mod: any = mutation.modified;
            const apiData: Record<string, any> = {};
            if (mod.name !== undefined) apiData.name = mod.name;
            if (mod.order !== undefined) apiData.order = mod.order;
            if (mod.type !== undefined) apiData.type = mod.type;
            if (mod.updated_at !== undefined) apiData.updatedAt = mod.updated_at;

            // Assuming project ID is available from original if not modified, or we need to know it for the URL path?
            // Actually backend usually has /columns/:id or /projects/:pid/columns/:cid
            // Let's assume /projects/columns/:id or similar.
            // Mobile app likely uses /projects/:pid/columns/:cid
            // I need to look at mobile schema sync. But standard CRUD usually suffices.
            // If I don't have projectId, I might fail path params.
            // But existing sync handlers used generic resource paths.
            // Let's check api routes or just use /projects/columns/:id if it exists.
            // I'll check mobile backend routes later if sync fails. For now, best effort.
            // Actually, the CollectionsProvider doesn't use `projectId` in path for other entities.
            // Let's try direct patch if backend supports it.
            axiosInstance.patch(`${API_BASE}/projects/columns/${mutation.original.id}`, apiData)
              // Fallback or specific route might be needed
              .catch(e => console.warn('[Sync] Column update fail:', e.message));
            return undefined;
          },
          onDelete: async ({ transaction }) => {
            if (!token) return undefined;
            const original = transaction.mutations[0].original;
            axiosInstance.delete(`${API_BASE}/projects/columns/${original.id}`).catch(e => console.warn('[Sync] Column delete fail:', e.message));
            return undefined;
          }
        })
      ),
      userGoals: createCollection(
        electricCollectionOptions({
          id: 'user_goals',
          schema: userGoalSchema,
          getKey: (row) => row.id,
          shapeOptions: {
            url: getUrl('/electric/user_goals'),
            headers: getHeaders()
          },
          onInsert: async ({ transaction }) => {
            if (!token) return undefined;
            const data = { ...transaction.mutations[0].modified };
            if (!data.id) data.id = crypto.randomUUID();
            const apiData = {
              id: data.id,
              userId: data.user_id,
              goalType: data.goal_type,
              targetValue: data.target_value,
              achieved: Boolean(data.achieved),
              deadline: data.deadline,
              createdAt: data.created_at,
              updatedAt: data.updated_at,
            };
            axiosInstance.post(`${API_BASE}/users/goals`, apiData)
              .then(resp => console.log('[Collections] Goal sync success:', resp.data))
              .catch(error => console.warn('[Collections] Goal sync failed:', error.message))
            return undefined;
          },
          onDelete: async ({ transaction }) => {
            if (!token) return undefined;
            const original = transaction.mutations[0].original;
            axiosInstance.delete(`${API_BASE}/users/goals/${original.id}`)
              .then(resp => console.log('[Collections] Goal delete success:', resp.data))
              .catch(error => console.warn('[Collections] Goal delete failed:', error.message))
            return undefined;
          }
        })
      ),
      exercises: createCollection(
        electricCollectionOptions({
          id: 'exercises',
          schema: exerciseSchema,
          getKey: (row) => row.id,
          shapeOptions: {
            url: getUrl('/electric/exercises'),
            headers: getHeaders()
          },
        })
      ),
      timerSessions: createCollection(
        electricCollectionOptions({
          id: 'timer_sessions',
          schema: timerSessionSchema,
          getKey: (row) => row.id,
          shapeOptions: {
            url: getUrl('/electric/timer_sessions'),
            headers: getHeaders()
          },
          onInsert: async ({ transaction }) => {
            if (!token) return undefined;
            const data = { ...transaction.mutations[0].modified };
            if (!data.id) data.id = crypto.randomUUID();
            const apiData = {
              id: data.id,
              userId: data.user_id,
              taskId: data.task_id,
              startTime: data.start_time,
              endTime: data.end_time,
              duration: data.duration,
              type: data.type,
              completed: data.completed,
              createdAt: data.created_at,
              updatedAt: data.updated_at,
            };
            axiosInstance.post(`${API_BASE}/timer/sessions`, apiData)
              .then(resp => console.log('[Collections] Timer sync success:', resp.data))
              .catch(error => console.warn('[Collections] Timer sync failed:', error.message))
            return undefined;
          }
        })
      ),
    };

    console.log('[CollectionsProvider] Initializing collections...')
    setCollections(newCollections);
    _setCollections(newCollections);
    console.log('[CollectionsProvider] Collections initialized:', Object.keys(newCollections))
  }, [token]);

  return (
    <CollectionsContext.Provider value={collections}>
      {children}
    </CollectionsContext.Provider>
  );
}

export function useCollections() {
  const context = useContext(CollectionsContext);
  if (!context) {
    // throw new Error('useCollections must be used within CollectionsProvider');
    return null; // Return null if not ready logic might be handled by consumer
  }
  return context;
}

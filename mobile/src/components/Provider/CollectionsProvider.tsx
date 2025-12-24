import React, { createContext, useContext, useMemo, ReactNode, useEffect, useState } from 'react';
import { createCollection } from '@tanstack/react-db';
import { electricCollectionOptions } from '@tanstack/electric-db-collection';
import { useAuth } from '@/src/features/auth/useAuthStore';
import axiosInstance from '@/src/lib/api/axiosInstance';
import { API_BASE_URL } from '@/src/lib/api/config';
import { _setCollections } from '@/src/db/collections';
import {
  taskSchema,
  weightLogSchema,
  workoutLogSchema,
  expenseSchema,
  workoutSchema,
  projectSchema,
  userGoalSchema,
  exerciseSchema,
  timerSessionSchema,
} from '@/src/db/schema';

const getApiBase = () => {
  const base = API_BASE_URL || 'https://selftracker.ahmedlotfy.site';
  return base.endsWith('/') ? base.slice(0, -1) : base;
};

const API_BASE = `${getApiBase()}/api`;

type Collections = {
  tasks: any;
  weightLogs: any;
  workoutLogs: any;
  expenses: any;
  workouts: any;
  projects: any;
  userGoals: any;
  exercises: any;
  timerSessions: any;
} | null;

const CollectionsContext = createContext<Collections>(null);

export function CollectionsProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [collections, setCollections] = useState<Collections>(null);

  useEffect(() => {
    if (!token) {
      setCollections(null);
      return;
    }


    // Build stable URLs (no token) and pass token via headers for caching
    const getUrl = (path: string) => `${API_BASE}${path}`;
    const getHeaders = () => ({
      'Authorization': `Bearer ${token}`
    });

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

            // Generate ID if not present
            if (!data.id) {
              data.id = crypto.randomUUID();
            }

            // Map snake_case to camelCase for API
            const apiData = {
              id: getVal(data, 'id', 'id'),
              userId: getVal(data, 'user_id', 'userId'),
              projectId: getVal(data, 'project_id', 'projectId'),
              columnId: getVal(data, 'column_id', 'columnId'),
              title: getVal(data, 'title', 'title'),
              description: getVal(data, 'description', 'description'),
              completed: getVal(data, 'completed', 'completed'),
              completedAt: getVal(data, 'completed_at', 'completedAt'),
              dueDate: getVal(data, 'due_date', 'dueDate'),
              priority: getVal(data, 'priority', 'priority'),
              order: getVal(data, 'order', 'order'),
              category: getVal(data, 'category', 'category'),
              createdAt: getVal(data, 'created_at', 'createdAt'),
              updatedAt: getVal(data, 'updated_at', 'updatedAt'),
            };

            // Optimistic sync
            axiosInstance.post(`${API_BASE}/tasks`, apiData)
              .then(resp => console.log('[Collections] Backend sync success:', resp.data))
              .catch(error => console.warn('[Collections] Backend sync failed (will retry):', error.message))

            return undefined
          },
          onUpdate: async ({ transaction }) => {
            const mutation = transaction.mutations[0];
            const modified = { ...mutation.modified };
            console.log('[Collections] onUpdate - updating local first:', modified)

            // Map snake_case to camelCase for API
            const mod: any = modified;
            const apiData: Record<string, any> = {};
            if (mod.title !== undefined) apiData.title = getVal(mod, 'title', 'title');
            if (mod.description !== undefined) apiData.description = getVal(mod, 'description', 'description');
            if (mod.completed !== undefined) apiData.completed = getVal(mod, 'completed', 'completed');
            if (mod.completed_at !== undefined || mod.completedAt !== undefined) apiData.completedAt = getVal(mod, 'completed_at', 'completedAt');
            if (mod.due_date !== undefined || mod.dueDate !== undefined) apiData.dueDate = getVal(mod, 'due_date', 'dueDate');
            if (mod.priority !== undefined) apiData.priority = getVal(mod, 'priority', 'priority');
            if (mod.order !== undefined) apiData.order = getVal(mod, 'order', 'order');
            if (mod.category !== undefined) apiData.category = getVal(mod, 'category', 'category');
            if (mod.project_id !== undefined || mod.projectId !== undefined) apiData.projectId = getVal(mod, 'project_id', 'projectId');
            if (mod.column_id !== undefined || mod.columnId !== undefined) apiData.columnId = getVal(mod, 'column_id', 'columnId');
            if (mod.created_at !== undefined || mod.createdAt !== undefined) apiData.createdAt = getVal(mod, 'created_at', 'createdAt');
            if (mod.updated_at !== undefined || mod.updatedAt !== undefined) apiData.updatedAt = getVal(mod, 'updated_at', 'updatedAt');

            axiosInstance.patch(`${API_BASE}/tasks/${mutation.original.id}`, apiData)
              .then(resp => console.log('[Collections] Backend update success:', resp.data))
              .catch(error => console.warn('[Collections] Backend update failed (will retry):', error.message))

            return undefined;
          },
          onDelete: async ({ transaction }) => {
            const original = transaction.mutations[0].original;
            console.log('[Collections] onDelete - removing from local first:', original.id)

            // Optimistic: Delete locally first, sync to backend asynchronously
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
            const mutation = transaction.mutations[0];
            const mod: any = mutation.modified;
            const apiData: any = {};
            const fields = [['weight', 'weight'], ['mood', 'mood'], ['energy', 'energy'], ['notes', 'notes'], ['created_at', 'createdAt'], ['updated_at', 'updatedAt']];
            fields.forEach(([s, c]) => { if (mod[s] !== undefined || mod[c] !== undefined) apiData[c] = getVal(mod, s, c); });
            axiosInstance.patch(`${API_BASE}/weightLogs/${mutation.original.id}`, apiData).catch(e => console.warn('[Sync] Weight update fail:', e.message));
            return undefined;
          },
          onDelete: async ({ transaction }) => {
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
            const mutation = transaction.mutations[0];
            const mod: any = mutation.modified;
            const apiData: any = {};
            const fields = [['workout_id', 'workoutId'], ['workout_name', 'workoutName'], ['notes', 'notes'], ['created_at', 'createdAt'], ['updated_at', 'updatedAt']];
            fields.forEach(([s, c]) => { if (mod[s] !== undefined || mod[c] !== undefined) apiData[c] = getVal(mod, s, c); });
            axiosInstance.patch(`${API_BASE}/workoutLogs/${mutation.original.id}`, apiData).catch(e => console.warn('[Sync] WorkoutLog update fail:', e.message));
            return undefined;
          },
          onDelete: async ({ transaction }) => {
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
            const mutation = transaction.mutations[0];
            const mod: any = mutation.modified;
            const apiData: any = {};
            const fields = [['description', 'description'], ['amount', 'amount'], ['category', 'category'], ['created_at', 'createdAt'], ['updated_at', 'updatedAt']];
            fields.forEach(([s, c]) => { if (mod[s] !== undefined || mod[c] !== undefined) apiData[c] = getVal(mod, s, c); });
            axiosInstance.patch(`${API_BASE}/expenses/${mutation.original.id}`, apiData).catch(e => console.warn('[Sync] Expense update fail:', e.message));
            return undefined;
          },
          onDelete: async ({ transaction }) => {
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
            const data = { ...transaction.mutations[0].modified };
            if (!data.id) data.id = crypto.randomUUID();
            const apiData = {
              id: data.id,
              userId: data.user_id,
              name: data.name,
              color: data.color,
              isArchived: data.is_archived,
              createdAt: data.created_at,
              updatedAt: data.updated_at,
            };
            axiosInstance.post(`${API_BASE}/projects`, apiData)
              .then(resp => console.log('[Collections] Project sync success:', resp.data))
              .catch(error => console.warn('[Collections] Project sync failed:', error.message))
            return undefined;
          },
          onUpdate: async ({ transaction }) => {
            const mutation = transaction.mutations[0];
            const modified = { ...mutation.modified };
            const apiData: Record<string, any> = {};
            if (modified.name !== undefined) apiData.name = modified.name;
            if (modified.color !== undefined) apiData.color = modified.color;
            if (modified.is_archived !== undefined) apiData.isArchived = modified.is_archived;
            if (modified.updated_at !== undefined) apiData.updatedAt = modified.updated_at;

            axiosInstance.patch(`${API_BASE}/projects/${mutation.original.id}`, apiData)
              .then(resp => console.log('[Collections] Project update success:', resp.data))
              .catch(error => console.warn('[Collections] Project update failed:', error.message))
            return undefined;
          },
          onDelete: async ({ transaction }) => {
            const original = transaction.mutations[0].original;
            axiosInstance.delete(`${API_BASE}/projects/${original.id}`)
              .then(resp => console.log('[Collections] Project delete success:', resp.data))
              .catch(error => console.warn('[Collections] Project delete failed:', error.message))
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
            const data = { ...transaction.mutations[0].modified };
            if (!data.id) data.id = crypto.randomUUID();
            const apiData = {
              id: data.id,
              userId: data.user_id,
              goalType: data.goal_type,
              targetValue: data.target_value,
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
    _setCollections(newCollections); // Update module-level exports for backwards compatibility
    console.log('[CollectionsProvider] Collections initialized:', Object.keys(newCollections))
  }, [token]);

  // Always render children - individual screens will handle loading states
  return (
    <CollectionsContext.Provider value={collections}>
      {children}
    </CollectionsContext.Provider>
  );
}

export function useCollections() {
  const context = useContext(CollectionsContext);
  if (!context) {
    throw new Error('useCollections must be used within CollectionsProvider');
  }
  return context;
}

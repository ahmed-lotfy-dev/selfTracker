import React, { createContext, useContext, useMemo, ReactNode, useEffect, useState } from 'react';
import { createCollection } from '@tanstack/react-db';
import { electricCollectionOptions } from '@tanstack/electric-db-collection';
import { useAuth } from '@/src/features/auth/useAuthStore';
import axiosInstance from '@/src/lib/api/axiosInstane';
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
            const data = transaction.mutations[0].modified;
            // Generate ID if not present
            if (!data.id) {
              data.id = crypto.randomUUID();
            }
            const resp = await axiosInstance.post(`${API_BASE}/tasks`, data);
            return { txid: resp.data.task.txid };
          },
          onUpdate: async ({ transaction }) => {
            const mutation = transaction.mutations[0];
            const resp = await axiosInstance.patch(`${API_BASE}/tasks/${mutation.original.id}`, mutation.modified);
            return { txid: resp.data.task.txid };
          },
          onDelete: async ({ transaction }) => {
            const resp = await axiosInstance.delete(`${API_BASE}/tasks/${transaction.mutations[0].original.id}`);
            return { txid: resp.data.txid };
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
            const data = transaction.mutations[0].modified;
            if (!data.id) {
              data.id = crypto.randomUUID();
            }
            const resp = await axiosInstance.post(`${API_BASE}/weightLogs`, data);
            return { txid: resp.data.txid };
          },
          onUpdate: async ({ transaction }) => {
            const mutation = transaction.mutations[0];
            const resp = await axiosInstance.patch(`${API_BASE}/weightLogs/${mutation.original.id}`, mutation.modified);
            return { txid: resp.data.txid };
          },
          onDelete: async ({ transaction }) => {
            const resp = await axiosInstance.delete(`${API_BASE}/weightLogs/${transaction.mutations[0].original.id}`);
            return { txid: resp.data.txid };
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
            const data = transaction.mutations[0].modified;
            if (!data.id) {
              data.id = crypto.randomUUID();
            }
            const resp = await axiosInstance.post(`${API_BASE}/workoutLogs`, data);
            return { txid: resp.data.txid };
          },
          onUpdate: async ({ transaction }) => {
            const mutation = transaction.mutations[0];
            const resp = await axiosInstance.patch(`${API_BASE}/workoutLogs/${mutation.original.id}`, mutation.modified);
            return { txid: resp.data.txid };
          },
          onDelete: async ({ transaction }) => {
            const resp = await axiosInstance.delete(`${API_BASE}/workoutLogs/${transaction.mutations[0].original.id}`);
            return { txid: resp.data.txid };
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
            const data = transaction.mutations[0].modified;
            if (!data.id) {
              data.id = crypto.randomUUID();
            }
            const resp = await axiosInstance.post(`${API_BASE}/expenses`, data);
            return { txid: resp.data.txid };
          },
          onUpdate: async ({ transaction }) => {
            const mutation = transaction.mutations[0];
            const resp = await axiosInstance.patch(`${API_BASE}/expenses/${mutation.original.id}`, mutation.modified);
            return { txid: resp.data.txid };
          },
          onDelete: async ({ transaction }) => {
            const resp = await axiosInstance.delete(`${API_BASE}/expenses/${transaction.mutations[0].original.id}`);
            return { txid: resp.data.txid };
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
    };

    setCollections(newCollections);
    _setCollections(newCollections); // Update module-level exports for backwards compatibility
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

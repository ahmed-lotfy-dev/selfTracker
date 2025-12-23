import { createCollection } from '@tanstack/react-db';
import { electricCollectionOptions } from '@tanstack/electric-db-collection';
import axiosInstance from '../lib/api/axiosInstane';
import * as SecureStore from 'expo-secure-store';
import {
  taskSchema,
  weightLogSchema,
  workoutLogSchema,
  userGoalSchema,
  expenseSchema,
  workoutSchema,
  projectSchema,
  projectColumnSchema,
  exerciseSchema,
  trainingSplitSchema,
  workoutExerciseSchema,
  timerSessionSchema
} from './schema';
import { API_BASE_URL } from '../lib/api/config';

const getApiBase = () => {
  const base = API_BASE_URL || 'https://selftracker.ahmedlotfy.site';
  return base.endsWith('/') ? base.slice(0, -1) : base;
};

const getElectricHeaders = async () => {
  const token = (await SecureStore.getItemAsync('selftracker.session_token')) ||
    (await SecureStore.getItemAsync('selftracker.better-auth.session_token'));

  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`,
    Cookie: `better-auth.session_token=${token}; __Secure-better-auth.session_token=${token}`
  };
};

const API_BASE = `${getApiBase()}/api`;

console.log(`[DB_COLLECTIONS] Initialized with API_BASE: ${API_BASE}`);

export const taskCollection = createCollection(
  electricCollectionOptions({
    id: 'tasks',
    schema: taskSchema,
    getKey: (row) => row.id,
    shapeOptions: {
      url: `${API_BASE}/electric/tasks`,
      headers: getElectricHeaders as any,
    },
    onInsert: async ({ transaction }) => {
      const resp = await axiosInstance.post(`${API_BASE}/tasks`, transaction.mutations[0].modified);
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
);

export const weightLogCollection = createCollection(
  electricCollectionOptions({
    id: 'weight_logs',
    schema: weightLogSchema,
    getKey: (row) => row.id,
    shapeOptions: {
      url: `${API_BASE}/electric/weight_logs`,
      headers: getElectricHeaders as any,
    },
    onInsert: async ({ transaction }) => {
      const resp = await axiosInstance.post(`${API_BASE}/weightLogs`, transaction.mutations[0].modified);
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
);

export const workoutLogCollection = createCollection(
  electricCollectionOptions({
    id: 'workout_logs',
    schema: workoutLogSchema,
    getKey: (row) => row.id,
    shapeOptions: {
      url: `${API_BASE}/electric/workout_logs`,
      headers: getElectricHeaders as any,
    },
    onInsert: async ({ transaction }) => {
      const resp = await axiosInstance.post(`${API_BASE}/workoutLogs`, transaction.mutations[0].modified);
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
);

export const expenseCollection = createCollection(
  electricCollectionOptions({
    id: 'expenses',
    schema: expenseSchema,
    getKey: (row) => row.id,
    shapeOptions: {
      url: `${API_BASE}/electric/expenses`,
      headers: getElectricHeaders as any,
    },
    onInsert: async ({ transaction }) => {
      const resp = await axiosInstance.post(`${API_BASE}/expenses`, transaction.mutations[0].modified);
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
);

// Read-only collections (for now, or using standard API if writes are needed)
export const workoutCollection = createCollection(
  electricCollectionOptions({
    id: 'workouts',
    schema: workoutSchema,
    getKey: (row) => row.id,
    shapeOptions: {
      url: `${API_BASE}/electric/workouts`,
      headers: getElectricHeaders as any,
    },
  })
);

export const projectCollection = createCollection(
  electricCollectionOptions({
    id: 'projects',
    schema: projectSchema,
    getKey: (row) => row.id,
    shapeOptions: {
      url: `${API_BASE}/electric/projects`,
      headers: getElectricHeaders as any,
    },
  })
);

export const userGoalCollection = createCollection(
  electricCollectionOptions({
    id: 'user_goals',
    schema: userGoalSchema,
    getKey: (row) => row.id,
    shapeOptions: {
      url: `${API_BASE}/electric/user_goals`,
      headers: getElectricHeaders as any,
    },
  })
);

export const exerciseCollection = createCollection(
  electricCollectionOptions({
    id: 'exercises',
    schema: exerciseSchema,
    getKey: (row) => row.id,
    shapeOptions: {
      url: `${API_BASE}/electric/exercises`,
      headers: getElectricHeaders as any,
    },
  })
);

import { z } from 'zod';

export const workoutLogSchema = z.object({
  id: z.string(),
  userId: z.string(),
  workoutId: z.string(),
  workoutName: z.string(),
  notes: z.string().optional().nullable(),
  createdAt: z.union([z.string(), z.number(), z.date()]),
  updatedAt: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
  deletedAt: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
});

export const weightLogSchema = z.object({
  id: z.string(),
  userId: z.string(),
  weight: z.string(),
  mood: z.string().optional().nullable(),
  energy: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  createdAt: z.union([z.string(), z.number(), z.date()]),
  updatedAt: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
  deletedAt: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
});

export const taskSchema = z.object({
  id: z.string(),
  userId: z.string(),
  projectId: z.string().optional().nullable(),
  columnId: z.string().optional().nullable(),
  title: z.string(),
  description: z.string().optional().nullable(),
  completed: z.boolean().default(false),
  dueDate: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
  priority: z.string().default('medium'),
  order: z.number().default(0),
  category: z.string(),
  completedAt: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
  createdAt: z.union([z.string(), z.number(), z.date()]),
  updatedAt: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
  deletedAt: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
});

export const workoutSchema = z.object({
  id: z.string(),
  userId: z.string().optional().nullable(),
  name: z.string(),
  trainingSplitId: z.string().optional().nullable(),
  createdAt: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
  updatedAt: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
  deletedAt: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
});

export const projectSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  color: z.string().default('#000000'),
  isArchived: z.boolean().default(false),
  createdAt: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
  updatedAt: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
  deletedAt: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
});

export const projectColumnSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  name: z.string(),
  order: z.number().default(0),
  type: z.string().default('todo'),
  createdAt: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
  updatedAt: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
  deletedAt: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
});

export const userGoalSchema = z.object({
  id: z.string(),
  userId: z.string(),
  goalType: z.string(),
  targetValue: z.string(),
  deadline: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
  achieved: z.boolean().default(false),
  createdAt: z.union([z.string(), z.number(), z.date()]),
  updatedAt: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
  deletedAt: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
});

export const exerciseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional().nullable(),
  createdAt: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
  updatedAt: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
  deletedAt: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
});

export const trainingSplitSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional().nullable(),
  createdBy: z.string().optional().nullable(),
  isPublic: z.boolean().default(true),
  createdAt: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
  updatedAt: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
  deletedAt: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
});

export const workoutExerciseSchema = z.object({
  id: z.string(),
  workoutId: z.string(),
  exerciseId: z.string(),
  sets: z.number(),
  reps: z.number(),
  weight: z.string(),
  createdAt: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
  updatedAt: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
  deletedAt: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
});

export const expenseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  category: z.string(),
  amount: z.string(),
  description: z.string().optional().nullable(),
  createdAt: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
  updatedAt: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
  deletedAt: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
});

export const timerSessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  taskId: z.string().optional().nullable(),
  startTime: z.union([z.string(), z.number(), z.date()]),
  endTime: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
  duration: z.number().optional().nullable(),
  type: z.string().default('focus'),
  completed: z.boolean().default(false),
  createdAt: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
  updatedAt: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
  deletedAt: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
});

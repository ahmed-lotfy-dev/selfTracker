import { z } from 'zod';

export const workoutLogSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  workout_id: z.string(),
  workout_name: z.string(),
  notes: z.string().optional().nullable(),
  created_at: z.union([z.string(), z.number(), z.date()]),
  updated_at: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
  deleted_at: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
});

export const weightLogSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  weight: z.string(),
  mood: z.string().optional().nullable(),
  energy: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  created_at: z.union([z.string(), z.number(), z.date()]),
  updated_at: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
  deleted_at: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
});

export const taskSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  project_id: z.string().optional().nullable(),
  column_id: z.string().optional().nullable(),
  title: z.string(),
  description: z.string().optional().nullable(),
  completed: z.boolean().default(false),
  due_date: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
  priority: z.string().default('medium'),
  order: z.number().default(0),
  category: z.string(),
  completed_at: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
  created_at: z.union([z.string(), z.number(), z.date()]),
  updated_at: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
  deleted_at: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
});

export const workoutSchema = z.object({
  id: z.string(),
  user_id: z.string().optional().nullable(),
  name: z.string(),
  training_split_id: z.string().optional().nullable(),
  created_at: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
  updated_at: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
  deleted_at: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
});

export const projectSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  name: z.string(),
  color: z.string().default('#000000'),
  is_archived: z.boolean().default(false),
  created_at: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
  updated_at: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
  deleted_at: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
});

export const projectColumnSchema = z.object({
  id: z.string(),
  project_id: z.string(),
  name: z.string(),
  order: z.number().default(0),
  type: z.string().default('todo'),
  created_at: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
  updated_at: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
  deleted_at: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
});

export const userGoalSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  goal_type: z.string(),
  target_value: z.string(),
  deadline: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
  achieved: z.boolean().default(false),
  created_at: z.union([z.string(), z.number(), z.date()]),
  updated_at: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
  deleted_at: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
});

export const exerciseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional().nullable(),
  created_at: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
  updated_at: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
  deleted_at: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
});

export const trainingSplitSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional().nullable(),
  created_by: z.string().optional().nullable(),
  is_public: z.boolean().default(true),
  created_at: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
  updated_at: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
  deleted_at: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
});

export const workoutExerciseSchema = z.object({
  id: z.string(),
  workout_id: z.string(),
  exercise_id: z.string(),
  sets: z.number(),
  reps: z.number(),
  weight: z.string(),
  created_at: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
  updated_at: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
  deleted_at: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
});

export const expenseSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  category: z.string(),
  amount: z.string(),
  description: z.string().optional().nullable(),
  created_at: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
  updated_at: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
  deleted_at: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
});

export const timerSessionSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  task_id: z.string().optional().nullable(),
  start_time: z.union([z.string(), z.number(), z.date()]),
  end_time: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
  duration: z.number().optional().nullable(),
  type: z.string().default('focus'),
  completed: z.boolean().default(false),
  created_at: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
  updated_at: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
  deleted_at: z.union([z.string(), z.number(), z.date()]).optional().nullable(),
});

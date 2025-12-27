
import type { OpenAPIV3_1 } from "openapi-types";

export const openApiSpec: OpenAPIV3_1.Document = {
  openapi: '3.1.0',
  info: {
    title: 'SelfTracker API',
    version: '1.0.0',
    description: 'Comprehensive API documentation for the SelfTracker application.',
    contact: {
      name: 'Support',
      email: 'support@selftracker.app'
    }
  },
  servers: [
    { url: 'https://selftracker.ahmedlotfy.site', description: 'Production' }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      // Shared / Common
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          error: { type: 'string' }
        }
      },
      // Tasks
      Task: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          completed: { type: 'boolean' },
          dueDate: { type: ['string', 'null'], format: 'date-time' },
          priority: { type: ['string', 'null'], enum: ['low', 'medium', 'high'] },
          description: { type: ['string', 'null'] },
          category: { type: ['string', 'null'] },
          projectId: { type: ['string', 'null'], format: 'uuid' },
          columnId: { type: ['string', 'null'], format: 'uuid' },
          order: { type: ['integer', 'null'] },
          completedAt: { type: ['string', 'null'], format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        },
        required: ['title']
      },
      CreateTaskInput: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          completed: { type: 'boolean' },
          dueDate: { type: 'string', format: 'date-time' },
          priority: { type: 'string', enum: ['low', 'medium', 'high'] },
          description: { type: 'string' },
          category: { type: 'string' }
        },
        required: ['title']
      },
      // Users
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: ['string', 'null'] },
          email: { type: 'string', format: 'email' },
          image: { type: ['string', 'null'], format: 'uri' },
          role: { type: 'string', enum: ['user', 'admin'] }
        }
      },
      UserHomeData: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/User' },
          tasks: { type: 'array', items: { $ref: '#/components/schemas/Task' } },
          goals: { type: 'array', items: { $ref: '#/components/schemas/Goal' } },
          bmi: { type: ['number', 'null'] },
          bmiCategory: { type: ['string', 'null'] }
        }
      },
      Goal: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          goalType: { type: 'string', enum: ["loseWeight", "gainWeight", "bodyFat", "muscleMass"] },
          targetValue: { type: 'number' },
          deadline: { type: ['string', 'null'], format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      // Expenses
      Expense: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          description: { type: 'string' },
          amount: { type: 'string' }, // Handles string/number transform
          category: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      // Weight Logs
      WeightLog: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          weight: { type: 'string' },
          energy: { type: 'string', enum: ["Low", "Okay", "Good", "Great"] },
          mood: { type: 'string', enum: ["Low", "Medium", "High"] },
          notes: { type: ['string', 'null'] },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      // Workout Logs
      WorkoutLog: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          workoutId: { type: 'string' },
          workoutName: { type: 'string' },
          notes: { type: ['string', 'null'] },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      // Timer Sessions
      TimerSession: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          taskId: { type: ['string', 'null'], format: 'uuid' },
          startTime: { type: 'string', format: 'date-time' },
          endTime: { type: ['string', 'null'], format: 'date-time' },
          duration: { type: 'integer' },
          type: { type: 'string' },
          completed: { type: 'boolean' }
        }
      },
      // Habits
      Habit: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          description: { type: ['string', 'null'] },
          streak: { type: 'integer' },
          color: { type: 'string' },
          completedToday: { type: 'boolean' },
          lastCompletedAt: { type: ['string', 'null'], format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      CreateHabitInput: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          color: { type: 'string' }
        },
        required: ['name']
      }
    }
  },
  security: [{ BearerAuth: [] }],
  tags: [
    { name: 'Auth', description: 'Authentication endpoints' },
    { name: 'Users', description: 'User profile and settings' },
    { name: 'Tasks', description: 'Task management' },
    { name: 'Expenses', description: 'Expense tracking' },
    { name: 'Weight Logs', description: 'Body weight tracking' },
    { name: 'Workout Logs', description: 'Workout history' },
    { name: 'Timer', description: 'Focus timer sessions' },
    { name: 'Habits', description: 'Habit tracking and streaks' },
    { name: 'Image', description: 'Image upload and management' },
    { name: 'ElectricSQL', description: 'Data synchronization' }
  ],
  paths: {
    // --- USERS ---
    '/api/users': {
      get: {
        tags: ['Users'],
        summary: 'List users (Admin only)',
        responses: {
          '200': { description: 'List of users' },
          '401': { description: 'Unauthorized' }
        }
      }
    },
    '/api/users/me/home': {
      get: {
        tags: ['Users'],
        summary: 'Get user home data (Dashboard)',
        description: 'Aggregates tasks, weight, and goals for the dashboard.',
        responses: {
          '200': {
            description: 'User home data',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/UserHomeData' } } }
          }
        }
      }
    },
    '/api/users/check-verification': {
      post: {
        tags: ['Users'],
        summary: 'Check email verification status',
        requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { id: { type: 'string' } } } } } },
        responses: { '200': { description: 'Verification status' } }
      }
    },
    '/api/users/onboarding': {
      patch: {
        tags: ['Users'],
        summary: 'Submit onboarding data',
        requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { userId: { type: 'string' }, weight: { type: 'number' }, height: { type: 'number' }, unitSystem: { type: 'string' }, currency: { type: 'string' }, income: { type: 'number' } } } } } },
        responses: { '200': { description: 'Onboarding complete' } }
      }
    },
    '/api/users/{id}': {
      patch: {
        tags: ['Users'],
        summary: 'Update user profile',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
        responses: { '200': { description: 'User updated' } }
      },
      delete: {
        tags: ['Users'],
        summary: 'Delete user (Admin)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'User deleted' } }
      }
    },
    '/api/users/{id}/goals': {
      get: {
        tags: ['Users'],
        summary: 'Get user goals',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'User goals', content: { 'application/json': { schema: { type: 'object', properties: { goals: { type: 'array', items: { $ref: '#/components/schemas/Goal' } } } } } } } }
      }
    },
    '/api/users/goals': {
      post: {
        tags: ['Users'],
        summary: 'Create a goal',
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Goal' } } } },
        responses: { '201': { description: 'Goal created' } }
      }
    },
    '/api/users/goals/{id}': {
      delete: {
        tags: ['Users'],
        summary: 'Delete a goal',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Goal deleted' } }
      }
    },
    // --- TASKS ---
    '/api/tasks': {
      get: {
        tags: ['Tasks'],
        summary: 'Get all tasks',
        responses: {
          '200': {
            description: 'List of tasks',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Task' } } } }
          }
        }
      },
      post: {
        tags: ['Tasks'],
        summary: 'Create a task',
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateTaskInput' } } } },
        responses: { '201': { description: 'Task created' } }
      }
    },
    '/api/tasks/{id}': {
      patch: {
        tags: ['Tasks'],
        summary: 'Update task',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Task' } } } },
        responses: { '200': { description: 'Task updated' } }
      },
      delete: {
        tags: ['Tasks'],
        summary: 'Delete task',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Task deleted' } }
      }
    },
    // --- EXPENSES ---
    '/api/expenses': {
      get: {
        tags: ['Expenses'],
        summary: 'Get expenses',
        responses: { '200': { description: 'List of expenses' } }
      },
      post: {
        tags: ['Expenses'],
        summary: 'Create expense',
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Expense' } } } },
        responses: { '200': { description: 'Expense created' } }
      }
    },
    '/api/expenses/{id}': {
      patch: {
        tags: ['Expenses'],
        summary: 'Update expense',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Expense' } } } },
        responses: { '200': { description: 'Expense updated' } }
      },
      delete: {
        tags: ['Expenses'],
        summary: 'Delete expense',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Expense deleted' } }
      }
    },
    // --- WEIGHT LOGS ---
    '/api/weightLogs': {
      get: {
        tags: ['Weight Logs'],
        summary: 'Get weight logs (Paginated)',
        parameters: [
          { name: 'cursor', in: 'query', schema: { type: 'string' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } }
        ],
        responses: { '200': { description: 'Weight logs' } }
      },
      post: {
        tags: ['Weight Logs'],
        summary: 'Add weight log',
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/WeightLog' } } } },
        responses: { '200': { description: 'Log created' } }
      }
    },
    '/api/weightLogs/chart': {
      get: {
        tags: ['Weight Logs'],
        summary: 'Get weight logs for chart',
        parameters: [{ name: 'month', in: 'query', schema: { type: 'integer', default: 3 } }],
        responses: { '200': { description: 'Chart data' } }
      }
    },
    '/api/weightLogs/{id}': {
      get: { tags: ['Weight Logs'], summary: 'Get single log', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Log details' } } },
      patch: { tags: ['Weight Logs'], summary: 'Update log', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/WeightLog' } } } }, responses: { '200': { description: 'Log updated' } } },
      delete: { tags: ['Weight Logs'], summary: 'Delete log', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Log deleted' } } }
    },
    // --- WORKOUT LOGS ---
    '/api/workoutLogs': {
      get: { tags: ['Workout Logs'], summary: 'Get workout logs', parameters: [{ name: 'cursor', in: 'query', schema: { type: 'string' } }, { name: 'limit', in: 'query', schema: { type: 'integer' } }], responses: { '200': { description: 'Workout logs' } } },
      post: { tags: ['Workout Logs'], summary: 'Create workout log', requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/WorkoutLog' } } } }, responses: { '200': { description: 'Created' } } }
    },
    '/api/workoutLogs/calendar': {
      get: { tags: ['Workout Logs'], summary: 'Get calendar logs', parameters: [{ name: 'year', in: 'query', schema: { type: 'integer' } }, { name: 'month', in: 'query', schema: { type: 'integer' } }], responses: { '200': { description: 'Calendar data' } } }
    },
    '/api/workoutLogs/{id}': {
      get: { tags: ['Workout Logs'], summary: 'Get single log', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Single log' } } },
      patch: { tags: ['Workout Logs'], summary: 'Update log', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/WorkoutLog' } } } }, responses: { '200': { description: 'Updated' } } },
      delete: { tags: ['Workout Logs'], summary: 'Delete log', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Deleted' } } }
    },
    // --- TIMER ---
    '/api/timer/sessions': {
      get: { tags: ['Timer'], summary: 'Get timer sessions', responses: { '200': { description: 'Recent sessions' } } },
      post: { tags: ['Timer'], summary: 'Log timer session', requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/TimerSession' } } } }, responses: { '200': { description: 'Session logged' } } }
    },
    // --- HABITS ---
    '/api/habits': {
      get: {
        tags: ['Habits'],
        summary: 'Get all habits',
        responses: {
          '200': {
            description: 'List of habits',
            content: { 'application/json': { schema: { type: 'object', properties: { habits: { type: 'array', items: { $ref: '#/components/schemas/Habit' } } } } } }
          }
        }
      },
      post: {
        tags: ['Habits'],
        summary: 'Create a habit',
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateHabitInput' } } } },
        responses: {
          '201': {
            description: 'Habit created',
            content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string' }, habit: { $ref: '#/components/schemas/Habit' } } } } }
          }
        }
      }
    },
    '/api/habits/{id}': {
      patch: {
        tags: ['Habits'],
        summary: 'Update habit',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Habit' } } } },
        responses: { '200': { description: 'Habit updated' } }
      },
      delete: {
        tags: ['Habits'],
        summary: 'Delete habit',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Habit deleted' } }
      }
    },
    // --- IMAGE ---
    '/api/image/upload': {
      post: {
        tags: ['Image'],
        summary: 'Upload image (Cloudinary)',
        requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { image: { type: 'string', description: 'Base64 string' } } } } } },
        responses: { '200': { description: 'Image uploaded' } }
      }
    },
    '/api/image/delete': {
      post: {
        tags: ['Image'],
        summary: 'Delete image',
        requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { imageLink: { type: 'string' } } } } } },
        responses: { '200': { description: 'Image deleted' } }
      }
    }
  }
};

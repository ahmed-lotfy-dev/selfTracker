import { useTasksStore } from '@/stores/tasks-store';
import { useHabitsStore } from '@/stores/habits-store';
import { useWeightLogsStore } from '@/stores/weight-logs-store';
import { useWorkoutLogsStore } from '@/stores/workout-logs-store';

export function generateSampleTasks() {
  const tasks = [
    {
      title: 'Review project proposal',
      description: 'Go through the Q1 marketing proposal and provide feedback',
      priority: 'high' as const,
    },
    {
      title: 'Buy groceries',
      description: 'Milk, eggs, bread, vegetables, fruits',
      priority: 'medium' as const,
    },
    {
      title: 'Call mom',
      description: '',
      priority: 'low' as const,
    },
    {
      title: 'Finish reading "Atomic Habits"',
      description: 'Currently on chapter 12',
      priority: 'low' as const,
    },
    {
      title: 'Schedule dentist appointment',
      description: 'Regular checkup - overdue',
      priority: 'medium' as const,
    },
    {
      title: 'Update resume',
      description: 'Add recent projects and skills',
      priority: 'low' as const,
    },
  ];

  return tasks;
}

export function generateSampleHabits() {
  const habits = [
    {
      name: 'Drink 8 glasses of water',
      color: '#3b82f6',
    },
    {
      name: 'Exercise for 30 minutes',
      color: '#10b981',
    },
    {
      name: 'Read for 20 minutes',
      color: '#8b5cf6',
    },
    {
      name: 'Meditate',
      color: '#f59e0b',
    },
    {
      name: 'Practice gratitude',
      color: '#ec4899',
    },
  ];

  return habits;
}

export function generateSampleWeightLogs() {
  const logs = [];
  const today = new Date();
  const startWeight = 75;
  const targetWeight = 70;
  const days = 30;

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const progress = (days - i) / days;
    const weightChange = (targetWeight - startWeight) * progress;
    const randomVariation = (Math.random() - 0.5) * 0.8;
    const weight = (startWeight + weightChange + randomVariation).toFixed(1);

    const moods = ['happy', 'neutral', 'sad'];
    const energyLevels = ['high', 'medium', 'low'];

    const mood = moods[Math.floor(Math.random() * moods.length)];
    const energy = energyLevels[Math.floor(Math.random() * energyLevels.length)];

    logs.push({
      weight: weight.toString(),
      mood,
      energy,
      created_at: date.toISOString(),
    });
  }

  return logs;
}

export function generateSampleWorkoutLogs() {
  const workouts = [
    { name: 'Morning Run', id: 'run' },
    { name: 'Strength Training', id: 'strength' },
    { name: 'Yoga Session', id: 'yoga' },
    { name: 'Cycling', id: 'cycling' },
    { name: 'Swimming', id: 'swimming' },
  ];

  const notes = [
    'Felt great today!',
    'A bit tired but pushed through',
    'New personal record!',
    'Need to improve form',
    'Really enjoyed this session',
    '',
  ];

  const logs = [];
  const today = new Date();
  const numLogs = 12;

  for (let i = numLogs - 1; i >= 0; i--) {
    const daysAgo = Math.floor(i * 2.5);
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);

    const workout = workouts[Math.floor(Math.random() * workouts.length)];
    const note = notes[Math.floor(Math.random() * notes.length)];

    logs.push({
      workout_name: workout.name,
      workout_id: workout.id,
      notes: note || undefined,
      created_at: date.toISOString(),
    });
  }

  return logs.sort((a, b) =>
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
}

export function loadAllSampleData() {
  const tasksStore = useTasksStore.getState();
  const habitsStore = useHabitsStore.getState();
  const weightLogsStore = useWeightLogsStore.getState();
  const workoutLogsStore = useWorkoutLogsStore.getState();

  const tasks = generateSampleTasks();
  tasks.forEach((task, index) => {
    tasksStore.addTask(task);

    if (index < 2) {
      const addedTasks = useTasksStore.getState().tasks;
      const lastTask = addedTasks[addedTasks.length - 1];
      if (lastTask) {
        tasksStore.updateTask(lastTask.id, {
          completed: true,
          completed_at: new Date().toISOString(),
        });
      }
    }
  });

  const habits = generateSampleHabits();
  habits.forEach((habit, index) => {
    habitsStore.addHabit(habit);

    if (index < 2) {
      const addedHabits = useHabitsStore.getState().habits;
      const lastHabit = addedHabits[addedHabits.length - 1];
      if (lastHabit) {
        habitsStore.updateHabit(lastHabit.id, {
          completedToday: true,
          streak: Math.floor(Math.random() * 10) + 3,
        });
      }
    }
  });

  const weightLogs = generateSampleWeightLogs();
  weightLogs.forEach(log => {
    weightLogsStore.addWeightLog(log);
  });

  const workoutLogs = generateSampleWorkoutLogs();
  workoutLogs.forEach(log => {
    workoutLogsStore.addWorkoutLog(log);
  });

  localStorage.setItem('sample_data_loaded', 'true');

  return {
    tasksCount: tasks.length,
    habitsCount: habits.length,
    weightLogsCount: weightLogs.length,
    workoutLogsCount: workoutLogs.length,
  };
}

export function clearAllSampleData() {
  const tasksStore = useTasksStore.getState();
  const habitsStore = useHabitsStore.getState();
  const weightLogsStore = useWeightLogsStore.getState();
  const workoutLogsStore = useWorkoutLogsStore.getState();

  tasksStore.clearTasks();
  habitsStore.clearHabits();
  weightLogsStore.clearWeightLogs();
  workoutLogsStore.clearWorkoutLogs();

  localStorage.removeItem('sample_data_loaded');
}

export function hasSampleData(): boolean {
  return localStorage.getItem('sample_data_loaded') === 'true';
}

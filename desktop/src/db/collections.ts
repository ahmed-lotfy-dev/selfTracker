export { useCollections } from '@/components/Provider/CollectionsContext';

// Internal storage for collections set by provider

// Export variables that will be updated when provider initializes
export let taskCollection: any = null;
export let weightLogCollection: any = null;
export let workoutLogCollection: any = null;
export let expenseCollection: any = null;
export let workoutCollection: any = null;

export let userGoalCollection: any = null;
export let exerciseCollection: any = null;
export let timerSessionCollection: any = null;

// Called by CollectionsProvider to update collections
export function _setCollections(collections: any) {
  // Update all exported collections
  taskCollection = collections.tasks;
  weightLogCollection = collections.weightLogs;
  workoutLogCollection = collections.workoutLogs;
  expenseCollection = collections.expenses;
  workoutCollection = collections.workouts;

  userGoalCollection = collections.userGoals;
  exerciseCollection = collections.exercises;
  timerSessionCollection = collections.timerSessions;
}

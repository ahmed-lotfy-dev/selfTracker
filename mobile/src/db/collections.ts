// Re-export for components that want to use the hook pattern
export { useCollections } from '@/src/components/Provider/CollectionsProvider';

// Internal storage for collections set by provider
let _collections: any = null;

// Export variables that will be updated when provider initializes
export let taskCollection: any = null;
export let weightLogCollection: any = null;
export let workoutLogCollection: any = null;
export let expenseCollection: any = null;
export let workoutCollection: any = null;
export let projectCollection: any = null;
export let userGoalCollection: any = null;
export let exerciseCollection: any = null;

// Called by CollectionsProvider to update collections
export function _setCollections(collections: any) {
  _collections = collections;

  // Update all exported collections
  taskCollection = collections.tasks;
  weightLogCollection = collections.weightLogs;
  workoutLogCollection = collections.workoutLogs;
  expenseCollection = collections.expenses;
  workoutCollection = collections.workouts;
  projectCollection = collections.projects;
  userGoalCollection = collections.userGoals;
  exerciseCollection = collections.exercises;
}

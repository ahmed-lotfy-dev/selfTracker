import { createContext, useContext } from 'react';

type Collections = {
  tasks: any;
  weightLogs: any;
  workoutLogs: any;
  expenses: any;
  workouts: any;
  userGoals: any;
  exercises: any;
  timerSessions: any;
  habits: any;
} | null;

export const CollectionsContext = createContext<Collections>(null);

export function useCollections() {
  return useContext(CollectionsContext);
}

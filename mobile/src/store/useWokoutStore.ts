import { create } from "zustand"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { persist, createJSONStorage } from "zustand/middleware"
import { WorkoutType } from "@/src/types/workoutType"

type WorkoutLogState = {
  selectedWorkout: WorkoutType | null
}

type WorkoutLogActions = {
  setSelectedWorkout: (log: WorkoutType | null) => void
}

type WorkoutLogStore = WorkoutLogState & WorkoutLogActions

export const useWorkoutLogStore = create<WorkoutLogStore>()(
  persist(
    (set) => ({
      selectedWorkout: null,
      setSelectedWorkout: (log: WorkoutType | null) =>
        set({ selectedWorkout: log }),
    }),
    {
      name: "selected-workout-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)

export const useSelectedWorkout = () =>
  useWorkoutLogStore((state) => state.selectedWorkout)

export const useWorkoutActions = () => {
  const setSelectedWorkout = useWorkoutLogStore(
    (state) => state.setSelectedWorkout
  )
  return { setSelectedWorkout }
}

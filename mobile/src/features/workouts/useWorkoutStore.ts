import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { WorkoutLogType } from "@/src/types/workoutLogType"

type WorkoutLogState = {
  selectedWorkout: WorkoutLogType | null
}

type WorkoutLogActions = {
  setSelectedWorkout: (log: WorkoutLogType | null) => void
}

type WorkoutLogStore = WorkoutLogState & WorkoutLogActions

export const useWorkoutLogStore = create<WorkoutLogStore>()(
  persist(
    (set) => ({
      selectedWorkout: null,
      setSelectedWorkout: (log: WorkoutLogType | null) =>
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

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { WorkoutLogType } from "@/src/types/workoutLogType"
import { secureStorage } from "@/src/lib/storage"

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
      storage: createJSONStorage(() => secureStorage),
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

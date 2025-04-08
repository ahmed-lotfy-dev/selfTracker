import { create } from "zustand"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { persist, createJSONStorage } from "zustand/middleware"
import { WeightType } from "@/types/weightType" // update path if needed

type WeightLogState = {
  selectedWeight: WeightType | null
}

type WeightLogActions = {
  setSelectedWeight: (log: WeightType | null) => void
}

type WeightLogStore = WeightLogState & WeightLogActions

// Zustand store for managing selected weight
export const useWeightLogStore = create<WeightLogStore>()(
  persist(
    (set) => ({
      selectedWeight: null,
      setSelectedWeight: (log: WeightType | null) =>
        set({ selectedWeight: log }),
    }),
    {
      name: "selected-weight-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)

// Custom hook to get selected weight
export const useSelectedWeight = () => {
  return useWeightLogStore((state) => state.selectedWeight)
}

// Custom hook to get actions related to selected weight
export const useWeightActions = () => {
  const setSelectedWeight = useWeightLogStore(
    (state) => state.setSelectedWeight
  )
  return { setSelectedWeight }
}

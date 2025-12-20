import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { WeightLogType } from "@/src/types/weightLogType"
import { secureStorage } from "@/src/lib/storage"

type WeightLogState = {
  selectedWeight: WeightLogType | null
}

type WeightLogActions = {
  setSelectedWeight: (log: WeightLogType | null) => void
}

type WeightLogStore = WeightLogState & WeightLogActions

export const useWeightLogStore = create<WeightLogStore>()(
  persist(
    (set) => ({
      selectedWeight: null,
      setSelectedWeight: (log: WeightLogType | null) =>
        set({ selectedWeight: log }),
    }),
    {
      name: "selected-weight-storage",
      storage: createJSONStorage(() => secureStorage),
    }
  )
)

export const useSelectedWeight = () => {
  return useWeightLogStore((state) => state.selectedWeight)
}

export const useWeightActions = () => {
  const setSelectedWeight = useWeightLogStore(
    (state) => state.setSelectedWeight
  )
  return { setSelectedWeight }
}

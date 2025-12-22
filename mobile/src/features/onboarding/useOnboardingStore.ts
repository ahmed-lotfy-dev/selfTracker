import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { secureStorage } from "@/src/lib/storage"

type State = {
  isOnboarding: boolean
  hasHydrated: boolean
  setIsOnboarding: (v: boolean) => void
  setHasHydrated: (v: boolean) => void
}

export const useOnboardingStore = create<State>()(
  persist(
    (set) => ({
      isOnboarding: true, // default until rehydrated
      hasHydrated: false,
      setIsOnboarding: (v) => set({ isOnboarding: v }),
      setHasHydrated: (v) => set({ hasHydrated: v }),
    }),
    {
      name: "onboarding",
      storage: createJSONStorage(() => secureStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)

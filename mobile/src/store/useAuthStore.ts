import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { secureStorage } from "@/src/lib/storage"

type AuthState = {
  user: any | null
  hasHydrated: boolean
}

type AuthActions = {
  setUser: (user: any) => void
  setHasHydrated: (hydrated: boolean) => void
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // ... state
      user: null,
      hasHydrated: false,
      setUser: (user) => set({ user }),
      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => secureStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)

export const useUser = () => useAuthStore((state) => state.user)
export const useHasHydrated = () => useAuthStore((state) => state.hasHydrated)

export const useAuthActions = () => {
  const setUser = useAuthStore((state) => state.setUser)
  return { setUser }
}

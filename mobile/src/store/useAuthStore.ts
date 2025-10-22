import { create } from "zustand"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { persist, createJSONStorage } from "zustand/middleware"

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
      user: null,
      hasHydrated: false,
      setUser: (user) => set({ user }),
      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
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

import { create } from "zustand"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { persist, createJSONStorage } from "zustand/middleware"

type AuthState = {
  user: any | null
}

type AuthActions = {
  setUser: (user: any) => void
}

type AuthStore = AuthState & AuthActions

const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)

export const useUser = () => useAuthStore((state) => state.user)

export const useAuthActions = () => {
  const setUser = useAuthStore((state) => state.setUser)

  return { setUser }
}

import { create } from "zustand"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { persist, createJSONStorage } from "zustand/middleware"

type AuthState = {
  user: any | null
}

type AuthActions = {
  setUser: (user: any) => void
  logout: () => Promise<void>
}

type AuthStore = AuthState & AuthActions

const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      setUser: (user) => set({ user }),

      logout: async () => {
        await AsyncStorage.multiRemove(["accessToken", "refreshToken"])
        set({ user: null })
      },
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
  const logout = useAuthStore((state) => state.logout)

  return { setUser, logout }
}

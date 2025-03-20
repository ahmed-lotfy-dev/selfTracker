import { create } from "zustand"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { persist, createJSONStorage } from "zustand/middleware"
import { UserType } from "@/types/userType"

// Define the state and actions
type AuthState = {
  user: UserType | null
  accessToken: string | null
  refreshToken: string | null
}

type AuthActions = {
  setUser: (user: UserType) => void
  setTokens: (accessToken: string, refreshToken?: string) => Promise<void>
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

      setTokens: async (accessToken, refreshToken) => {
        await AsyncStorage.multiSet([
          ["accessToken", accessToken],
          ["refreshToken", refreshToken || ""],
        ])
        set({ accessToken, refreshToken })
      },

      logout: async () => {
        await AsyncStorage.multiRemove(["accessToken", "refreshToken"])
        set({ user: null, accessToken: null, refreshToken: null })
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage), 
    }
  )
)

export const useAccessToken = () => useAuthStore((state) => state.accessToken)
export const useRefreshToken = () => useAuthStore((state) => state.refreshToken)
export const useUser = () => useAuthStore((state) => state.user)

export const useAuthActions = () => {
  const setUser = useAuthStore((state) => state.setUser)
  const setTokens = useAuthStore((state) => state.setTokens)
  const logout = useAuthStore((state) => state.logout)

  return { setUser, setTokens, logout }
}

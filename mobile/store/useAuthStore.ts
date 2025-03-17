import { create } from "zustand"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { persist, createJSONStorage } from "zustand/middleware"
import { UserType } from "@/types/userType"

type AuthState = {
  user: UserType | null
  accessToken: string | null
  refreshToken: string | null
  setUser: (user: UserType) => void
  setTokens: (accessToken: string, refreshToken?: string) => Promise<void>
  logout: () => Promise<void>
  loadRefreshToken: () => Promise<void>
}

const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,

  setUser: (user) => set({ user }),

  setTokens: async (accessToken, refreshToken) => {
    console.log("Setting tokens:", { accessToken, refreshToken }) // Log tokens for debugging
    set({ accessToken })
    if (refreshToken) {
      await AsyncStorage.setItem("refreshToken", refreshToken)
      set({ refreshToken })
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem("refreshToken")
    set({ user: null, accessToken: null, refreshToken: null })
  },

  loadRefreshToken: async () => {
    const storedRefreshToken = await AsyncStorage.getItem("refreshToken")
    if (storedRefreshToken) {
      set({ refreshToken: storedRefreshToken })
    }
  },
}))

export default useAuthStore

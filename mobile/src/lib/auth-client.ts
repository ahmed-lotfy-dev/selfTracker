import { createAuthClient } from "better-auth/react"
import { expoClient } from "@better-auth/expo/client"
import * as SecureStore from "expo-secure-store"
import { oneTapClient } from "better-auth/client/plugins"
import { API_BASE_URL } from "./api/config"
import { Platform } from "react-native"
import { emailOTPClient } from "better-auth/client/plugins"

// Define a web-compatible storage object
const webStorage = {
  getItem: (key: string) => {
    if (typeof localStorage !== "undefined") {
      return localStorage.getItem(key)
    }
    return null
  },
  setItem: (key: string, value: string) => {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(key, value)
    }
  },
  deleteItem: (key: string) => {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(key)
    }
  },
}

export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
  plugins: [
    expoClient({
      scheme: "selftracker",
      storagePrefix: "selftracker",
      storage: Platform.OS === "web" ? webStorage : SecureStore,
    }),
    emailOTPClient(),
  ],
})

import { createAuthClient } from "better-auth/react"
import { expoClient } from "@better-auth/expo/client"
import * as SecureStore from "expo-secure-store"
import { oneTapClient } from "better-auth/client/plugins"
import { API_BASE_URL } from "./api/config"
import { Platform } from "react-native"
import { getAccessToken, setAccessToken } from "./storage"
import { inferAdditionalFields } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
  plugins: [
    expoClient({
      scheme: "selftracker",
      storagePrefix: "selftracker",
      storage: {
        setItem(key, value) {
          if (Platform.OS === "web") {
            localStorage.setItem(key, value)
          } else {
            SecureStore.setItem(key, value)
          }
        },
        getItem(key) {
          if (Platform.OS === "web") {
            return localStorage.getItem(key)
          } else {
            return SecureStore.getItem(key) as any
          }
        },
      },
    }),
  ],
})

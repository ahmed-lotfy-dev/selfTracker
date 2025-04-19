import { createAuthClient } from "better-auth/react"
import { expoClient } from "@better-auth/expo/client"
import * as SecureStore from "expo-secure-store"

export const authClient = createAuthClient({
baseURL: "http://192.168.1.16:5000",
  plugins: [
    expoClient({
      scheme: "selftracker",
      storagePrefix: "selftracker",
      storage: SecureStore,
    }),
  ],
})

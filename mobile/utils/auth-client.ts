import { createAuthClient } from "better-auth/react"
import { expoClient } from "@better-auth/expo/client"
import * as SecureStore from "expo-secure-store"
import { oneTapClient } from "better-auth/client/plugins"
import { API_BASE_URL } from "./api/config"

export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
  plugins: [
    expoClient({
      scheme: "selftracker",
      storagePrefix: "selftracker",
      storage: SecureStore,
    }),
  ],
})

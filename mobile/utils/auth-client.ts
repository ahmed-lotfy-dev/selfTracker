import { createAuthClient } from "better-auth/react"
import { expoClient } from "@better-auth/expo/client"
import * as SecureStore from "expo-secure-store"

export const authClient = createAuthClient({
  baseURL: "http://localhost:5000" /* Base URL of your Better Auth backend. */,
  plugins: [
    expoClient({
      scheme: "selftracker",
      storagePrefix: "selftracker",
      storage: SecureStore,
    }),
  ],
  trustedOrigins: ["selftracker://", "http://localhost:8081"],
})

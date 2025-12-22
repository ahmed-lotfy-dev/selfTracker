import { createAuthClient } from "better-auth/react"
import { expoClient } from "@better-auth/expo/client"
import { oneTapClient } from "better-auth/client/plugins"
import { API_BASE_URL, AUTH_SCHEME } from "./api/config"
import { emailOTPClient } from "better-auth/client/plugins"
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
  plugins: [
    expoClient({
      scheme: AUTH_SCHEME,
      storagePrefix: "selftracker",
      storage: SecureStore,
    }),
    emailOTPClient(),
  ],
})

import { createAuthClient } from "better-auth/react"
import { expoClient } from "@better-auth/expo/client"
import { oneTapClient } from "better-auth/client/plugins"
import { API_BASE_URL } from "./api/config"
import { emailOTPClient } from "better-auth/client/plugins"
import * as SecureStore from "expo-secure-store"

const betterAuthStorage = {
  getItem: async (key: string) => await SecureStore.getItemAsync(key),
  setItem: async (key: string, value: string) => await SecureStore.setItemAsync(key, value),
  removeItem: async (key: string) => await SecureStore.deleteItemAsync(key),
};

export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
  plugins: [
    expoClient({
      scheme: "selftracker",
      storagePrefix: "selftracker",
      storage: betterAuthStorage as any,
    }),
    emailOTPClient(),
  ],
})

import { createAuthClient } from "better-auth/react"
import { emailOTPClient } from "better-auth/client/plugins"
import { API_BASE_URL } from "./api/config"

export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
  plugins: [emailOTPClient()],
})

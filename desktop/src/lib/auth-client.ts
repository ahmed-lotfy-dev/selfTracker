import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_BACKEND_URL || (import.meta.env.PROD ? "https://selftracker.ahmedlotfy.site" : "http://localhost:8000"),
  fetchOptions: {
    auth: {
      type: "Bearer",
      token: () => localStorage.getItem("bearer_token") || "",
    },
    onResponse: (context) => {
      // Better-auth returns the session token in headers or as part of sign-in response
      // When using the 'bearer' plugin, it often includes it in the set-cookie or as a token field
      const token = context.response.headers.get("Authorization")?.replace("Bearer ", "");
      if (token) {
        localStorage.setItem("bearer_token", token);
      }
    }
  },
})

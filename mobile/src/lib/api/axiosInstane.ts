import axios from "axios"
import { router } from 'expo-router';
import { API_BASE_URL } from "./config"
import { authClient } from "../auth-client"
import * as SecureStore from "expo-secure-store"

/**
 * Axios instance configured for better-auth session-based authentication.
 * 
 * Better-auth uses HTTP-only session cookies for authentication, not JWT tokens.
 * The authClient.$fetch method automatically handles session cookies.
 * 
 * For API calls that need authentication:
 * - Use authClient.$fetch() directly for better-auth endpoints
 * - Use this axios instance for other endpoints (it will include cookies)
 */
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // Important: Send cookies with requests
})

// Better-auth handles session cookies automatically
axiosInstance.interceptors.request.use(
  async (config) => {
    // Attempt to get token from SecureStore for independent axios requests
    try {
      // Better Auth uses this key for the session token in SecureStore (when using expoClient)
      // Retrieve tokens explicitly
      const signedCookieToken = await SecureStore.getItemAsync("auth_cookie_token");
      const unsignedBearerToken = await SecureStore.getItemAsync("auth_token_axios");

      // Fallback: better-auth might have stored something
      const fallbackToken = await SecureStore.getItemAsync("selftracker.better-auth.session_token");

      const cookieValue = signedCookieToken || fallbackToken;
      const bearerValue = unsignedBearerToken || fallbackToken;

      // Construct a robust Cookie header with multiple potential names
      // The server might expect __Secure- prefix or just the base name depending on config
      const cookieString = [
        `better-auth.session_token=${bearerValue || cookieValue}`,
        `__Secure-better-auth.session_token=${bearerValue || cookieValue}`,
        `session_token=${bearerValue || cookieValue}`,
        `selftracker.session_token=${bearerValue || cookieValue}`
      ].join('; ');

      // Prioritize Bearer token to avoid CSRF issues with manual Cookies
      if (bearerValue) {
        config.headers.Authorization = `Bearer ${bearerValue}`;
        config.headers.Cookie = cookieString;

        console.log(`[DEBUG] Axios Headers: Bearer=YES & Cookie Set (${bearerValue.substring(0, 10)}...)`);
      } else if (cookieValue) {
        // Fallback if we only have the cookie-intended token
        config.headers.Authorization = `Bearer ${cookieValue}`;
        config.headers.Cookie = cookieString;
        console.log(`[DEBUG] Axios Headers: Bearer=YES & Cookie Set (from cookie)`);
      } else {
        console.warn("[DEBUG] Axios Request: No valid auth tokens found in SecureStore");
      }
    } catch (error) {
      console.error("Error retrieving auth token for axios", error);
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handle 401 by signing out
axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Session expired or invalid, sign out
      console.warn("Axios 401 intercepted from:", error.config.url);

      // Prevent aggressive redirects if we are already dealing with auth or just landed
      // Maybe check if we have a valid token in storage before nuking it? 
      // For now, we'll just log and proceed, but maybe we shouldn't immediately redirect if it calls /sign-in recursively?

      const currentSegments = router.canGoBack() ? "somewhere" : "root"; // rudimentary check
      // Better check: don't redirect if we are already at sign-in

      console.warn("Signing out due to 401... (DISABLED FOR DEBUGGING/SYNC STABILITY)");
      // await authClient.signOut()
      // router.replace("/(auth)/sign-in")
    }
    return Promise.reject(error)
  }
)

export default axiosInstance

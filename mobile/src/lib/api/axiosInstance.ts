import axios from "axios";
import { router } from "expo-router";
import { API_BASE_URL } from "./config";
import * as SecureStore from "expo-secure-store";
import { authClient } from "@/src/lib/auth-client"

// better-auth types are incomplete for Expo/RN, cast as needed
const auth = authClient as any

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Request interceptor — attach token
axiosInstance.interceptors.request.use(
  async (config) => {
    let token = await SecureStore.getItemAsync("selftracker.session_token");
    if (!token) {
      token = await SecureStore.getItemAsync(
        "selftracker.better-auth.session_token",
      );
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn(`[Axios] ⚠️ No token found for request to ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error("[Axios] ❌ Request Error:", error);
    return Promise.reject(error);
  },
);

// Track if we're currently refreshing to avoid multiple refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor — refresh token on 401, then retry
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: any) => {
    const originalRequest = error.config;

    // Only attempt refresh on 401, and avoid infinite loops
    if (error.response?.status !== 401 || originalRequest._retry) {
      console.error(
        `[Axios] ❌ Response Error for ${originalRequest?.url}:`,
        error.message,
        error.response?.status,
      );
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue the request while refreshing
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axiosInstance(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    console.log("[Axios] 🔑 Token expired, attempting refresh...");

    try {
      // Use better-auth's built-in session refresh
      const { data: session, error: refreshError } = await auth.getSession();

      if (refreshError || !session?.session?.token) {
        console.error("[Axios] ❌ Token refresh failed:", refreshError);
        processQueue(refreshError, null);
        // Clear stored tokens — user needs to log in again
        await SecureStore.deleteItemAsync("selftracker.session_token");
        await SecureStore.deleteItemAsync(
          "selftracker.better-auth.session_token",
        );
        // Navigate to login screen so user can re-authenticate
        // This prevents data loss since user can't logout without re-logging in first
        router.replace("/(auth)/sign-in");
        return Promise.reject(error);
      }

      const newToken = session.session.token;
      console.log("[Axios] ✅ Token refreshed successfully");

      // Store new token
      await SecureStore.setItemAsync("selftracker.session_token", newToken);

      // Update header and retry original request
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      processQueue(null, newToken);

      return axiosInstance(originalRequest);
    } catch (refreshErr) {
      console.error("[Axios] ❌ Token refresh exception:", refreshErr);
      processQueue(refreshErr, null);
      await SecureStore.deleteItemAsync("selftracker.session_token");
      await SecureStore.deleteItemAsync(
        "selftracker.better-auth.session_token",
      );
      router.replace("/(auth)/sign-in");
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  },
);

export default axiosInstance;

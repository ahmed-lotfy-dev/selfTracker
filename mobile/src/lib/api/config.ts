import * as Linking from "expo-linking";

// Revert to LAN IP since 10.0.2.2 failed
export const API_BASE_URL = __DEV__
  ? "http://192.168.1.5:8000"
  : (process.env.EXPO_PUBLIC_API_URL || "https://selftracker.ahmedlotfy.site");

/**
 * The scheme used for authentication redirects.
 * In development (Expo Dev Client), we use 'exp+selftracker'.
 * In production (Standalone App), we use 'selftracker'.
 */
export const AUTH_SCHEME = __DEV__ ? "exp+selftracker" : "selftracker";




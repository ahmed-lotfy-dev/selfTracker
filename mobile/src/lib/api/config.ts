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
export const AUTH_SCHEME = "exp+selftracker";


/**
 * Constructs the OAuth authorization URL for a given provider.
 * 
 * @param provider - The OAuth provider (e.g., 'google', 'github')
 * @returns The full OAuth authorization URL
 */
export function getOAuthUrl(provider: 'google' | 'github'): string {
  // use "auth" instead of "/auth" to prevent triple slashes if scheme handles the separator
  const callbackUrl = Linking.createURL("auth", { scheme: AUTH_SCHEME });

  console.log("[Auth] Generated Callback URL:", callbackUrl);

  // Better-auth OAuth social signin endpoint
  return `${API_BASE_URL}/api/auth/sign-in/social/${provider}?callbackURL=${encodeURIComponent(callbackUrl)}`;
}

import * as Linking from "expo-linking"

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL

/**
 * Constructs the OAuth authorization URL for a given provider.
 * 
 * @param provider - The OAuth provider (e.g., 'google', 'github')
 * @returns The full OAuth authorization URL
 */
export function getOAuthUrl(provider: 'google' | 'github'): string {
  const callbackUrl = Linking.createURL("/auth")
  // Better-auth OAuth social signin endpoint
  return `${API_BASE_URL}/api/auth/sign-in/social/${provider}?callbackURL=${encodeURIComponent(callbackUrl)}`;
}

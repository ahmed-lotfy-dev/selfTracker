export const API_BASE_URL = __DEV__
  ? "http://192.168.1.5:8000"
  : "https://selftracker.ahmedlotfy.site"

/**
 * Constructs the OAuth authorization URL for a given provider.
 * 
 * @param provider - The OAuth provider (e.g., 'google', 'github')
 * @returns The full OAuth authorization URL
 */
export function getOAuthUrl(provider: 'google' | 'github'): string {
  const callbackUrl = 'selftracker://auth';
  // Better-auth OAuth social signin endpoint
  return `${API_BASE_URL}/api/auth/sign-in/social/${provider}?callbackURL=${encodeURIComponent(callbackUrl)}`;
}

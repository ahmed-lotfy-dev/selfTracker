import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { authClient } from '@/src/lib/auth-client';
import { useToast } from '@/src/hooks/useToast';

/**
 * Social login buttons component providing Google and GitHub OAuth authentication.
 * 
 * Uses better-auth client API to handle OAuth flow. The authClient.signIn.social()
 * method automatically opens the browser with the correct OAuth URL and handles
 * the redirect back to the app via deep link.
 * 
 * Per better-auth expo docs, the callback URL is a relative path that gets
 * automatically converted to a deep link (e.g., "/auth" becomes "selftracker://auth")
 * 
 * Features:
 * - Google Sign In with brand colors
 * - GitHub Sign In with brand colors
 * - Loading states for each provider
 * - Error handling with user feedback
 * - Responsive layout
 */

type OAuthProvider = 'google' | 'github';

interface SocialLoginButtonsProps {
  /** Optional className for styling the container */
  className?: string;
}

export function SocialLoginButtons({ className }: SocialLoginButtonsProps) {
  const { showToast } = useToast();

  /**
   * Handles social login using better-auth client API.
   * 
   * Flow:
   * 1. Opens OAuth provider's authorization URL in the browser
   * 2. User authenticates on the provider's website
   * 3. Provider redirects to backend OAuth callback
   * 4. Backend redirects to /api/social-success with session
   * 5. /api/social-success redirects to selftracker://auth?token=...
   * 6. Deep link opens the app and useDeepLinkHandler processes the token
   * 
   * Note: Using /api/social-success as callback (same as desktop implementation)
   * since the expo plugin's automatic deep link conversion isn't working in this setup.
   */
  const handleSocialLogin = async (provider: OAuthProvider) => {
    try {
      console.log(`Initiating ${provider} OAuth flow...`);

      // Use full URL for callback (better-auth requires this for mobile)
      const backendUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

      await authClient.signIn.social({
        provider,
        callbackURL: `${backendUrl}/api/social-success`,
      });

      console.log(`${provider} OAuth initiated - will redirect via /api/social-success`);

    } catch (error) {
      console.error(`Error during ${provider} OAuth:`, error);
      showToast(`Failed to sign in with ${provider}`, 'error');
    }
  };

  return (
    <View className={`gap-3 ${className || ''}`}>
      {/* Google Sign In */}
      <Pressable
        onPress={() => handleSocialLogin('google')}
        className="flex-row items-center justify-center border border-gray-300 rounded-md px-4 py-3 bg-white active:bg-gray-50"
      >
        <AntDesign name="google" size={20} color="#4285F4" />
        <Text className="ml-3 text-gray-700 font-medium">
          Sign in with Google
        </Text>
      </Pressable>

      {/* GitHub Sign In */}
      <Pressable
        onPress={() => handleSocialLogin('github')}
        className="flex-row items-center justify-center border border-gray-300 rounded-md px-4 py-3 bg-white active:bg-gray-50"
      >
        <AntDesign name="github" size={20} color="#333" />
        <Text className="ml-3 text-gray-700 font-medium">
          Sign in with GitHub
        </Text>
      </Pressable>
    </View>
  );
}

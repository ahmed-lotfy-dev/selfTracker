import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { authClient } from '@/src/lib/auth-client';
import { useToast } from '@/src/hooks/useToast';
import { useThemeColors } from '@/src/constants/Colors';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';

/**
 * Social login buttons component providing Google and GitHub OAuth authentication.
 */

type OAuthProvider = 'google' | 'github';

interface SocialLoginButtonsProps {
  className?: string;
}

export function SocialLoginButtons({ className }: SocialLoginButtonsProps) {
  const [isSigningIn, setIsSigningIn] = React.useState<string | null>(null);
  const { showToast } = useToast();
  const colors = useThemeColors();

  const handleSocialLogin = async (provider: OAuthProvider) => {
    if (isSigningIn) return;
    setIsSigningIn(provider);

    try {

      const callbackURL = Linking.createURL("callback");

      const result = await authClient.signIn.social({
        provider,
        callbackURL,
      });


      if (result.data) {
      }

      if (result.error) {
        console.error('[SOCIAL LOGIN] ❌ Error from authClient:', result.error);
        showToast(`OAuth error: ${result.error.message || 'Unknown'}`, 'error');
      }
    } catch (error: any) {
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error(`[SOCIAL LOGIN] ❌ EXCEPTION during ${provider} OAuth:`);
      console.error('[SOCIAL LOGIN] Error name:', error.name);
      console.error('[SOCIAL LOGIN] Error message:', error.message);
      console.error('[SOCIAL LOGIN] Error stack:', error.stack);
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      showToast(`Failed to sign in with ${provider}: ${error.message}`, 'error');
    } finally {
      setIsSigningIn(null);
    }
  };

  return (
    <View className={`gap-3 ${className || ''}`}>
      {/* Google Sign In */}
      <Pressable
        onPress={() => handleSocialLogin('google')}
        disabled={!!isSigningIn}
        className={`flex-row items-center justify-center border border-border rounded-2xl px-4 py-4 bg-card active:bg-gray-50/50 dark:active:bg-emerald-900/10 shadow-sm ${isSigningIn === 'google' ? 'opacity-50' : ''}`}
      >
        <AntDesign name="google" size={20} color={colors.socialGoogle} />
        <Text className="ml-3 text-text font-semibold">
          {isSigningIn === 'google' ? 'Signing in...' : 'Sign in with Google'}
        </Text>
      </Pressable>

      {/* GitHub Sign In */}
      <Pressable
        onPress={() => handleSocialLogin('github')}
        disabled={!!isSigningIn}
        className={`flex-row items-center justify-center border border-border rounded-2xl px-4 py-4 bg-card active:bg-gray-50/50 dark:active:bg-emerald-900/10 shadow-sm ${isSigningIn === 'github' ? 'opacity-50' : ''}`}
      >
        <AntDesign name="github" size={20} color={colors.socialGithub} />
        <Text className="ml-3 text-text font-semibold">
          {isSigningIn === 'github' ? 'Signing in...' : 'Sign in with GitHub'}
        </Text>
      </Pressable>
    </View>
  );
}

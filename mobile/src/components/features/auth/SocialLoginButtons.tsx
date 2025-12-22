import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { authClient } from '@/src/lib/auth-client';
import { useToast } from '@/src/hooks/useToast';
import { useThemeColors } from '@/src/constants/Colors';
import Constants from 'expo-constants';

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
      console.log(`[SOCIAL LOGIN] Starting ${provider} login`);
      console.log(`[SOCIAL LOGIN] Execution Environment: ${Constants.executionEnvironment}`);

      const result = await authClient.signIn.social({
        provider,
        callbackURL: "/callback",
      });

      console.log(`[SOCIAL LOGIN] ${provider} result:`, JSON.stringify(result));
    } catch (error: any) {
      console.error(`Error during ${provider} OAuth:`, error);
      showToast(`Failed to sign in with ${provider}`, 'error');
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

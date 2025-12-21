import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { authClient } from '@/src/lib/auth-client';
import { AUTH_SCHEME } from '@/src/lib/api/config';
import { useToast } from '@/src/hooks/useToast';
import { useThemeColors } from '@/src/constants/Colors';
import * as Linking from 'expo-linking';

/**
 * Social login buttons component providing Google and GitHub OAuth authentication.
 */

type OAuthProvider = 'google' | 'github';

interface SocialLoginButtonsProps {
  className?: string;
}

export function SocialLoginButtons({ className }: SocialLoginButtonsProps) {
  const { showToast } = useToast();
  const colors = useThemeColors();

  const handleSocialLogin = async (provider: OAuthProvider) => {
    try {
      await authClient.signIn.social({
        provider: provider,
        callbackURL: Linking.createURL("auth", { scheme: AUTH_SCHEME }),
      });
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
        className="flex-row items-center justify-center border border-border rounded-2xl px-4 py-4 bg-card active:bg-gray-50/50 dark:active:bg-emerald-900/10 shadow-sm"
      >
        <AntDesign name="google" size={20} color={colors.socialGoogle} />
        <Text className="ml-3 text-text font-semibold">
          Sign in with Google
        </Text>
      </Pressable>

      {/* GitHub Sign In */}
      <Pressable
        onPress={() => handleSocialLogin('github')}
        className="flex-row items-center justify-center border border-border rounded-2xl px-4 py-4 bg-card active:bg-gray-50/50 dark:active:bg-emerald-900/10 shadow-sm"
      >
        <AntDesign name="github" size={20} color={colors.socialGithub} />
        <Text className="ml-3 text-text font-semibold">
          Sign in with GitHub
        </Text>
      </Pressable>
    </View>
  );
}

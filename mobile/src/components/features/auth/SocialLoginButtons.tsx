import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { authClient } from '@/src/lib/auth-client';
import { useToast } from '@/src/hooks/useToast';
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

  const handleSocialLogin = async (provider: OAuthProvider) => {
    try {
      console.log(`Initiating ${provider} OAuth flow...`);

      // Explicitly generate the callback URL based on the current environment
      // This handles Expo Go (exp://), Dev Client (scheme://), and Production
      // It typically generates something like exp://192.168.1.5:8081/--/auth or selftracker://auth
      const callbackURL = Linking.createURL('/auth');

      console.log(`[DEBUG] Generated Callback URL: ${callbackURL}`);

      await authClient.signIn.social({
        provider,
        callbackURL, // Pass the absolute URL
      });

      console.log(`${provider} OAuth initiated`);

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
        <AntDesign name="google" size={20} className="text-socialGoogle" />
        <Text className="ml-3 text-text font-semibold">
          Sign in with Google
        </Text>
      </Pressable>

      {/* GitHub Sign In */}
      <Pressable
        onPress={() => handleSocialLogin('github')}
        className="flex-row items-center justify-center border border-border rounded-2xl px-4 py-4 bg-card active:bg-gray-50/50 dark:active:bg-emerald-900/10 shadow-sm"
      >
        <AntDesign name="github" size={20} className="text-socialGithub" />
        <Text className="ml-3 text-text font-semibold">
          Sign in with GitHub
        </Text>
      </Pressable>
    </View>
  );
}

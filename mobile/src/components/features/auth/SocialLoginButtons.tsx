import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { authClient } from '@/src/lib/auth-client';
import { AUTH_SCHEME } from '@/src/lib/api/config';
import { useToast } from '@/src/hooks/useToast';
import { useThemeColors } from '@/src/constants/Colors';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

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
      const callbackURL = Linking.createURL("callback", { scheme: AUTH_SCHEME });

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`[SOCIAL LOGIN] Starting ${provider} login`);
      console.log('[SOCIAL LOGIN] Callback URL:', callbackURL);
      console.log('[SOCIAL LOGIN] AUTH_SCHEME:', AUTH_SCHEME);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      const result = await authClient.signIn.social({
        provider: provider,
        callbackURL: callbackURL,
      });

      console.log(`[SOCIAL LOGIN] ${provider} result:`, JSON.stringify(result));

      // @ts-ignore - The result structure can vary depending on the auth flow
      const responseData = result?.data;
      // @ts-ignore
      const redirectUrl = responseData?.url || result?.url;

      if (redirectUrl) {
        console.log('[SOCIAL LOGIN] Opening Auth Session:', redirectUrl);
        // Use WebBrowser.openAuthSessionAsync to capture the redirect back to the app
        const authResult = await WebBrowser.openAuthSessionAsync(redirectUrl, callbackURL);
        console.log('[SOCIAL LOGIN] Auth Session Result:', JSON.stringify(authResult));

        if (authResult.type === 'success' && authResult.url) {
          console.log('[SOCIAL LOGIN] Success! Redirecting inside app:', authResult.url);
          // Manually trigger the internal redirect
          await Linking.openURL(authResult.url);
        } else if (authResult.type === 'cancel') {
          console.log('[SOCIAL LOGIN] User cancelled login');
        } else {
          console.log('[SOCIAL LOGIN] Auth session finished with type:', authResult.type);
        }
      }

      console.log(`[SOCIAL LOGIN] ${provider} signIn.social completed`);
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

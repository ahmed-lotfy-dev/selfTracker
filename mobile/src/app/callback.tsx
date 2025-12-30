import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuthActions, useAuthStore } from '@/src/features/auth/useAuthStore';
import { useToast } from '@/src/hooks/useToast';
import { useAuth } from '@/src/features/auth/useAuthStore';
import { authClient } from '@/src/lib/auth-client';
import * as SecureStore from 'expo-secure-store';
import { useThemeColors } from '@/src/constants/Colors';

export default function AuthCallback() {
  const params = useLocalSearchParams();
  const { loginWithToken } = useAuthActions();
  const { showToast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const colors = useThemeColors();


  useEffect(() => {
    const handleAuth = async () => {

      try {
        // Use better-auth's session management instead of manual cookie parsing!

        const { data: session, error } = await authClient.getSession();

        if (error) {
          console.error('[AUTH CALLBACK] ❌ Session fetch error:', error);
          throw new Error(`Session fetch failed: ${error.message}`);
        }

        if (!session?.session?.token) {
          console.error('[AUTH CALLBACK] ❌ No session token in response');
          throw new Error("No session token found after OAuth");
        }

        const token = session.session.token;

        // Save session directly - we already have all the data from authClient!
        await SecureStore.setItemAsync("selftracker.session_token", token);
        useAuthStore.setState({ user: session.user, token, isLoading: false });

        showToast(`Welcome back, ${session.user?.name?.split(" ")[0]}!`, "success");

        // Navigate immediately to avoid flickering
        router.replace('/home');
      } catch (err: any) {
        console.error("[AuthCallback] Login failed:", err.message);
        showToast(`Login Failed: ${err.message}`, "error");
        router.replace('/sign-in');
      }
    };

    handleAuth();
  }, [params]);

  // Branded loading screen with SelfTracker theme
  return (
    <View className="flex-1 justify-center items-center bg-background p-6">
      <Image
        source={require('@/assets/images/icon.png')}
        className="w-30 h-30 mb-10 rounded-3xl"
      />

      <ActivityIndicator
        size="large"
        color={colors.primary}
        className="my-6"
      />

      <Text className="text-xl font-semibold mt-4 text-center text-text">
        Setting up your account
      </Text>

      <Text className="text-base mt-2 text-center font-normal text-placeholder">
        Securing your session...
      </Text>
    </View>
  );
}

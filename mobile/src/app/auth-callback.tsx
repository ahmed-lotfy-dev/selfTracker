import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthActions, useAuthStore } from '@/src/features/auth/useAuthStore';
import { useToast } from '@/src/hooks/useToast';
import { queryClient } from '@/src/lib/react-query';

export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { setUser, setToken, loginWithToken } = useAuthActions();
  const { showToast } = useToast();

  useEffect(() => {
    const handleAuth = async () => {
      // 1. Extract Token
      let token = params.token as string;

      // Fallback: Check cookie param for session_token
      if (!token && params.cookie) {
        const cookieString = Array.isArray(params.cookie) ? params.cookie[0] : params.cookie;
        const match = cookieString.match(/__Secure-better-auth\.session_token=([^;]+)/);
        if (match && match[1]) {
          token = match[1].trim();
        }
      }

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('[AUTH CALLBACK] Token from backend:', token);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      if (!token) {
        return;
      }

      try {
        // Use centralized store action - ONE SOURCE OF TRUTH
        const success = await loginWithToken(token);

        if (success) {
          const user = useAuthStore.getState().user;
          showToast(`Welcome back, ${user?.name?.split(" ")[0]}!`, "success");

          // Invalidate queries to trigger data refetch
          await queryClient.invalidateQueries({ queryKey: ['session'] });
          await queryClient.invalidateQueries({ queryKey: ['userHomeData'] });
          await queryClient.invalidateQueries({ queryKey: ['tasks'] });
          await queryClient.invalidateQueries({ queryKey: ['weights'] });
          await queryClient.invalidateQueries({ queryKey: ['workouts'] });

          // Navigate home - use setTimeout to ensure navigation is ready
          setTimeout(() => {
            router.replace("/(drawer)/(tabs)/home" as any);
          }, 100);
        } else {
          throw new Error("Failed to verify session token");
        }

      } catch (err: any) {
        console.error("[AuthCallback] Login failed:", err.message);
        showToast(`Login Failed: ${err.message}`, "error");
        setTimeout(() => {
          router.replace("/(auth)/sign-in" as any);
        }, 100);
      }
    };

    handleAuth();
  }, [params]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <ActivityIndicator size="large" color="#000" />
      <Text style={{ marginTop: 20 }}>Verifying login...</Text>
    </View>
  );
}

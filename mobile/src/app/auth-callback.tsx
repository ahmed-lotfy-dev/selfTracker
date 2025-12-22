import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Redirect } from 'expo-router';
import { useAuthActions, useAuthStore } from '@/src/features/auth/useAuthStore';
import { useToast } from '@/src/hooks/useToast';
import { queryClient } from '@/src/lib/react-query';
import { useAuth } from '@/src/features/auth/useAuthStore';

export default function AuthCallback() {
  const params = useLocalSearchParams();
  const { loginWithToken } = useAuthActions();
  const { showToast } = useToast();
  const { isAuthenticated, user } = useAuth();

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
        } else {
          throw new Error("Failed to verify session token");
        }

      } catch (err: any) {
        console.error("[AuthCallback] Login failed:", err.message);
        showToast(`Login Failed: ${err.message}`, "error");
      }
    };

    handleAuth();
  }, [params]);

  // Redirect to home if authenticated and verified
  if (isAuthenticated && user?.emailVerified) {
    return <Redirect href="/home" />
  }

  // Redirect to verify-email if authenticated but not verified
  if (isAuthenticated && !user?.emailVerified) {
    return <Redirect href="/verify-email" />
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <ActivityIndicator size="large" color="#000" />
      <Text style={{ marginTop: 20 }}>Verifying login...</Text>
    </View>
  );
}

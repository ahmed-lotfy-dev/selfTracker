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

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('[AUTH CALLBACK] Component mounted!');
  console.log('[AUTH CALLBACK] All URL params:', JSON.stringify(params));
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

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
      console.log('[AUTH CALLBACK] All params:', params);
      console.log('[AUTH CALLBACK] Token from backend:', token);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      if (!token) {
        console.warn('[AUTH CALLBACK] No token found in params!');
        return;
      }

      try {
        console.log('[AUTH CALLBACK] Calling loginWithToken with token hash:', token.substring(0, 10) + '...');
        // Use centralized store action - ONE SOURCE OF TRUTH
        const success = await loginWithToken(token);
        console.log('[AUTH CALLBACK] loginWithToken result:', success);

        if (success) {
          const updatedUser = useAuthStore.getState().user;
          console.log('[AUTH CALLBACK] User from store after login:', JSON.stringify(updatedUser));
          showToast(`Welcome back, ${updatedUser?.name?.split(" ")[0]}!`, "success");

          // Invalidate queries to trigger data refetch
          console.log('[AUTH CALLBACK] Invalidating queries...');
          await queryClient.invalidateQueries({ queryKey: ['session'] });
          await queryClient.invalidateQueries({ queryKey: ['userHomeData'] });
          await queryClient.invalidateQueries({ queryKey: ['tasks'] });
          await queryClient.invalidateQueries({ queryKey: ['weights'] });
          await queryClient.invalidateQueries({ queryKey: ['workouts'] });
          console.log('[AUTH CALLBACK] Queries invalidated.');
        } else {
          console.error('[AUTH CALLBACK] loginWithToken returned false');
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

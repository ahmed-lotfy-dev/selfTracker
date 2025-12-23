import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Redirect } from 'expo-router';
import { useAuthActions, useAuthStore } from '@/src/features/auth/useAuthStore';
import { useToast } from '@/src/hooks/useToast';
import { queryClient } from '@/src/lib/react-query';
import { useAuth } from '@/src/features/auth/useAuthStore';
import { authClient } from '@/src/lib/auth-client';
import * as SecureStore from 'expo-secure-store';

export default function AuthCallback() {
  const params = useLocalSearchParams();
  const { loginWithToken } = useAuthActions();
  const { showToast } = useToast();
  const { isAuthenticated, user } = useAuth();


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

        await queryClient.invalidateQueries();

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

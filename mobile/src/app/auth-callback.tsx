import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useAuthActions } from '@/src/store/useAuthStore';
import { API_BASE_URL } from '@/src/lib/api/config';
import { useToast } from '@/src/hooks/useToast';
import { queryClient } from '@/src/lib/react-query';

export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { setUser, setToken } = useAuthActions();
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

      if (!token) {
        return;
      }

      try {
        // 2. Save Token Manually
        await SecureStore.setItemAsync("selftracker.better-auth.session_token", token);
        await SecureStore.setItemAsync("selftracker.session_token", token);
        await SecureStore.setItemAsync("accessToken", token); // Legacy support

        // 3. Verify & Fetch User (Direct Fetch with Cookie)
        const response = await fetch(`${API_BASE_URL}/api/auth/get-session`, {
          headers: {
            'Cookie': `__Secure-better-auth.session_token=${token}`
          },
          credentials: 'include'
        });

        const responseText = await response.text();

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${responseText}`);
        }

        let data;
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}`);
        }

        if (data?.user) {
          // 4. Update State & Redirect
          setUser(data.user);
          setToken(token); // CRITICAL: Update Zustand so AppProviders sees it
          showToast(`Welcome back, ${data.user.name.split(" ")[0]}!`, "success");

          // Invalidate queries to trigger data refetch
          await queryClient.invalidateQueries({ queryKey: ['session'] });
          await queryClient.invalidateQueries({ queryKey: ['userHomeData'] });
          await queryClient.invalidateQueries({ queryKey: ['tasks'] });
          await queryClient.invalidateQueries({ queryKey: ['weights'] });
          await queryClient.invalidateQueries({ queryKey: ['workouts'] });

          // Small delay to ensure state updates?
          setTimeout(() => {
            router.replace("/(drawer)/(tabs)/home");
          }, 500);
        } else {
          throw new Error("No user data in session");
        }

      } catch (err: any) {
        console.error("[AuthCallback] Login failed:", err.message);
        showToast(`Login Failed: ${err.message}`, "error");
        router.replace("/(auth)/sign-in");
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

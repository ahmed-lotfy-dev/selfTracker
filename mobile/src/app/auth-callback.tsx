import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useAuthActions } from '@/src/store/useAuthStore';
import { API_BASE_URL } from '@/src/lib/api/config';
import { useToast } from '@/src/hooks/useToast';

export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { setUser } = useAuthActions();
  const { showToast } = useToast();

  useEffect(() => {
    const handleAuth = async () => {
      // 1. Extract Token
      let token = params.token as string;

      // Fallback: Check cookie param for session_token
      if (!token && params.cookie) {
        const cookieString = Array.isArray(params.cookie) ? params.cookie[0] : params.cookie;
        console.log("[AuthCallback] Parsing cookie:", cookieString);

        const match = cookieString.match(/__Secure-better-auth\.session_token=([^;]+)/);
        if (match && match[1]) {
          token = match[1].trim();
          console.log("[AuthCallback] Extracted token from cookie:", token.substring(0, 20) + "...");
        }
      }

      if (!token) {
        console.log("[AuthCallback] No token found in params:", params);
        // If we just landed here without params, maybe wait? Or error?
        // showToast("No authentication token received", "error");
        return;
      }

      console.log("[AuthCallback] Token received:", token.substring(0, 10) + "...");

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

        if (!response.ok) {
          throw new Error("Failed to validate session");
        }

        const data = await response.json();

        if (data?.user) {
          // 4. Update State & Redirect
          setUser(data.user);
          showToast(`Welcome back, ${data.user.name.split(" ")[0]}!`, "success");

          // Small delay to ensure state updates?
          setTimeout(() => {
            router.replace("/(drawer)/(tabs)/home");
          }, 500);
        } else {
          throw new Error("No user data in session");
        }

      } catch (err: any) {
        console.error("[AuthCallback] Error:", err);
        showToast(`Login Failed: ${err.message}`, "error");
        // router.replace("/sign-in"); // Optional: send them back
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

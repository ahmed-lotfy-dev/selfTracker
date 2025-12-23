import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuthActions, useAuthStore } from '@/src/features/auth/useAuthStore';
import { useToast } from '@/src/hooks/useToast';
import { queryClient } from '@/src/lib/react-query';
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

        await queryClient.invalidateQueries();

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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Image
        source={require('@/assets/images/icon.png')}
        style={styles.logo}
      />

      <ActivityIndicator
        size="large"
        color={colors.primary}
        style={styles.spinner}
      />

      <Text style={[styles.title, { color: colors.text }]}>
        Setting up your account
      </Text>

      <Text style={[styles.subtitle, { color: colors.placeholder }]}>
        Securing your session...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 40,
    borderRadius: 24,
  },
  spinner: {
    marginVertical: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 15,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '400',
  },
});

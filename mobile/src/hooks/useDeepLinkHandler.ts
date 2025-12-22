import { useEffect, useRef } from 'react';
import * as ExpoLinking from "expo-linking"
import { Linking, Platform } from "react-native"
import { useRouter } from "expo-router"
import { useToast } from './useToast';
import { authClient } from "../lib/auth-client"
import { queryClient } from "@/src/lib/react-query";
import { useAuthActions, useHasHydrated } from '../store/useAuthStore';
import * as SecureStore from 'expo-secure-store';

export function useDeepLinkHandler() {
  const router = useRouter();
  const { showToast } = useToast();
  const { setUser } = useAuthActions();
  const hasHydrated = useHasHydrated();
  const isProcessingRef = useRef(false);

  useEffect(() => {
    if (Platform.OS === 'web' || !hasHydrated) {
      return;
    }

    const handleDeepLink = async (event: { url: string }) => {
      const url = event.url;
      console.log("[DeepLink NATIVE] RAW URL RECEIVED:", url);

      if (isProcessingRef.current) {
        return;
      }

      try {
        const parsedUrl = ExpoLinking.parse(url);
        const params = parsedUrl.queryParams || {};

        // Check for nested 'url' parameter (common in Expo Go/Dev Client)
        if (params.url) {
          try {
            const nestedUrl = params.url as string;
            const parsedNested = ExpoLinking.parse(nestedUrl);
            const nestedParams = parsedNested.queryParams || {};

            // Merge nested params into main params
            Object.assign(params, nestedParams);
          } catch (e) {
            console.warn("[DeepLink] Failed to parse nested URL", e);
          }
        }

        let token = params.token as string | undefined;
        // Also check for session_token
        if (!token) {
          try {
            token = params.session_token as string | undefined;
          } catch (e) {
            // ignore error
          }
        }

        if (!token && params.cookie) {
          const cookieRaw = params.cookie;
          const cookieParam = Array.isArray(cookieRaw) ? cookieRaw[0] : cookieRaw;

          // Try matching standard token
          const match = cookieParam.match(/session_token=([^;]+)/);
          if (match && match[1]) {
            token = decodeURIComponent(match[1]);
          }
        }

        if (!token) {
          // Silently ignore generic deep links (like app launch) that don't have tokens
          console.log(`[DeepLink] No token found in URL: ${url} -> Ignoring.`);
          return;
        }

        isProcessingRef.current = true;
        showToast('Verifying identity...', 'success');

        try {
          await SecureStore.setItemAsync("selftracker.better-auth.session_token", token);
          await SecureStore.setItemAsync("selftracker.session_token", token);
          await SecureStore.setItemAsync("accessToken", token);
        } catch (storageErr) {
          console.warn('Failed to save session token manually', storageErr);
        }

        const session = await authClient.getSession({
          fetchOptions: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        });

        if (session.data?.user) {
          showToast(`Welcome, ${session.data.user.name.split(' ')[0]}!`, 'success');
          setUser(session.data.user);

          queryClient.setQueryData(['session'], session.data);
          await queryClient.invalidateQueries({ queryKey: ['session'] });
          await queryClient.invalidateQueries({ queryKey: ['userHomeData'] });

          router.replace('/(drawer)/(tabs)/home');

        } else {
          showToast('Login verification failed', 'error');
          isProcessingRef.current = false;
          return;
        }

        setTimeout(() => {
          isProcessingRef.current = false;
        }, 3000);

      } catch (err: any) {
        console.error('Deep link error:', err);
        showToast(`Error: ${err.message}`, 'error');
        isProcessingRef.current = false;
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [router, showToast, setUser, hasHydrated]);
}

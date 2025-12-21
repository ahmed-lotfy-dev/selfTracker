import { useEffect, useRef } from 'react';
import * as Linking from "expo-linking"
import { useRouter } from "expo-router"
import { useToast } from './useToast';
import { authClient } from "../lib/auth-client"
import { Platform } from "react-native"
import { queryClient } from "@/src/lib/react-query";
import { dbManager } from '@/src/db/client';
import { initialSync } from '@/src/services/sync';
import { useAuthActions, useHasHydrated } from '../store/useAuthStore';
import * as SecureStore from 'expo-secure-store';

/**
 * Custom hook to handle deep link authentication from social OAuth providers.
 * 
 * This hook listens for deep link events (selftracker://auth?token=...) emitted
 * when OAuth authentication completes. It uses better-auth's session management
 * to establish the authenticated session and navigates to the home page.
 * 
 * Better-auth uses HTTP-only session cookies, so we don't manually store tokens.
 */
export function useDeepLinkHandler() {
  const router = useRouter();
  const { showToast } = useToast();
  const { setUser } = useAuthActions();
  const hasHydrated = useHasHydrated();
  const isProcessingRef = useRef(false);

  useEffect(() => {
    // Skip in web environment or if store not hydrated yet
    if (Platform.OS === 'web' || !hasHydrated) {
      return;
    }

    const handleDeepLink = async (event: { url: string }) => {
      const url = event.url;
      // START DEBUG LOG
      showToast('Processing login...', 'info');

      // Prevent duplicate processing
      if (isProcessingRef.current) {
        return;
      }

      try {
        // Parse the deep link URL
        const parsedUrl = Linking.parse(url);

        // Check if this is an auth callback (home or auth)
        // Backend now redirects to selftracker://auth
        const isAuthPath = parsedUrl.hostname === 'auth' || parsedUrl.path === 'auth';

        if (!isAuthPath) {
          // DEBUG: Toast if path doesn't match, to see what we received
          if (parsedUrl.hostname || parsedUrl.path) {
            showToast(`Ignored path: ${parsedUrl.hostname || parsedUrl.path}`, 'info');
          }
          return;
        }

        let token = parsedUrl.queryParams?.token as string | undefined;

        // If no direct token, try to extract from cookie param
        if (!token && parsedUrl.queryParams?.cookie) {
          const cookieParam = parsedUrl.queryParams.cookie as string;
          const match = cookieParam.match(/session_token=([^;]+)/);
          if (match && match[1]) {
            token = decodeURIComponent(match[1]);
          }
        }

        if (!token) {
          if (isAuthPath && !parsedUrl.queryParams?.token) {
            return;
          }
          console.error('Deep link received but no token parameter found');
          showToast('Login failed: Token missing', 'error');
          return;
        }

        isProcessingRef.current = true;
        showToast('Verifying identity...', 'success');

        try {
          // OPTIONAL: Manually save token to SecureStore to ensure persistence
          // Better Auth Client should handle this, but explicit save guards against client config issues
          try {
            await SecureStore.setItemAsync("selftracker.better-auth.session_token", token);
            await SecureStore.setItemAsync("selftracker.session_token", token); // Fallback
          } catch (storageErr) {
            console.warn('Failed to save session token manually', storageErr);
          }

          // 1. Fetch the session using the token provided in the URL
          const session = await authClient.getSession({
            fetchOptions: {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          });

          if (session.data?.user) {
            showToast(`Welcome, ${session.data.user.name.split(' ')[0]}!`, 'success');

            // 2. Initialize DB immediately for this user
            try {
              await dbManager.initializeUserDatabase(session.data.user.id);
            } catch (dbErr: any) {
              console.error('[Auth] DB Init failed in deep link handler:', dbErr);
              showToast(`DB Error: ${dbErr.message}`, 'error');
            }

            // 3. Set user in store (Critical for UI to unblock "Preparing...")
            setUser(session.data.user);

            // 4. Update generic query cache
            queryClient.setQueryData(['session'], session.data);

            // 5. Invalidate to ensure freshness
            await queryClient.invalidateQueries({ queryKey: ['session'] });
            await queryClient.invalidateQueries({ queryKey: ['userHomeData'] });

            router.replace('/(drawer)/(tabs)/home');

            // Trigger sync in background
            initialSync().catch(err => console.warn('Background sync failed:', err));

          } else {
            console.warn('[Auth] Session data missing despite valid token request');
            showToast('Login verification failed', 'error');
            isProcessingRef.current = false;
            return;
          }

        } catch (error: any) {
          console.error('Failed to establish session:', error);
          showToast(`Session error: ${error.message || 'Unknown'}`, 'error');
          isProcessingRef.current = false;
          return;
        }

        setTimeout(() => {
          isProcessingRef.current = false;
        }, 3000);

      } catch (err: any) {
        console.error('Error parsing deep link URL:', err);
        showToast(`Link error: ${err.message}`, 'error');
        isProcessingRef.current = false;
      }
    };

    // Listen for incoming deep links while app is running
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check if app was opened with a deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    // Cleanup
    return () => {
      subscription.remove();
    };
  }, [router, showToast, setUser, hasHydrated]);
}

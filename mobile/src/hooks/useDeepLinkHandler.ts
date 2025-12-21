import { useEffect, useRef } from 'react';
import * as Linking from "expo-linking"
import { useRouter } from "expo-router"
import { useToast } from './useToast';
import { authClient } from "../lib/auth-client"
import { Platform } from "react-native"
import { queryClient } from '@/src/components/Provider/AppProviders';
import { dbManager } from '@/src/db/client';
import { initialSync } from '@/src/services/sync';
import { useAuthActions } from '../store/useAuthStore';

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
  const isProcessingRef = useRef(false);

  useEffect(() => {
    // Skip in web environment
    if (Platform.OS === 'web') {
      return;
    }

    const handleDeepLink = async (event: { url: string }) => {
      const url = event.url;

      // Prevent duplicate processing
      if (isProcessingRef.current) {
        console.log('Already processing auth event, skipping...');
        return;
      }

      try {
        // Parse the deep link URL
        const parsedUrl = Linking.parse(url);
        console.log('[DEBUG] Deep Link Parsing:', JSON.stringify(parsedUrl, null, 2));

        // Check if this is an auth callback
        const isAuthPath = parsedUrl.hostname === 'auth' || parsedUrl.path === 'auth';
        const isSocialSuccessPath = parsedUrl.path?.includes('social-success');
        const isHomePath = parsedUrl.hostname === 'home' || parsedUrl.path === 'home';

        if (!isAuthPath && !isSocialSuccessPath && !isHomePath) {
          console.log('Not an auth deep link, ignoring:', url);
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
          if (isHomePath && !parsedUrl.queryParams?.token) {
            return;
          }
          console.error('Deep link received but no token parameter found');
          showToast('Authentication failed: No token received', 'error');
          return;
        }

        isProcessingRef.current = true;
        console.log('Token extracted from deep link, establishing session...');

        try {
          const session = await authClient.getSession({
            fetchOptions: {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          });

          if (session.data?.user) {
            console.log('[Auth] Session established for user:', session.data.user.id);
            queryClient.setQueryData(['session'], session.data);

            // Initialize database for this user
            await dbManager.initializeUserDatabase(session.data.user.id);
            console.log('[Auth] Database initialized for user:', session.data.user.id);

            // Update auth store
            setUser(session.data.user);

            // Start initial sync in background
            initialSync().catch(err => console.warn('[Auth] Sync error:', err.message));
          } else {
            console.warn('[Auth] Session data missing, proceeding anyway');
          }

        } catch (error: any) {
          console.error('Failed to establish session:', error);
          showToast('Session setup failed, please try again', 'error');
          isProcessingRef.current = false;
          return;
        }

        await queryClient.invalidateQueries({ queryKey: ['session'] });
        await queryClient.invalidateQueries({ queryKey: ['userHomeData'] });

        showToast('Authentication successful!', 'success');
        console.log('Redirecting to home page...');
        router.replace('/(home)/home');

        setTimeout(() => {
          isProcessingRef.current = false;
        }, 2000);

      } catch (err) {
        console.error('Error parsing deep link URL:', err);
        showToast('Authentication failed: Invalid deep link', 'error');
        isProcessingRef.current = false;
      }
    };

    // Listen for incoming deep links while app is running
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check if app was opened with a deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('App opened with initial URL:', url);
        handleDeepLink({ url });
      }
    });

    // Cleanup
    return () => {
      subscription.remove();
    };
  }, [router, showToast]);
}

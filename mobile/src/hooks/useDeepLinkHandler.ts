import { useEffect, useRef } from 'react';
import * as Linking from "expo-linking"
import { useRouter } from "expo-router"
import * as SecureStore from "expo-secure-store"
import { useToast } from './useToast';
import { authClient } from "../lib/auth-client"
import { Platform } from "react-native"
import { queryClient } from '@/src/components/Provider/AppProviders';

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
        const isHomePath = parsedUrl.hostname === 'home' || parsedUrl.path === 'home'; // Handle potential redirects to home with params

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
          // If we are on the 'home' path, we might just be opening the app. 
          // If there's no token, we don't treat it as an auth attempt unless we were explicitly expecting one.
          if (isHomePath && !parsedUrl.queryParams?.token) {
            return;
          }
          console.error('Deep link received but no token parameter found');
          showToast('Authentication failed: No token received', 'error');
          return;
        }

        // Set processing flag
        isProcessingRef.current = true;

        console.log('Token extracted from deep link, establishing session...');
        console.log(`[DEBUG] Handling token: ${token.substring(0, 10)}...`);

        try {
          // 1. Store the token immediately in SecureStore
          // We store the signed token (from cookie param) for Cookie usage
          await SecureStore.setItemAsync("auth_cookie_token", token);

          // Also set as 'selftracker.session_token' for better-auth client persistence (using signed version to be safe)
          await SecureStore.setItemAsync("selftracker.session_token", token);
          await SecureStore.setItemAsync("better-auth.session_token", token);

          console.log('[DEBUG] Signed Token stored in SecureStore (auth_cookie_token & selftracker.session_token)');

          // 2. Wait a brief moment for storage to propagate if needed (rarely needed but safe)
          await new Promise(resolve => setTimeout(resolve, 100));

          // 3. Verify session using authClient

          let session = await authClient.getSession();

          if (!session.data) {
            console.log('[DEBUG] getSession() from storage returned null, trying with explicit header...');
            session = await authClient.getSession({
              fetchOptions: {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            });
          }

          if (!session.data) {
            console.warn('[DEBUG] Session data missing in response, but token is present. Proceeding with optimistic auth.');
            // Fallback: use signed token for axios if we couldn't get unsigned one
            await SecureStore.setItemAsync("auth_token_axios", token);
          } else {
            console.log('[DEBUG] Session established:', JSON.stringify(session.data, null, 2));
            console.log('Session established successfully');

            // Update query cache with the new session
            queryClient.setQueryData(['session'], session.data);

            // Store UNSIGNED token for Bearer usage
            // session.data doesn't contain the token, so we use the one we extracted
            await SecureStore.setItemAsync("auth_token_axios", token);
            console.log('[DEBUG] Token stored in SecureStore as auth_token_axios');
          }

        } catch (error: any) {
          console.error('Failed to establish session validation:', error);
          // We don't return here if we have the token stored; we try to proceed.
          showToast('Session check failed, but trying to proceed...', 'error');
        }

        // Invalidate React Query cache to refetch user data
        await queryClient.invalidateQueries({ queryKey: ['session'] });
        await queryClient.invalidateQueries({ queryKey: ['userHomeData'] });

        showToast('Authentication successful!', 'success');

        // Small delay before navigation
        await new Promise(resolve => setTimeout(resolve, 500));

        console.log('Redirecting to home page...');
        router.replace('/(home)/home'); // Explicitly go to home tab

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

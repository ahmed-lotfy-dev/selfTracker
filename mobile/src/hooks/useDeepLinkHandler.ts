import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { authClient } from '@/src/lib/auth-client';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import { queryClient } from '@/src/components/Provider/AppProviders';
import { useToast } from './useToast';

/**
 * Custom hook to handle deep link authentication from social OAuth providers.
 * 
 * This hook listens for deep link events (selftracker://auth?token=...) emitted
 * when OAuth authentication completes. It extracts the token, saves it to secure
 * storage via better-auth client, invalidates the session cache, and navigates 
 * to the home page.
 * 
 * Uses expo-linking to handle deep links across iOS and Android platforms.
 * 
 * @example
 * ```tsx
 * function RootLayout() {
 *   useDeepLinkHandler();
 *   return <Stack />;
 * }
 * ```
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
        // Parse the deep link URL: selftracker://auth?token=abc123
        const parsedUrl = Linking.parse(url);

        // Check if this is an auth callback
        if (parsedUrl.hostname !== 'auth' && parsedUrl.path !== 'auth') {
          console.log('Not an auth deep link, ignoring:', url);
          return;
        }

        const token = parsedUrl.queryParams?.token as string | undefined;

        if (!token) {
          console.error('Deep link received but no token parameter found');
          showToast('Authentication failed: No token received', 'error');
          return;
        }

        // Set processing flag
        isProcessingRef.current = true;

        console.log('Token extracted from deep link, processing authentication...');

        // The token is a bearer token from better-auth
        // We need to store it and establish the session
        try {
          // Fetch the session using the token
          // better-auth will automatically handle token storage via the expo client plugin
          await authClient.$fetch('/session', {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          console.log('Session established successfully');
        } catch (error) {
          console.error('Failed to fetch session with token:', error);
          showToast('Authentication failed: Could not establish session', 'error');
          isProcessingRef.current = false;
          return;
        }

        // Invalidate React Query cache to trigger re-render with new session
        await queryClient.invalidateQueries({ queryKey: ['session'] });

        // Show success message
        showToast('Authentication successful!', 'success');

        // Small delay before navigation to ensure state updates
        await new Promise(resolve => setTimeout(resolve, 300));

        // Navigate to home page
        console.log('Redirecting to home page...');
        router.replace('/home');

        // Reset processing flag after navigation
        setTimeout(() => {
          isProcessingRef.current = false;
        }, 1000);

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

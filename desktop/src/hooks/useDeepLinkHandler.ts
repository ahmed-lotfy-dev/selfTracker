import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';

/**
 * Custom hook to handle deep link authentication from social OAuth providers.
 * 
 * This hook listens for deep link events (selftracker://auth?token=...) emitted
 * by the Tauri backend when OAuth authentication completes. It extracts the token,
 * saves it to localStorage, invalidates the session cache, and navigates to the home page.
 * 
 * Uses dynamic imports to safely load Tauri APIs only when available, preventing
 * errors in development or non-Tauri environments.
 * 
 * @example
 * ```tsx
 * function App() {
 *   useDeepLinkHandler();
 *   return <RouterProvider router={router} />;
 * }
 * ```
 */
export function useDeepLinkHandler() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    let unlistenPromise: Promise<() => void> | null = null;
    let isProcessing = false; // Guard to prevent duplicate processing

    // Set up the deep link listener
    const setupListener = async () => {
      try {
        // Dynamically import Tauri event API to prevent errors in non-Tauri environments
        const { listen } = await import('@tauri-apps/api/event');

        unlistenPromise = listen<string[]>('app-deep-link', async (event) => {
          console.log('Deep link event received:', event.payload);

          // Prevent processing if already handling an auth event
          if (isProcessing) {
            console.log('Already processing auth event, skipping...');
            return;
          }

          const urls = event.payload;
          if (!urls || urls.length === 0) {
            console.warn('Deep link event received but no URLs in payload');
            return;
          }

          const url = urls[0];

          try {
            // Parse the deep link URL: selftracker://auth?token=abc123
            const urlObj = new URL(url);
            const token = urlObj.searchParams.get('token');

            if (!token) {
              console.error('Deep link received but no token parameter found');
              toast.error('Authentication failed: No token received');
              return;
            }

            // Set processing flag
            isProcessing = true;

            console.log('Token extracted from deep link, saving to localStorage');

            // Save the token to localStorage
            localStorage.setItem('bearer_token', token);

            console.log('Token saved, fetching session with new token...');

            // Manually fetch the session with the new token
            // This ensures better-auth's internal session state is updated
            try {
              await authClient.$fetch('/session', {
                method: 'GET',
              });
              console.log('Session fetched successfully');
            } catch (error) {
              console.error('Failed to fetch session:', error);
            }

            // Invalidate React Query cache to trigger re-render
            await queryClient.invalidateQueries({ queryKey: ['session'] });

            // Show success message
            toast.success('Authentication successful');

            // Wait a moment before redirecting
            await new Promise(resolve => setTimeout(resolve, 200));

            // Use window.location for more reliable navigation
            // This ensures a full page reload which guarantees session is recognized
            console.log('Redirecting to home page...');
            window.location.href = '/';
          } catch (err) {
            console.error('Error parsing deep link URL:', err);
            toast.error('Authentication failed: Invalid deep link');
            isProcessing = false; // Reset flag on error
          }
        });

        console.log('Deep link listener registered successfully');
      } catch (err) {
        // This is expected in non-Tauri environments (like web browser)
        console.log('Tauri API not available, deep link listener not registered');
      }
    };

    setupListener();

    // Cleanup function
    return () => {
      if (unlistenPromise) {
        unlistenPromise
          .then((unlisten) => {
            unlisten();
            console.log('Deep link listener unregistered');
          })
          .catch((err) => {
            console.error('Error unregistering deep link listener:', err);
          });
      }
    };
  }, [navigate, queryClient]);
}

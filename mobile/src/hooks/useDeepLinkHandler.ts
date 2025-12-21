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
      showToast('Processing login...', 'info');

      if (isProcessingRef.current) {
        return;
      }

      try {
        const parsedUrl = Linking.parse(url);

        // DEBUG: Show what URL we received
        showToast(`Path: ${parsedUrl.hostname || parsedUrl.path || 'none'}`, 'info');

        const isAuthPath = parsedUrl.hostname === 'home' || parsedUrl.path === 'home' ||
          parsedUrl.hostname === 'auth' || parsedUrl.path === 'auth';

        if (!isAuthPath) {
          return;
        }

        let token = parsedUrl.queryParams?.token as string | undefined;

        if (!token && parsedUrl.queryParams?.cookie) {
          const cookieParam = parsedUrl.queryParams.cookie as string;
          const match = cookieParam.match(/session_token=([^;]+)/);
          if (match && match[1]) {
            token = decodeURIComponent(match[1]);
          }
        }

        if (!token) {
          showToast('Login failed: No token', 'error');
          return;
        }

        isProcessingRef.current = true;
        showToast('Verifying identity...', 'success');

        try {
          await SecureStore.setItemAsync("selftracker.better-auth.session_token", token);
          await SecureStore.setItemAsync("selftracker.session_token", token);
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

          try {
            await dbManager.initializeUserDatabase(session.data.user.id);
          } catch (dbErr: any) {
            console.error('[Auth] DB Init failed:', dbErr);
            showToast(`DB Error: ${dbErr.message}`, 'error');
          }

          setUser(session.data.user);
          queryClient.setQueryData(['session'], session.data);
          await queryClient.invalidateQueries({ queryKey: ['session'] });
          await queryClient.invalidateQueries({ queryKey: ['userHomeData'] });

          router.replace('/(drawer)/(tabs)/home');
          initialSync().catch(err => console.warn('Background sync failed:', err));

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

import { useEffect, useRef } from "react";
import { authClient } from "@/src/lib/auth-client";
import { useAuthActions, useUser } from "@/src/store/useAuthStore";
import { dbManager } from "@/src/db/client";
import { initialSync } from "@/src/services/sync";
import { useToast } from "@/src/hooks/useToast";

export function AuthInitializer() {
  const { data: session } = authClient.useSession();
  const user = useUser(); // Get persisted user
  const { setUser } = useAuthActions();
  const isInitializedRef = useRef<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const initializeUserDatabase = async () => {
      // Prioritize persisted user, then session user
      // This ensures if useDeepLinkHandler sets the store, we respect it immediately
      const activeUser = user || session?.user;
      const activeUserId = activeUser?.id;

      // If we have a user and we haven't initialized for *this specific user* yet
      if (activeUserId && isInitializedRef.current !== activeUserId) {
        try {
          console.log(`[AuthInitializer] Initializing DB for user: ${activeUserId}`);

          // Mark as initialized immediately to prevent race conditions
          isInitializedRef.current = activeUserId;

          await dbManager.initializeUserDatabase(activeUserId);

          // Ensure store is in sync if we came from session
          if (!user && session?.user) {
            setUser(session.user);
          }

          initialSync().then(result => {
            if (!result.success) {
              console.warn(`[Auth] Initial sync failed - app will work offline`);
            }
          }).catch(err => {
            console.warn(`[Auth] Initial sync error (non-blocking):`, err.message);
          });
        } catch (error: any) {
          console.error("[Auth] Failed to initialize user database:", error);
          showToast(`DB Init Failed: ${error.message}`, 'error');
          // Reset ref if initialization completely fails so we can try again
          isInitializedRef.current = null;
        }
      } else if (!activeUserId && isInitializedRef.current) {
        // User logged out, reset ref
        isInitializedRef.current = null;
        // Ensure DB is closed if no user
        dbManager.closeCurrentDatabase();
      }
    };

    initializeUserDatabase();
  }, [session?.user, user, setUser]);

  // This component renders nothing
  return null;
}

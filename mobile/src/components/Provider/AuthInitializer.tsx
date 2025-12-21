import { useEffect, useRef } from "react";
import { authClient } from "@/src/lib/auth-client";
import { useAuthActions } from "@/src/store/useAuthStore";
import { dbManager } from "@/src/db/client";
import { initialSync } from "@/src/services/sync";

export function AuthInitializer() {
  const { data: session } = authClient.useSession();
  const { setUser } = useAuthActions();
  const isInitializedRef = useRef<string | null>(null);

  useEffect(() => {
    const initializeUserDatabase = async () => {
      // If we have a user and we haven't initialized for *this specific user* yet
      if (session?.user?.id && isInitializedRef.current !== session.user.id) {
        try {
          // Mark as initialized immediately to prevent race conditions
          isInitializedRef.current = session.user.id;

          await dbManager.initializeUserDatabase(session.user.id);

          setUser(session.user);

          initialSync().then(result => {
            if (result.success) {
            } else {
              console.warn(`[Auth] Initial sync failed - app will work offline`);
            }
          }).catch(err => {
            console.warn(`[Auth] Initial sync error (non-blocking):`, err.message);
          });
        } catch (error) {
          console.error("[Auth] Failed to initialize user database:", error);
          // Reset ref if initialization completely fails so we can try again
          isInitializedRef.current = null;
        }
      } else if (!session?.user && isInitializedRef.current) {
        // User logged out, reset ref
        isInitializedRef.current = null;
      }
    };

    initializeUserDatabase();
  }, [session?.user?.id, setUser]);

  // This component renders nothing
  return null;
}

import { ReactNode, useEffect, useState } from 'react';
import { SyncManager } from '../../lib/sync/SyncManager';

export function AppProviders({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        // Race the initialization against a 5-second timeout
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Initialization timed out")), 5000)
        );

        await Promise.race([
          SyncManager.initialize(),
          timeoutPromise
        ]);

        setIsReady(true);
      } catch (e: any) {
        console.error("Failed to initialize SyncManager:", e);
        // If it was just a timeout, we might still want to let them in, 
        // or show an error. specific to the "Gray Screen" issue, letting them in 
        // is safer than blocking forever.
        if (e.message === "Initialization timed out") {
          console.warn("Forcing app entry despite timeout");
          setIsReady(true);
        } else {
          setInitError(e.message || "Unknown initialization error");
        }
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const checkAuthAndSync = () => {
      const token = localStorage.getItem("bearer_token");
      if (token) {
        SyncManager.startSync();
      }
    };

    checkAuthAndSync();

    // Listen for storage changes (login/logout from other tabs/windows)
    window.addEventListener('storage', checkAuthAndSync);

    // Also listen for custom auth events if we dispatch them
    window.addEventListener('auth-changed', checkAuthAndSync);

    return () => {
      window.removeEventListener('storage', checkAuthAndSync);
      window.removeEventListener('auth-changed', checkAuthAndSync);
    };
  }, [isReady]);

  if (initError) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-destructive/10 text-destructive p-8">
        <div className="max-w-md w-full p-6 bg-background border border-destructive/20 rounded-lg space-y-4 text-center">
          <h2 className="text-xl font-bold">Initialization Failed</h2>
          <p className="text-sm text-muted-foreground">{initError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background text-muted-foreground">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm">Initializing application...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

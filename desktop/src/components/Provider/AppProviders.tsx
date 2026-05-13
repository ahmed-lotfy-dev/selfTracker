import { ReactNode, useEffect, useState } from 'react';
import { SyncManager } from '../../lib/sync/SyncManager';
import { fetchAllFromApi } from '@/hooks/use-api';

export function AppProviders({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
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

    const loadData = async () => {
      const token = localStorage.getItem("bearer_token");
      if (token) {
        console.log("[AppProviders] Authenticated, loading data from API...");
        await fetchAllFromApi();
        SyncManager.startSync().catch(e => console.warn("[AppProviders] Sync start skipped:", e?.message));
      }
    };

    loadData();

    window.addEventListener('storage', loadData);
    window.addEventListener('auth-changed', loadData);

    return () => {
      window.removeEventListener('storage', loadData);
      window.removeEventListener('auth-changed', loadData);
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

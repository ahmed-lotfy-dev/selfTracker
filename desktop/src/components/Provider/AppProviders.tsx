import { ReactNode, useEffect, useState } from 'react';
import { SyncManager } from '../../lib/sync/SyncManager';

export function AppProviders({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await SyncManager.initialize();
        setIsReady(true);
      } catch (e) {
        console.error("Failed to initialize SyncManager:", e);
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

import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { X, CloudOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DataSyncReminder() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("bearer_token");

    if (!token && !hasDismissed) {
      // Show reminder after a short delay (e.g., 5 seconds)
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [hasDismissed]);

  const handleDismiss = () => {
    setIsVisible(false);
    setHasDismissed(true);
    // Optional: Persist dismissal to session storage so it doesn't show again this session
    sessionStorage.setItem("sync_reminder_dismissed", "true");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full animate-in slide-in-from-right-5 fade-in duration-500">
      <div className="bg-card border border-border rounded-lg shadow-lg p-4 flex items-start gap-4">
        <div className="bg-muted p-2 rounded-full shrink-0">
          <CloudOff className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between">
            <h4 className="font-semibold text-sm">Guest Mode</h4>
            <button
              onClick={handleDismiss}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Your data is currently saved only on this device. Sign in to sync your progress across devices and secure your data.
          </p>
          <div className="flex gap-2 mt-2">
            <Link to="/login" className="w-full">
              <Button size="sm" variant="default" className="w-full text-xs h-8">
                Sign In to Sync
              </Button>
            </Link>
            <Button
              size="sm"
              variant="ghost"
              className="w-auto text-xs h-8"
              onClick={handleDismiss}
            >
              Later
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

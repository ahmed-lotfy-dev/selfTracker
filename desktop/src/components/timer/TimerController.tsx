import { useEffect } from "react";
import { useTimerStore } from "@/lib/store";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

export function TimerController() {
  const { tick, isRunning } = useTimerStore();

  // 1. Ticking Logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        tick();
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, tick]);

  // 2. Window Management Logic
  useEffect(() => {
    const manageWindow = async () => {
      try {
        const overlayLabel = "timer-overlay";
        const overlay = await WebviewWindow.getByLabel(overlayLabel);
        const { isOverlayVisible } = useTimerStore.getState();

        if (!overlay) return;

        if (isOverlayVisible) {
          await overlay.show();
          await overlay.setFocus();
        } else {
          await overlay.hide();
        }
      } catch (err) {
        // Tauri API not available (likely running in browser)
        console.log('Tauri WebviewWindow API not available');
      }
    };

    manageWindow();
  }, [useTimerStore.getState().isOverlayVisible]);

  // 3. Request Notification Permission on App Start
  useEffect(() => {
    import("@tauri-apps/plugin-notification")
      .then(async ({ isPermissionGranted, requestPermission }) => {
        const granted = await isPermissionGranted();
        if (!granted) {
          await requestPermission();
        }
      })
      .catch(() => {
        // Tauri notification plugin not available
        console.log('Tauri notification plugin not available');
      });
  }, []);

  return null; // Logic only
}

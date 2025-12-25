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
    };

    manageWindow();
  }, [useTimerStore.getState().isOverlayVisible]);

  return null; // Logic only
}

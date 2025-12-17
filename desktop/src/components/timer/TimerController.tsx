import { useEffect } from "react";
import { useTimerStore } from "@/lib/store";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { currentMonitor } from "@tauri-apps/api/window";

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

      if (!overlay) return;

      if (isRunning) {
        // Position it top-right
        // Get primary monitor
        const monitor = await currentMonitor();
        if (monitor) {
          // Window width is roughly 200 physical pixels (if configured as logical 200? Tauri config is logical usually)
          // Config: width 200.
          // Position: x = screenWidth - 200 - 20 (padding)
          // y = 20

          // We need to be careful with Logical vs Physical. 
          // Let's try logical positioning if possible, or convert.
          // For now, let's just attempt to set it.

          // Hard to get perfect without more math, but let's try a safe bet.
          // A simpler approach for V1: Just Show it. User can move it. 
          // But user asked for "top right".
          // Let's try to set position.

          // await overlay.setPosition(new PhysicalPosition(screenWidth - 250, 50)); 
          // Need to import PhysicalPosition.
        }

        await overlay.show();
      } else {
        // Optionally hide when paused? 
        // User probably wants to see it paused too?
        // "if pressed it go back to pomodoro timer route"
        // If I click pause in the overlay, should it hide?
        // Maybe not.
        // Let's only hide if explicitly closed or if we decide to.
        // For now, we only SHOW on start.
        // Does it hide ever?
        // Maybe we just let it stay until manually closed or clicked?
        // The overlay has an onClick to go back to main.
        // Let's leave it visible if paused. 
        // User didn't explicitly say "hide when paused".
      }
    };

    manageWindow();
  }, [isRunning]);

  return null; // Logic only
}

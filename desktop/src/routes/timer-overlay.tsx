import { useEffect, useCallback, useState } from "react";
import { useTimerStore } from "@/lib/store";
import { Play, Pause, Maximize2, Move, Square, Pin, PinOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function TimerOverlayPage() {
  const { timeLeft, isRunning, startTimer, stopTimer, overlayPosition } = useTimerStore();
  const [isPinned, setIsPinned] = useState(true); // Default to true as per config

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")} `;
  };

  const handleOpenApp = async () => {
    // Logic to show main window:
    import("@tauri-apps/api/event").then(({ emit }) => {
      emit("show-main-window");
    });
  };

  const handleStop = async () => {
    stopTimer();
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    await getCurrentWindow().hide();
    import("@tauri-apps/api/event").then(({ emit }) => {
      emit("show-main-window");
    });
  };

  const handlePinToggle = async () => {
    const newState = !isPinned;
    const { invoke } = await import("@tauri-apps/api/core");
    await invoke("toggle_pin", { pinned: newState });
    setIsPinned(newState);
  };

  const handleDragStart = useCallback(async (e: React.MouseEvent) => {
    if (e.button === 0) {
      const { invoke } = await import("@tauri-apps/api/core");
      await invoke("start_drag");
    }
  }, []);

  useEffect(() => {
    const positionWindow = async () => {
      try {
        const { getCurrentWindow, currentMonitor } = await import("@tauri-apps/api/window");
        const { LogicalPosition } = await import("@tauri-apps/api/dpi");

        const win = getCurrentWindow();
        const monitor = await currentMonitor();
        if (!monitor) return;

        const screenWidth = monitor.size.width;
        const screenHeight = monitor.size.height;
        const scale = monitor.scaleFactor;

        const winWidth = 300 * scale;
        const winHeight = 50 * scale;
        const padding = 20 * scale;

        let x = 0;
        let y = 0;

        switch (overlayPosition) {
          case "top-left":
            x = padding;
            y = padding;
            break;
          case "top-center":
            x = (screenWidth - winWidth) / 2;
            y = padding;
            break;
          case "top-right":
            x = screenWidth - winWidth - padding;
            y = padding;
            break;
          case "bottom-right":
            x = screenWidth - winWidth - padding;
            y = screenHeight - winHeight - padding;
            break;
          case "bottom-center":
            x = (screenWidth - winWidth) / 2;
            y = screenHeight - winHeight - padding;
            break;
          case "bottom-left":
            x = padding;
            y = screenHeight - winHeight - padding;
            break;
        }

        await win.setPosition(new LogicalPosition(x / scale, y / scale));
      } catch (err) {
        console.log('Tauri window API not available');
      }
    };

    positionWindow();
  }, [overlayPosition]);

  useEffect(() => {
    // Make body transparent for the window to be transparent
    document.documentElement.style.background = 'transparent';
    document.body.style.background = 'transparent';

    return () => {
      // Cleanup if navigating away (though usually this is a separate window)
      document.documentElement.style.background = '';
      document.body.style.background = '';
    }
  }, []);

  return (
    <div
      className={cn(
        "flex items-center justify-between w-full h-full px-4 rounded-full border border-white/20 shadow-lg backdrop-blur-xl bg-black/40 transition-all text-white",
        "hover:bg-black/60 hover:border-white/40 cursor-move"
      )}
      onMouseDown={handleDragStart}
    >
      {/* Drag Handle / Icon */}
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse pointer-events-none" />
      </div>

      {/* Time Display */}
      <div className="font-mono text-xl font-bold tracking-widest select-none cursor-default drop-shadow-md">
        {formatTime(timeLeft)}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1" onMouseDown={(e) => e.stopPropagation()}>
        {/* Changed from Button to Div to allow dragging via the Move icon area effectively */}
        <div
          className="h-6 w-6 flex items-center justify-center text-white/70 hover:text-white cursor-move"
          title="Drag to Move"
          onMouseDown={handleDragStart}
        >
          <Move className="h-3 w-3 pointer-events-none" />
        </div>

        <Button variant="ghost" size="icon" className="h-6 w-6 text-white/70 hover:text-white hover:bg-white/20" onClick={handlePinToggle} title={isPinned ? "Unpin" : "Pin on Top"}>
          {isPinned ? <Pin className="h-3 w-3 fill-current rotate-45" /> : <PinOff className="h-3 w-3" />}
        </Button>

        <Button variant="ghost" size="icon" className="h-6 w-6 text-white/70 hover:text-white hover:bg-white/20" onClick={handleOpenApp} title="Open App">
          <Maximize2 className="h-3 w-3" />
        </Button>

        <Button variant="ghost" size="icon" className="h-6 w-6 text-white/70 hover:text-white hover:bg-white/20" onClick={isRunning ? stopTimer : startTimer}>
          {isRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
        </Button>

        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400/80 hover:text-red-400 hover:bg-red-500/20" onClick={handleStop}>
          <Square className="h-3 w-3 fill-current" />
        </Button>
      </div>
    </div>
  );
}

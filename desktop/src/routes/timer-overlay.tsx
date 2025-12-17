import { useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { currentMonitor } from "@tauri-apps/api/window";
import { LogicalPosition } from "@tauri-apps/api/dpi"; // Try importing from dpi
import { useTimerStore } from "@/lib/store";
import { Play, Pause, Maximize2, Move, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function TimerOverlayPage() {
  const { timeLeft, isRunning, startTimer, stopTimer, overlayPosition, togglePosition } = useTimerStore();

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleOpenApp = async () => {
    // Logic to show main window:
    import("@tauri-apps/api/event").then(({ emit }) => {
      emit("show-main-window");
    });
  };

  const handleStop = async () => {
    stopTimer();
    await getCurrentWindow().hide();
    import("@tauri-apps/api/event").then(({ emit }) => {
      emit("show-main-window");
    });
  };

  useEffect(() => {
    const positionWindow = async () => {
      const win = getCurrentWindow();
      const monitor = await currentMonitor();
      if (!monitor) return;

      const screenWidth = monitor.size.width; // Physical
      const screenHeight = monitor.size.height; // Physical
      const scale = monitor.scaleFactor;

      // Window size (Logical 300x50) -> Physical
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
    };

    positionWindow();
  }, [overlayPosition]);

  return (
    <div
      className={cn(
        "flex items-center justify-between w-full h-full px-4 rounded-full border border-border/50 shadow-lg backdrop-blur-md bg-background/80 transition-all",
        "hover:bg-background/95 hover:border-border"
      )}
      style={{ "WebkitAppRegion": "drag" } as React.CSSProperties}
    >
      {/* Drag Handle / Icon */}
      <div className="flex items-center gap-2 cursor-grab active:cursor-grabbing">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
      </div>

      {/* Time Display */}
      <div className="font-mono text-xl font-bold tracking-widest select-none cursor-default" style={{ "WebkitAppRegion": "no-drag" } as React.CSSProperties}>
        {formatTime(timeLeft)}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1" style={{ "WebkitAppRegion": "no-drag" } as React.CSSProperties}>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={togglePosition} title="Move Position">
          <Move className="h-3 w-3" />
        </Button>

        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleOpenApp} title="Open App">
          <Maximize2 className="h-3 w-3" />
        </Button>

        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={isRunning ? stopTimer : startTimer}>
          {isRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
        </Button>

        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={handleStop}>
          <Square className="h-3 w-3 fill-current" />
        </Button>
      </div>
    </div>
  );
}

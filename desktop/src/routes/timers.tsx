import { PomodoroTimer } from "@/components/timer/PomodoroTimer";
import { useTimerStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Play, Pause, Square, AppWindow } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";

export default function TimersPage() {
  const { timeLeft, isRunning, startTimer, pauseTimer, stopTimer } = useTimerStore();

  // Helper to match the interface if needed, or just use store directly
  // The store has toggleTimer and stopTimer. It doesn't have explicit pause, 
  // but toggle handles it if running. 
  // Let's use the store actions directly.

  const handleToggleOverlay = async () => {
    try {
      await invoke("toggle_overlay");
    } catch (error) {
      console.error("Failed to toggle overlay:", error);
    }
  };

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-4">Focus Timer</h1>

        {/* Floating Timer Controls */}
        <div className="bg-card rounded-lg border p-6 space-y-4">
          <h2 className="text-lg font-semibold">Floating Timer Overlay</h2>
          <p className="text-sm text-muted-foreground">
            Control the always-on-top floating timer that follows you across all workspaces.
          </p>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => isRunning ? pauseTimer() : startTimer()}
              variant={isRunning ? "secondary" : "default"}
              className="gap-2"
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  {timeLeft < 25 * 60 && timeLeft > 0 ? "Resume" : "Start Timer"}
                </>
              )}
            </Button>

            <Button onClick={stopTimer} variant="destructive" className="gap-2">
              <Square className="w-4 h-4" />
              Stop
            </Button>

            <Button onClick={handleToggleOverlay} variant="outline" className="gap-2">
              <AppWindow className="w-4 h-4" />
              Show Floating Window
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            Status: {isRunning ? "⏱️ Running" : "⏸️ Paused"} •
            Time: {Math.floor(timeLeft / 3600)}h {Math.floor((timeLeft % 3600) / 60)}m {timeLeft % 60}s
          </div>
        </div>
      </div>

      {/* Pomodoro Timer */}
      <div className="flex flex-col items-center justify-center">
        <h2 className="text-xl font-semibold mb-6">Pomodoro Timer</h2>
        <PomodoroTimer />
      </div>
    </div>
  );
}

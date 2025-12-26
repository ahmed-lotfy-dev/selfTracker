import { PomodoroTimer } from "@/components/timer/PomodoroTimer";
import { useTimerStore, MODES } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Pause, Square, AppWindow, Clock } from "lucide-react";
import { useState } from "react";

export default function TimersPage() {
  const {
    timeLeft,
    isRunning,
    startTimer,
    pauseTimer,
    stopTimer,
    setMode,
    mode,
    setCustomTime,
    isOverlayVisible,
    setOverlayVisible
  } = useTimerStore();

  const [customMinutes, setCustomMinutes] = useState("25");

  const handleApplyCustomTime = (e?: React.FormEvent) => {
    e?.preventDefault();
    const mins = parseInt(customMinutes);
    if (!isNaN(mins) && mins > 0) {
      setCustomTime(mins);
    }
  };

  return (
    <div className="p-6 space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Floating Timer Controls */}
        <div className="bg-card rounded-lg border p-6 space-y-4">
          <div className="flex items-center gap-2">
            <AppWindow className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Floating Overlay</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Control the floating timer that follows you across all workspaces.
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
                  {timeLeft < 25 * 60 && timeLeft > 0 ? "Resume" : "Start"}
                </>
              )}
            </Button>

            <Button onClick={stopTimer} variant="destructive" className="gap-2">
              <Square className="w-4 h-4" />
              Stop & Hide
            </Button>

            <Button
              onClick={() => setOverlayVisible(!isOverlayVisible)}
              variant="outline"
              className="gap-2"
            >
              <AppWindow className="w-4 h-4" />
              {isOverlayVisible ? "Hide Overlay" : "Show Overlay"}
            </Button>
          </div>
        </div>

        {/* Custom Duration Picker */}
        <div className="bg-card rounded-lg border p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Custom Duration</h2>
          </div>
          <form onSubmit={handleApplyCustomTime} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                type="number"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(e.target.value)}
                placeholder="Minutes"
                className="pr-12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground uppercase">
                min
              </span>
            </div>
            <Button type="submit" variant="outline">
              Apply
            </Button>
          </form>

          <div className="flex gap-2">
            {(Object.keys(MODES) as Array<keyof typeof MODES>).map((m) => (
              <Button
                key={m}
                size="sm"
                variant={mode === m ? "default" : "secondary"}
                onClick={() => setMode(m)}
                className="flex-1"
              >
                {MODES[m].label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-12">
        <PomodoroTimer />
      </div>
    </div>
  );
}

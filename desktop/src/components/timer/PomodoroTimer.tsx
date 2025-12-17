import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTimerStore, MODES } from "@/lib/store"
import { RotateCcw } from "lucide-react"

export function PomodoroTimer() {
  const { mode, timeLeft, isRunning, setMode, toggleTimer, resetTimer } = useTimerStore()

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  return (
    <Card className="w-full max-w-sm mx-auto mt-4">
      <CardHeader>
        <CardTitle className="text-center">Pomodoro Timer</CardTitle>
        <div className="flex justify-center gap-2 mt-2">
          {(Object.keys(MODES) as Array<keyof typeof MODES>).map((m) => (
            <Button
              key={m}
              variant={mode === m ? "default" : "outline"}
              size="sm"
              onClick={() => setMode(m)}
            >
              {MODES[m].label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="text-6xl font-mono font-bold mb-6">
          {formatTime(timeLeft)}
        </div>
        <div className="flex gap-4">
          <Button onClick={toggleTimer} size="lg" className="w-32">
            {isRunning ? "Pause" : "Start"}
          </Button>
          <Button variant="outline" size="icon" onClick={() => resetTimer()}>
            <RotateCcw size={20} />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

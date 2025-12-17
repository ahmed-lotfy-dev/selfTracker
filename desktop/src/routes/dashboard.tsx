import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Board } from "@/components/kanban/Board"
import { PomodoroTimer } from "@/components/timer/PomodoroTimer"

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="h-full flex flex-col">
        {/* Header moved to AppShell */}
        <div className="flex-1 overflow-hidden flex">
          <div className="flex-1 overflow-x-auto overflow-y-hidden p-4 bg-muted/10">
            <Board />
          </div>
          <div className="w-80 border-l p-4 bg-background shrink-0">
            <h2 className="font-semibold mb-4">Focus</h2>
            <PomodoroTimer />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

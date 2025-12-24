import { Board } from "@/features/tasks/components/kanban/Board"
import { PomodoroTimer } from "@/components/timer/PomodoroTimer"
import { DashboardStats } from "@/components/dashboard/DashboardStats"

export default function DashboardPage() {
  return (
    <div className="h-full flex flex-col">
      {/* Header moved to AppShell */}
      <div className="flex-1 overflow-hidden flex">
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-4 bg-muted/10">
          <Board />
        </div>
        <div className="w-80 border-l p-4 bg-background shrink-0 flex flex-col gap-6">
          <div>
            <h2 className="font-semibold mb-4">Summary</h2>
            <DashboardStats />
          </div>

          <div>
            <h2 className="font-semibold mb-4">Focus</h2>
            <PomodoroTimer />
          </div>
        </div>
      </div>
    </div>
  )
}

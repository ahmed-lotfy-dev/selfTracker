import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Dumbbell, Scale } from "lucide-react"
import { useTasksStore } from "@/stores/tasks-store"
import { useWeightLogsStore } from "@/stores/weight-logs-store"
import { useWorkoutLogsStore } from "@/stores/workout-logs-store"

export function DashboardStats() {
  const { tasks } = useTasksStore();
  const { weightLogs } = useWeightLogsStore();
  const { workoutLogs } = useWorkoutLogsStore();

  // Calculate daily stats
  const today = new Date().toDateString()
  const tasksCompletedToday = tasks.filter((t) => t.completed && t.completed_at && new Date(t.completed_at).toDateString() === today).length
  const tasksPending = tasks.filter((t) => !t.completed).length

  // Sort weight logs by created_at descending
  const sortedWeightLogs = [...weightLogs].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const currentWeight = sortedWeightLogs[0]?.weight
  const workoutsCount = workoutLogs.length

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Daily Progress</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{tasksCompletedToday}</div>
          <p className="text-xs text-muted-foreground">Tasks completed today</p>
          <div className="text-xs text-muted-foreground mt-1">
            {tasksPending} tasks pending
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Weight</CardTitle>
          <Scale className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{currentWeight ? `${currentWeight} kg` : "--"}</div>
          <p className="text-xs text-muted-foreground">Latest measurement</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Workouts</CardTitle>
          <Dumbbell className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{workoutsCount}</div>
          <p className="text-xs text-muted-foreground">Total sessions</p>
        </CardContent>
      </Card>
    </div>
  )
}

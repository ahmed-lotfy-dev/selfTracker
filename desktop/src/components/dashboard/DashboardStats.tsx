import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Dumbbell, Scale } from "lucide-react"
import { useCollections } from "@/db/collections"
import { useLiveQuery } from "@tanstack/react-db"

export function DashboardStats() {
  const collections = useCollections();

  const { data: tasks = [] } = useLiveQuery(
    (q: any) => q.from({ t: collections?.tasks })
      .select(({ t }: any) => ({
        completed: t.completed,
        // Note: completedAt in schema is `completed_at` (snake_case)
        // Check if I need to map it or access snake_case directly
        // My other refactors mapped it. But here I can just access whatever is returned.
        // If I select `t.completed_at` with no alias, it returns `completed_at`?
        // In TasksPage I aliased it `id: t.id`.
        // Let's alias here for consistency.
        completedAt: t.completed_at
      }))
  ) as unknown as { data: any[] } || { data: [] };

  const { data: weightLogs = [] } = useLiveQuery(
    (q: any) => q.from({ w: collections?.weightLogs })
      .orderBy(({ w }: any) => w.created_at, 'DESC')
      .select(({ w }: any) => ({
        weight: w.weight,
        createdAt: w.created_at
      }))
    // .limit(1) // Limit not always supported in client sync collection depending on adapters, but filtering results is safe
  ) as unknown as { data: any[] } || { data: [] };

  const { data: workoutLogs = [] } = useLiveQuery(
    (q: any) => q.from({ wl: collections?.workoutLogs })
      .select(({ wl }: any) => ({
        id: wl.id
      }))
  ) as unknown as { data: any[] } || { data: [] };

  // Calculate daily stats
  const today = new Date().toDateString()
  // tasks items could have string or null date
  const tasksCompletedToday = tasks.filter((t: any) => t.completed && t.completedAt && new Date(t.completedAt).toDateString() === today).length
  const tasksPending = tasks.filter((t: any) => !t.completed).length

  const currentWeight = weightLogs[0]?.weight
  const workoutsCount = workoutLogs.length

  if (!collections) return <div className="text-sm text-muted-foreground p-4">Loading stats...</div>

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

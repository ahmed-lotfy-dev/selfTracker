import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dumbbell, Calendar } from "lucide-react";
import { formatLocal } from "@/lib/dateUtils";
import { WorkoutChart } from "@/components/charts/WorkoutChart";
import { useCollections } from "@/db/collections";
import { useLiveQuery } from "@tanstack/react-db";
import { LogWorkoutDialog } from "@/features/workouts/components/LogWorkoutDialog";

export default function WorkoutsPage() {
  const collections = useCollections();

  const { data: logs = [] } = useLiveQuery(
    (q: any) => q.from({ wl: collections?.workoutLogs })
      .orderBy(({ wl }: any) => wl.created_at, 'DESC')
      .select(({ wl }: any) => ({
        id: wl.id,
        workoutName: wl.workout_name, // Map snake_case
        notes: wl.notes,
        createdAt: wl.created_at, // Map snake_case
        updatedAt: wl.updated_at
      }))
  ) as unknown as { data: any[] } || { data: [] };

  if (!collections) return <div className="p-8">Initializing database...</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workouts</h1>
          <p className="text-muted-foreground">Track your fitness progress.</p>
        </div>
        <LogWorkoutDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Statistics Cards */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5" />
              Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
            <p className="text-xs text-muted-foreground">Total Workouts Logged</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <WorkoutChart />
      </div>

      <h2 className="text-xl font-semibold mt-8">Recent Logs</h2>
      <div className="space-y-4">
        {logs.map((log: any) => (
          <Card key={log.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-full dark:bg-blue-900/20">
                  <Dumbbell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-base">{log.workoutName || "Workout"}</CardTitle>
                  <CardDescription className="flex items-center gap-1 text-xs">
                    <Calendar className="h-3 w-3" />
                    {formatLocal(log.createdAt)}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {log.notes && <p className="text-sm text-muted-foreground mt-2">{log.notes}</p>}
            </CardContent>
          </Card>
        ))}
        {logs.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">No workouts logged yet.</div>
        )}
      </div>
    </div>
  );
}

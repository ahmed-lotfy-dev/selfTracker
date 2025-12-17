import { useQuery } from "@tanstack/react-query";
import { getWorkoutLogs } from "@/services/api/workouts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dumbbell, Calendar } from "lucide-react";

export default function WorkoutsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["workoutLogs"],
    queryFn: () => getWorkoutLogs()
  });

  if (isLoading) return <div className="p-8">Loading workouts...</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workouts</h1>
          <p className="text-muted-foreground">Track your fitness progress.</p>
        </div>
        {/* TODO: Add 'Log Workout' button */}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Placeholder for "Start Workout" or Stats */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5" />
              Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.logs.length || 0}</div>
            <p className="text-xs text-muted-foreground">Total Workouts Logged</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-semibold mt-8">Recent Logs</h2>
      <div className="space-y-4">
        {data?.logs.map((log) => (
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
                    {new Date(log.createdAt).toLocaleDateString()}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {log.notes && <p className="text-sm text-muted-foreground mt-2">{log.notes}</p>}
            </CardContent>
          </Card>
        ))}
        {data?.logs.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">No workouts logged yet.</div>
        )}
      </div>
    </div>
  );
}

import { useState } from "react";
import { Dumbbell, Flame, Zap, Calendar } from "lucide-react";
import { formatLocal } from "@/lib/dateUtils";
import { WorkoutChart } from "@/components/charts/WorkoutChart";
import { LogWorkoutDialog } from "@/features/workouts/LogWorkoutDialog";
import { useWorkoutsStore } from "@/stores/useWorkoutsStore";

export default function WorkoutsPage() {
  const { workoutLogs } = useWorkoutsStore();
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

  const sortedLogs = [...workoutLogs].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const totalSessions = workoutLogs.length;
  const workoutTypes = [...new Set(workoutLogs.map(l => l.workoutName))];
  const thisWeek = sortedLogs.filter(l => {
    const d = new Date(l.createdAt);
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    return d >= weekStart;
  }).length;

  // Calendar data
  const calendarData: Record<string, number> = {};
  workoutLogs.forEach(l => {
    const d = l.createdAt.slice(0, 10);
    calendarData[d] = (calendarData[d] || 0) + 1;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workouts</h1>
          <p className="text-muted-foreground">Track your fitness progress.</p>
        </div>
        <LogWorkoutDialog />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Dumbbell className="h-4 w-4 text-[#A855F7]" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Total</span>
          </div>
          <div className="text-2xl font-bold">{totalSessions}</div>
          <p className="text-xs text-muted-foreground mt-1">Workout sessions</p>
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="h-4 w-4 text-[#F59E0B]" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">This Week</span>
          </div>
          <div className="text-2xl font-bold">{thisWeek}</div>
          <p className="text-xs text-muted-foreground mt-1">Sessions</p>
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-[#10B981]" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Types</span>
          </div>
          <div className="text-2xl font-bold">{workoutTypes.length}</div>
          <p className="text-xs text-muted-foreground mt-1">Unique workouts</p>
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-[#0EA5E9]" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Streak</span>
          </div>
          <div className="text-2xl font-bold">-</div>
          <p className="text-xs text-muted-foreground mt-1">Coming soon</p>
        </div>
      </div>

      {/* Chart */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border bg-card p-5">
          <WorkoutChart />
        </div>

        {/* Type Distribution */}
        <div className="rounded-2xl border bg-card p-5">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Type Distribution</h2>
          {workoutTypes.length > 0 ? (
            <div className="space-y-3">
              {workoutTypes.map((name) => {
                const count = workoutLogs.filter(l => l.workoutName === name).length;
                const pct = Math.round((count / totalSessions) * 100);
                const colors: Record<string, string> = {
                  Push: "bg-[#0EA5E9]", Pull: "bg-[#10B981]", Legs: "bg-[#A855F7]",
                  Walking: "bg-[#F59E0B]", Cardio: "bg-[#06B6D4]", Running: "bg-[#EF4444]"
                };
                return (
                  <div key={name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium">{name}</span>
                      <span className="text-muted-foreground">{count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${colors[name] || "bg-primary"}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No data yet</p>
          )}
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-2">
        <button onClick={() => setViewMode("list")}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-accent text-muted-foreground"}`}>
          Timeline
        </button>
        <button onClick={() => setViewMode("calendar")}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${viewMode === "calendar" ? "bg-primary text-primary-foreground" : "bg-accent text-muted-foreground"}`}>
          Calendar
        </button>
      </div>

      {/* Workout Logs */}
      {viewMode === "list" && (
        <div className="space-y-3">
          {sortedLogs.map((log) => (
            <div key={log.id}
              className="rounded-2xl border bg-card p-5 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-[#A855F7]/10 p-2.5 rounded-full">
                    <Dumbbell className="h-4 w-4 text-[#A855F7]" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{log.workoutName || "Workout"}</h3>
                    <p className="text-xs text-muted-foreground">
                      {formatLocal(log.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
              {log.notes && (
                <p className="text-sm text-muted-foreground mt-3 ml-11">{log.notes}</p>
              )}
            </div>
          ))}
          {workoutLogs.length === 0 && (
            <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-3xl border-muted">
              <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-40" />
              No workouts logged yet. Start moving!
            </div>
          )}
        </div>
      )}

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <div className="rounded-2xl border bg-card p-6">
          <div className="grid grid-cols-7 gap-1">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
              <div key={d} className="text-center text-xs text-muted-foreground font-medium py-2">{d}</div>
            ))}
            {(() => {
              const now = new Date();
              const year = now.getFullYear();
              const month = now.getMonth();
              const first = new Date(year, month, 1).getDay();
              const days = new Date(year, month + 1, 0).getDate();
              const cells = [];
              for (let i = 0; i < first; i++) cells.push(<div key={`e-${i}`} />);
              for (let d = 1; d <= days; d++) {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                const hasWorkout = calendarData[dateStr];
                const isToday = dateStr === new Date().toISOString().slice(0, 10);
                cells.push(
                  <div key={d}
                    className={`text-center py-2 text-sm rounded-lg transition-colors ${
                      isToday ? "ring-2 ring-primary" : ""
                    } ${hasWorkout ? "bg-primary/20 text-primary font-bold" : "text-muted-foreground"}`}
                  >
                    {d}
                  </div>
                );
              }
              return cells;
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

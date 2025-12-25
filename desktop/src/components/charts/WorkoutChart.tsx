import { useState, useMemo } from "react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PeriodSelector, type Period } from "./PeriodSelector"
import { Loader2 } from "lucide-react"
import { useCollections } from "@/db/collections"
import { useLiveQuery } from "@tanstack/react-db"
import { subMonths, isAfter, parseISO } from "date-fns"

export function WorkoutChart() {
  const [period, setPeriod] = useState<Period>(3)
  const collections = useCollections();

  // If collections is null, we are initializing.
  const isLoading = !collections;

  const { data: logs = [] } = useLiveQuery(
    (q: any) => {
      if (!collections?.workoutLogs) return q.from({ wl: [] }).select(() => ({}));
      return q.from({ wl: collections.workoutLogs })
        .select(({ wl }: any) => ({
          name: wl.workout_name,
          createdAt: wl.created_at
        }));
    }
  ) as unknown as { data: any[] } || { data: [] };

  const chartData = useMemo(() => {
    if (!logs.length) return [];

    const cutoffDate = subMonths(new Date(), period);

    const filtered = logs.filter((log: any) => {
      const date = log.createdAt ? parseISO(log.createdAt) : new Date();
      return isAfter(date, cutoffDate);
    });

    const counts: Record<string, number> = {};
    filtered.forEach((log: any) => {
      const name = log.name || "Unknown";
      counts[name] = (counts[name] || 0) + 1;
    });

    return Object.entries(counts).map(([name, count]) => ({
      name,
      count
    })).sort((a, b) => b.count - a.count); // Sort by prevalence
  }, [logs, period]);

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <div className="space-y-1">
          <CardTitle>Workout Distribution</CardTitle>
          <CardDescription>Breakdown of workouts by type</CardDescription>
        </div>
        <PeriodSelector currentPeriod={period} onSelect={setPeriod} disabled={isLoading} />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No data for this period
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={10}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(0,0,0,0.1)" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                    backgroundColor: "hsl(var(--popover))",
                    color: "hsl(var(--popover-foreground))"
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                  animationDuration={1000}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

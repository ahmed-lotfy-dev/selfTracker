import { useState, useMemo } from "react"
import { Line, LineChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PeriodSelector, type Period } from "./PeriodSelector"
import { Loader2 } from "lucide-react"
import { useCollections } from "@/db/collections"
import { useLiveQuery } from "@tanstack/react-db"
import { subMonths, isAfter, parseISO, format } from "date-fns"

export function WeightChart() {
  const [period, setPeriod] = useState<Period>(3)
  const collections = useCollections();

  const { data: logs = [] } = useLiveQuery(
    (q: any) => q.from({ w: collections?.weightLogs })
      .orderBy(({ w }: any) => w.created_at, 'ASC') // Recharts expects sorted by X
      .select(({ w }: any) => ({
        weight: w.weight,
        createdAt: w.created_at
      }))
  ) as unknown as { data: any[] } || { data: [] };

  const chartData = useMemo(() => {
    if (!logs.length) return [];

    const cutoffDate = subMonths(new Date(), period);

    const filtered = logs.filter((log: any) => {
      const date = log.createdAt ? parseISO(log.createdAt) : new Date();
      return isAfter(date, cutoffDate);
    });

    return filtered.map((log: any) => ({
      name: log.createdAt ? format(parseISO(log.createdAt), "MMM d") : "Unknown",
      weight: log.weight
    }));
  }, [logs, period]);

  // If collections is null, we are initializing.
  const isLoading = !collections;

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <div className="space-y-1">
          <CardTitle>Weight Progress</CardTitle>
          <CardDescription>Track your weight over time</CardDescription>
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
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={30}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  domain={['dataMin - 2', 'dataMax + 2']}
                  allowDecimals={true}
                />
                <Tooltip
                  cursor={{ stroke: "rgba(0,0,0,0.1)", strokeWidth: 2 }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                    backgroundColor: "hsl(var(--popover))",
                    color: "hsl(var(--popover-foreground))"
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "hsl(var(--primary))" }}
                  activeDot={{ r: 6 }}
                  animationDuration={1000}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

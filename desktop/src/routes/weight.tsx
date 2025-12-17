import { useQuery } from "@tanstack/react-query";
import { getWeightLogs } from "@/services/api/weight";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale } from "lucide-react";

export default function WeightPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["weightLogs"],
    queryFn: () => getWeightLogs()
  });

  if (isLoading) return <div className="p-8">Loading weight logs...</div>;

  const currentWeight = data?.logs[0]?.weight;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Weight Tracker</h1>
          <p className="text-muted-foreground">Monitor your weight, mood, and energy.</p>
        </div>
        {/* TODO: Add 'Log Weight' button */}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current Weight</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentWeight ? `${currentWeight} kg` : "N/A"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.logs.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-semibold mt-8">Recent Logs</h2>
      <div className="space-y-4">
        {data?.logs.map((log) => (
          <Card key={log.id}>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <div className="text-xl font-bold flex items-center gap-2">
                  <Scale className="h-5 w-5 text-muted-foreground" />
                  {log.weight} kg
                </div>
                <div className="text-xs text-muted-foreground flex gap-2 mt-1">
                  <span>Mood: {log.mood}</span>
                  <span>•</span>
                  <span>Energy: {log.energy}</span>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {new Date(log.createdAt).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
        {data?.logs.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">No weight logs found.</div>
        )}
      </div>
    </div>
  );
}

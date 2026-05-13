import { useState, useEffect } from "react";
import { Scale, Plus, Flame, Zap, Activity, ArrowDown } from "lucide-react";
import { formatLocal } from "@/lib/dateUtils";
import { WeightChart } from "@/components/charts/WeightChart";
import { useWeightStore } from "@/stores/useWeightStore";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUserStore } from "@/lib/user-store";

export default function WeightPage() {
  const { weightLogs, addWeightLog, deleteWeightLog } = useWeightStore();
  const userId = useUserStore(state => state.userId);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [weight, setWeight] = useState("");
  const [mood, setMood] = useState<"Low" | "Medium" | "High">("Medium");
  const [energy, setEnergy] = useState<"Low" | "Okay" | "Good" | "Great">("Good");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
        e.preventDefault();
        setIsAddOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const sortedLogs = [...weightLogs].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const currentWeight = sortedLogs[0]?.weight;
  const startWeight = sortedLogs[sortedLogs.length - 1]?.weight;
  const weightChange = currentWeight && startWeight
    ? (parseFloat(currentWeight) - parseFloat(startWeight)).toFixed(1)
    : null;
  const minWeight = sortedLogs.length
    ? Math.min(...sortedLogs.map(l => parseFloat(l.weight)))
    : null;

  const handleAdd = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!weight.trim()) return;

    addWeightLog({
      userId: userId || 'local',
      weight: weight,
      mood,
      energy,
      notes: notes || null,
      createdAt: new Date().toISOString(),
    });

    setWeight("");
    setNotes("");
    setIsAddOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this log entry?")) {
      deleteWeightLog(id);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Weight Tracker</h1>
          <p className="text-muted-foreground">Monitor your weight, mood, and energy.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Log Weight
              <Kbd className="ml-2">Ctrl+W</Kbd>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Weight</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 py-4">
              <div>
                <Label>Weight (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g. 75.5"
                  autoFocus
                />
              </div>
              <div>
                <Label>Mood</Label>
                <div className="flex gap-2 mt-1">
                  {(["Low", "Medium", "High"] as const).map((m) => (
                    <button key={m} type="button" onClick={() => setMood(m)}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                        mood === m ? "bg-primary text-primary-foreground" : "bg-accent text-muted-foreground"
                      }`}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Energy</Label>
                <div className="flex gap-2 mt-1">
                  {(["Low", "Okay", "Good", "Great"] as const).map((e) => (
                    <button key={e} type="button" onClick={() => setEnergy(e)}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                        energy === e ? "bg-primary text-primary-foreground" : "bg-accent text-muted-foreground"
                      }`}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Notes (optional)</Label>
                <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any notes..." />
              </div>
              <Button type="submit" className="w-full">Save Entry</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Scale className="h-4 w-4 text-[#0EA5E9]" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Current</span>
          </div>
          <div className="text-2xl font-bold">
            {currentWeight ? `${currentWeight} kg` : "N/A"}
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-[#10B981]" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Change</span>
          </div>
          <div className={`text-2xl font-bold ${weightChange && parseFloat(weightChange) > 0 ? 'text-red-500' : 'text-green-500'}`}>
            {weightChange ? `${weightChange} kg` : "N/A"}
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <ArrowDown className="h-4 w-4 text-[#A855F7]" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Lowest</span>
          </div>
          <div className="text-2xl font-bold">
            {minWeight ? `${minWeight} kg` : "N/A"}
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-[#F59E0B]" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Entries</span>
          </div>
          <div className="text-2xl font-bold">{weightLogs.length}</div>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-2xl border bg-card p-5">
        <WeightChart />
      </div>

      {/* Logs */}
      <h2 className="text-xl font-semibold mt-8">Recent Logs</h2>
      <div className="space-y-3">
        {sortedLogs.map((log) => (
          <div key={log.id}
            className="rounded-2xl border bg-card p-5 flex items-center justify-between hover:bg-accent/50 transition-colors"
          >
            <div>
              <div className="text-xl font-bold flex items-center gap-2">
                <Scale className="h-5 w-5 text-muted-foreground" />
                {log.weight} kg
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Zap size={12} /> {log.energy || '-'}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Flame size={12} /> {log.mood || '-'}
                </span>
                {log.notes && <span className="text-xs text-muted-foreground">• {log.notes}</span>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-muted-foreground">
                {formatLocal(log.createdAt)}
              </div>
              <button onClick={() => handleDelete(log.id)}
                className="text-xs text-destructive hover:text-destructive/80 opacity-0 hover:opacity-100 transition-opacity">
                Delete
              </button>
            </div>
          </div>
        ))}
        {weightLogs.length === 0 && (
          <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-3xl border-muted">
            <Scale className="h-12 w-12 mx-auto mb-4 opacity-40" />
            No weight logs found. Start tracking!
          </div>
        )}
      </div>
    </div>
  );
}



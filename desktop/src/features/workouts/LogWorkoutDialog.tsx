import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Dumbbell, Loader2, AlertCircle } from "lucide-react";
import { useWorkoutLogsStore } from "@/stores/workout-logs-store";
import { useWorkoutsStore } from "@/stores/workouts-store";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Kbd } from "@/components/ui/kbd";
import { DatePicker } from "@/components/ui/date-picker";

export function LogWorkoutDialog() {
  const [open, setOpen] = useState(false);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState("");
  const [customName, setCustomName] = useState("");
  const [notes, setNotes] = useState("");
  const [fetchError, setFetchError] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());

  const { addWorkoutLog } = useWorkoutLogsStore();
  const { workouts, isLoading, setWorkouts, setLoading } = useWorkoutsStore();

  // Fetch workouts on dialog open
  useEffect(() => {
    if (open) {
      fetchWorkouts();
    }
  }, [open]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchWorkouts = async () => {
    setLoading(true);
    setFetchError("");

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || (import.meta.env.PROD ? "https://selftracker.ahmedlotfy.site" : "http://localhost:8000");
      const token = localStorage.getItem('bearer_token');

      const response = await fetch(`${backendUrl}/api/workouts`, {
        headers: token ? {
          'Authorization': `Bearer ${token}`,
        } : {},
      });

      if (response.ok) {
        const data = await response.json();
        setWorkouts(data);
      } else {
        throw new Error('Failed to fetch workouts');
      }
    } catch (error) {
      console.error('Error fetching workouts:', error);
      setFetchError('Using cached workouts (offline)');
      // Fall back to cached workouts (already in store from persist)
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedWorkout = workouts.find(w => w.id === selectedWorkoutId);
    const workoutName = selectedWorkout?.name || customName;

    if (!workoutName.trim()) return;

    addWorkoutLog({
      workout_name: workoutName,
      workout_id: selectedWorkoutId || "custom",
      notes,
      created_at: date?.toISOString() || new Date().toISOString(),
    });

    setOpen(false);
    setSelectedWorkoutId("");
    setCustomName("");
    setNotes("");
    setDate(new Date());
  };

  const isCustomWorkout = selectedWorkoutId === "custom";
  const canSubmit = (selectedWorkoutId && selectedWorkoutId !== "custom") || (isCustomWorkout && customName.trim());

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="shadow-lg hover:shadow-xl transition-all">
          <Plus className="mr-2 h-5 w-5" />
          Log Workout
          <Kbd className="ml-2">Ctrl+A</Kbd>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Dumbbell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">Log Workout</DialogTitle>
              <DialogDescription>
                Record your training session
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {fetchError && (
          <Alert variant="default" className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800 dark:text-orange-200">
              {fetchError}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workout" className="text-sm font-medium">
                Select Workout
              </Label>
              <Select
                value={selectedWorkoutId}
                onValueChange={setSelectedWorkoutId}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={isLoading ? "Loading workouts..." : "Choose a workout"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      <span className="font-medium">Custom Workout</span>
                    </div>
                  </SelectItem>
                  {workouts.map((workout) => (
                    <SelectItem key={workout.id} value={workout.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{workout.name}</span>
                        {workout.description && (
                          <span className="text-xs text-muted-foreground">{workout.description}</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Fetching latest workouts...</span>
                </div>
              )}
            </div>

            {isCustomWorkout && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <Label htmlFor="custom-name" className="text-sm font-medium">
                  Workout Name
                </Label>
                <Input
                  id="custom-name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Upper Body Power"
                  autoFocus
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">
                Notes <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How did it go? Any PRs or observations..."
                className="min-h-[100px] resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-medium">
                Date
              </Label>
              <DatePicker date={date} setDate={setDate} />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit} className="min-w-[100px]">
              <Dumbbell className="mr-2 h-4 w-4" />
              Save Log
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Check, Flame, Trophy, Plus, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Kbd } from "@/components/ui/kbd"
import { useActiveHabits, useHabitsStore } from "@/stores/useHabitsStore"
import { useUserStore } from "@/lib/user-store"

export default function HabitsPage() {
  const habits = useActiveHabits()
  const { addHabit, toggleComplete } = useHabitsStore()
  const userId = useUserStore(state => state.userId)

  const [newHabitName, setNewHabitName] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        setIsDialogOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCreate = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!newHabitName.trim()) return

    addHabit({
      userId: userId || 'local',
      name: newHabitName,
      color: "bg-primary",
      description: null
    });

    setNewHabitName("")
    setIsDialogOpen(false)
  }

  const completionRate = habits.length > 0
    ? Math.round((habits.filter((h) => h.completedToday).length / habits.length) * 100)
    : 0

  return (
    <div className="p-8 space-y-8 min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-primary font-orbitron">
            Habits
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">Build inconsistency into consistency.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="rounded-full shadow-lg hover:shadow-xl transition-all bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="mr-2 h-5 w-5" /> New Habit
              <Kbd className="ml-2 bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30">Ctrl+A</Kbd>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="font-orbitron tracking-wide">Create New Habit</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="habit-name" className="text-right">Name</Label>
                <Input
                  id="habit-name"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  placeholder="e.g. Read 10 pages"
                  className="col-span-3"
                  autoFocus
                />
              </div>
              <Button type="submit" disabled={!newHabitName.trim()} className="w-full">Create Habit</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Progress Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="col-span-2 border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Daily Progress</p>
                <div className="flex items-center gap-3">
                  <Trophy className="h-6 w-6 text-yellow-500 animate-pulse" />
                  <span className="text-4xl font-extrabold tracking-tight font-orbitron">{completionRate}%</span>
                </div>
              </div>
              <div className="text-right space-y-1">
                <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                  {habits.filter((h) => h.completedToday).length} / {habits.length} Done
                </span>
              </div>
            </div>
            <Progress value={completionRate} className="h-2 rounded-full bg-muted" indicatorClassName="bg-primary" />
          </CardContent>
        </Card>

        <Card className="col-span-2 border-border/50 bg-card/50 backdrop-blur-sm shadow-sm flex items-center justify-center">
          <div className="text-center p-6">
            <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
              <Calendar className="h-5 w-5" />
              <span className="font-medium">Total Active Habits</span>
            </div>
            <span className="text-3xl font-bold font-orbitron">{habits.length}</span>
          </div>
        </Card>
      </div>

      {/* Habits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {habits.map((habit) => (
          <div
            key={habit.id}
            onClick={() => toggleComplete(habit.id)}
            className={cn(
              "group relative overflow-hidden rounded-2xl border bg-card p-6 transition-all duration-300 hover:shadow-lg cursor-pointer select-none",
              habit.completedToday
                ? "border-green-500/50 bg-green-500/5 dark:bg-green-500/10"
                : "border-border hover:border-primary/50"
            )}
          >
            {/* Glow effect */}
            <div className={cn(
              "absolute inset-0 opacity-0 transition-opacity duration-500",
              habit.completedToday ? "bg-green-500/10 opacity-100" : "group-hover:opacity-10"
            )} />

            <div className="relative z-10 flex items-start justify-between">
              <div className="flex-1 mr-4">
                <h3 className={cn(
                  "font-bold text-lg leading-tight mb-2 transition-colors",
                  habit.completedToday ? "text-green-600 dark:text-green-400" : "text-card-foreground"
                )}>
                  {habit.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {habit.completedToday ? "Completed for today" : "Tap to mark done"}
                </p>
              </div>

              <div className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-sm",
                habit.completedToday
                  ? "bg-green-500 border-green-500 scale-110 rotate-0"
                  : "border-muted-foreground/30 bg-background group-hover:border-primary rotate-0"
              )}>
                {habit.completedToday && <Check className="h-5 w-5 text-white" strokeWidth={3} />}
              </div>
            </div>

            <div className="relative z-10 mt-6 flex items-center justify-between">
              <div className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-colors",
                habit.streak > 0
                  ? "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400"
                  : "bg-muted text-muted-foreground/70"
              )}>
                <Flame className={cn("h-3.5 w-3.5", habit.streak > 0 && "text-orange-500 fill-orange-500")} />
                <span>{habit.streak} Day Streak</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {habits.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-3xl border-muted">
          <div className="bg-muted/50 p-4 rounded-full mb-4">
            <Trophy className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No habits yet</h3>
          <p className="text-muted-foreground max-w-sm">
            Start small. Create your first habit to begin your journey towards consistency.
          </p>
        </div>
      )}
    </div>
  )
}

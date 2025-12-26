import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Check, Flame, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { useHabitsStore } from "@/stores/habits-store"
import { Kbd } from "@/components/ui/kbd"

export default function HabitsPage() {
  const { habits, addHabit, toggleHabit } = useHabitsStore();
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

  const handleAddHabit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!newHabitName.trim()) return

    addHabit({
      name: newHabitName,
      color: "bg-primary"
    })

    setNewHabitName("")
    setIsDialogOpen(false)
  }

  const completionRate = Math.round((habits.filter(h => h.completedToday).length / habits.length) * 100) || 0

  return (
    <div className="p-8 space-y-8 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-primary">
            Habits
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">Build inconsistency into consistency.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="rounded-full shadow-lg hover:shadow-xl transition-all">
              <Plus className="mr-2 h-5 w-5" /> New Habit
              <Kbd className="ml-2">Ctrl+A</Kbd>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Habit</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddHabit} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="habit-name" className="text-right">Name</Label>
                <Input
                  id="habit-name"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  placeholder="e.g. Meditate"
                  className="col-span-3"
                  autoFocus
                />
              </div>
              <Button type="submit" disabled={!newHabitName.trim()}>Create Habit</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Progress Header */}
      <Card className="border bg-card shadow-sm">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground font-medium">Today's Progress</p>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span className="text-3xl font-bold tracking-tight">{completionRate}%</span>
              </div>
            </div>
            <div className="text-right space-y-1">
              <p className="text-sm text-muted-foreground">
                {habits.filter(h => h.completedToday).length} / {habits.length} completed
              </p>
            </div>
          </div>
          <Progress value={completionRate} className="h-3 rounded-full" />
        </CardContent>
      </Card>

      {/* Habits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {habits.map((habit) => (
          <Card
            key={habit.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-lg group border-2",
              habit.completedToday ? "border-green-500 bg-linear-to-br from-green-50 to-transparent dark:from-green-950" : ""
            )}
            onClick={() => toggleHabit(habit.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-12 w-12 rounded-full flex items-center justify-center transition-all",
                    habit.completedToday ? "bg-green-500 scale-110" : "bg-muted group-hover:bg-primary/10"
                  )}>
                    {habit.completedToday ? (
                      <Check className="h-6 w-6 text-white" />
                    ) : (
                      <div className="h-8 w-8 rounded-full border-4 border-muted-foreground/30" />
                    )}
                  </div>
                </div>

                {habit.streak > 0 && (
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/50">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-bold text-orange-700 dark:text-orange-300">
                      {habit.streak}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-1">{habit.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {habit.completedToday ? "Completed today!" : "Tap to complete"}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {habits.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground text-lg">
            No habits yet. Create your first habit to start building consistency!
          </p>
        </Card>
      )}
    </div>
  )
}

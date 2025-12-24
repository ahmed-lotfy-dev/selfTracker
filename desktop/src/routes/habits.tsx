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

// Types
type Habit = {
  id: string
  name: string
  streak: number
  completedToday: boolean
  color: string
}

// Mock Data / Local Persistence
// const MOCK_HABITS: Habit[] = [
//   { id: "1", name: "Morning Meditation", streak: 5, completedToday: true, color: "bg-blue-500" },
//   { id: "2", name: "Read 30 mins", streak: 12, completedToday: false, color: "bg-purple-500" },
//   { id: "3", name: "Drink 3L Water", streak: 3, completedToday: false, color: "bg-cyan-500" },
//   { id: "4", name: "Workout", streak: 0, completedToday: false, color: "bg-orange-500" },
// ]

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [newHabitName, setNewHabitName] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem("habits")
    if (saved) {
      setHabits(JSON.parse(saved))
    } else {
      // Initialize with some defaults if empty
      const initial = [
        { id: "1", name: "Morning Meditation", streak: 5, completedToday: false, color: "bg-primary" },
        { id: "2", name: "Read 30 mins", streak: 12, completedToday: false, color: "bg-primary" },
      ]
      setHabits(initial)
      localStorage.setItem("habits", JSON.stringify(initial))
    }
  }, [])

  // Persist changes
  useEffect(() => {
    if (habits.length > 0) {
      localStorage.setItem("habits", JSON.stringify(habits))
    }
  }, [habits])

  const toggleHabit = (id: string) => {
    setHabits(prev => prev.map(habit => {
      if (habit.id === id) {
        const isCompleting = !habit.completedToday
        return {
          ...habit,
          completedToday: isCompleting,
          streak: isCompleting ? habit.streak + 1 : Math.max(0, habit.streak - 1)
        }
      }
      return habit
    }))
  }

  const addHabit = () => {
    if (!newHabitName.trim()) return
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      name: newHabitName,
      streak: 0,
      completedToday: false,
      color: "bg-primary" // Default or randomized
    }
    setHabits([...habits, newHabit])
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
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Habit</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
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
            </div>
            <Button onClick={addHabit} disabled={!newHabitName.trim()}>Create Habit</Button>
          </DialogContent>
        </Dialog>
      </div>

      {/* Progress Header */}
      <Card className="border bg-card shadow-sm">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1">
              <h3 className="text-2xl font-bold tracking-tight">Daily Goals</h3>
              <p className="text-muted-foreground">You're <span className="text-primary font-semibold">{completionRate}%</span> done today. Keep it up!</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
          </div>
          <Progress value={completionRate} className="h-3" />
        </CardContent>
      </Card>

      {/* Habits Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {habits.map((habit) => (
          <div
            key={habit.id}
            onClick={() => toggleHabit(habit.id)}
            className={cn(
              "group relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:shadow-md cursor-pointer",
              habit.completedToday
                ? "bg-primary/5 border-primary/20"
                : "bg-card border-border hover:border-primary/30"
            )}
          >
            {/* Background Progress Fill effect could go here */}

            <div className="flex items-center justify-between relative z-10">
              <div className="space-y-1">
                <h3 className={cn(
                  "text-xl font-semibold transition-colors",
                  habit.completedToday ? "text-muted-foreground line-through" : "text-foreground"
                )}>
                  {habit.name}
                </h3>
                <div className="flex items-center gap-1.5 text-sm font-medium">
                  <Flame className={cn("h-4 w-4", habit.streak > 0 ? "fill-primary text-primary" : "text-muted-foreground")} />
                  <span className={cn(habit.streak > 0 ? "text-primary" : "text-muted-foreground")}>
                    {habit.streak} day streak
                  </span>
                </div>
              </div>

              <div className={cn(
                "h-12 w-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm border-2",
                habit.completedToday
                  ? "bg-primary border-primary scale-110"
                  : "bg-transparent border-muted-foreground/20 group-hover:border-primary/50"
              )}>
                <Check className={cn(
                  "h-6 w-6 text-primary-foreground transition-opacity duration-300",
                  habit.completedToday ? "opacity-100" : "opacity-0"
                )} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

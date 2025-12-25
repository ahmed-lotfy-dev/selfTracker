import { useState, useEffect } from "react"
import { Check, Flame, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link } from "@tanstack/react-router"

type Habit = {
  id: string
  name: string
  streak: number
  completedToday: boolean
  color: string
}

export function HabitsWidget() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [newHabitName, setNewHabitName] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Load from local storage on mount (Sync with HabitsPage)
  useEffect(() => {
    const saved = localStorage.getItem("habits")
    if (saved) {
      setHabits(JSON.parse(saved))
    } else {
      // Init default if empty (same as HabitsPage to avoid desync)
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
      color: "bg-primary"
    }
    setHabits([...habits, newHabit])
    setNewHabitName("")
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-lg">Habits</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
            {habits.filter(h => h.completedToday).length}/{habits.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Habit</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="habit-name-widget" className="text-right">Name</Label>
                  <Input
                    id="habit-name-widget"
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
          <Link to="/habits" className="text-xs text-muted-foreground hover:text-primary">
            View All
          </Link>
        </div>
      </div>

      <ScrollArea className="w-full whitespace-nowrap pb-2">
        <div className="flex w-max space-x-3 p-1">
          {habits.map((habit) => (
            <div
              key={habit.id}
              onClick={() => toggleHabit(habit.id)}
              className={cn(
                "group relative flex flex-col justify-between w-[150px] h-[100px] p-3 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-sm select-none",
                habit.completedToday
                  ? "bg-primary/5 border-primary/20"
                  : "bg-card border-border hover:border-primary/30"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                  <Flame className={cn("h-3 w-3", habit.streak > 0 && "fill-orange-500 text-orange-500")} />
                  <span>{habit.streak}</span>
                </div>
                <div className={cn(
                  "h-6 w-6 rounded-full flex items-center justify-center border transition-all",
                  habit.completedToday ? "bg-primary border-primary" : "border-muted-foreground/20 group-hover:border-primary/50"
                )}>
                  {habit.completedToday && <Check className="h-3 w-3 text-primary-foreground" />}
                </div>
              </div>

              <span className={cn(
                "font-medium text-sm truncate whitespace-normal leading-tight",
                habit.completedToday && "text-muted-foreground line-through"
              )}>
                {habit.name}
              </span>
            </div>
          ))}
          {habits.length === 0 && (
            <div className="flex flex-col items-center justify-center w-[150px] h-[100px] rounded-xl border border-dashed text-muted-foreground text-xs p-2 text-center">
              <span>No habits yet.</span>
            </div>
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}

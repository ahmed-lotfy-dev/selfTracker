import { useState } from "react"
import { Check, Flame, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link } from "@tanstack/react-router"
import { useActiveHabits, useHabitsStore } from "@/stores/useHabitsStore"
import { useUserStore } from "@/lib/user-store"

export function HabitsWidget() {
  const habits = useActiveHabits()
  const { addHabit, toggleComplete } = useHabitsStore()
  const userId = useUserStore(state => state.userId)

  const [newHabitName, setNewHabitName] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleCreate = () => {
    if (!newHabitName.trim()) return

    addHabit({
      userId: userId || 'local',
      name: newHabitName,
      color: "bg-primary",
      description: null
    })
    setNewHabitName("")
    setIsDialogOpen(false)
  }

  const toggle = (id: string) => {
    toggleComplete(id)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-lg font-orbitron">Habits</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
            {habits.filter(h => h.completedToday).length}/{habits.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-orbitron">Create New Habit</DialogTitle>
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
              <Button onClick={handleCreate} disabled={!newHabitName.trim()} className="w-full">Create Habit</Button>
            </DialogContent>
          </Dialog>
          <Link to="/habits" className="text-xs text-muted-foreground hover:text-primary transition-colors font-medium">
            View All
          </Link>
        </div>
      </div>

      <ScrollArea className="w-full whitespace-nowrap pb-2">
        <div className="flex w-max space-x-3 p-1">
          {habits.map((habit) => (
            <div
              key={habit.id}
              onClick={() => toggle(habit.id)}
              className={cn(
                "group relative flex flex-col justify-between w-[150px] h-[100px] p-3 rounded-xl border transition-all duration-300 cursor-pointer hover:shadow-md select-none",
                habit.completedToday
                  ? "bg-primary/5 border-primary/30"
                  : "bg-card border-border hover:border-primary/40"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                  <Flame className={cn("h-3 w-3 transition-colors", habit.streak > 0 ? "fill-orange-500 text-orange-500" : "text-muted-foreground/30")} />
                  <span className={cn(habit.streak > 0 && "text-orange-600 dark:text-orange-400")}>{habit.streak}</span>
                </div>
                <div className={cn(
                  "h-5 w-5 rounded-full flex items-center justify-center border transition-all duration-300",
                  habit.completedToday ? "bg-primary border-primary scale-110" : "border-muted-foreground/20 group-hover:border-primary/50"
                )}>
                  {habit.completedToday && <Check className="h-3 w-3 text-primary-foreground" />}
                </div>
              </div>

              <span className={cn(
                "font-medium text-sm truncate whitespace-normal leading-tight line-clamp-2 transition-colors",
                habit.completedToday ? "text-muted-foreground" : "text-foreground"
              )}>
                {habit.name}
              </span>
            </div>
          ))}
          {habits.length === 0 && (
            <div className="flex flex-col items-center justify-center w-[150px] h-[100px] rounded-xl border border-dashed border-muted text-muted-foreground text-xs p-2 text-center bg-muted/5">
              <span>No habits yet.</span>
            </div>
          )}
        </div>
        <ScrollBar orientation="horizontal" className="hidden" />
      </ScrollArea>
    </div>
  )
}

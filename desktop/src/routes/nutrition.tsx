import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { Settings, Plus, Trash2, Apple, ChevronLeft, ChevronRight } from "lucide-react"
import { getFoodLogs, getNutritionGoals, deleteFoodLog } from "@/services/api/nutrition"
import type { FoodLog } from "@/services/api/nutrition"

function today() {
  return new Date().toISOString().slice(0, 10)
}

export default function NutritionPage() {
  const [date, setDate] = useState(today())
  const queryClient = useQueryClient()

  const logsQ = useQuery({
    queryKey: ["foodLogs", date],
    queryFn: () => getFoodLogs(date),
  })

  const goalsQ = useQuery({
    queryKey: ["nutritionGoals"],
    queryFn: getNutritionGoals,
  })

  const meals = logsQ.data ?? []

  const handleDelete = (id: string) => {
    deleteFoodLog(id).catch(() => queryClient.invalidateQueries({ queryKey: ["foodLogs", date] }))
    queryClient.setQueryData(["foodLogs", date], (old: FoodLog[] | undefined) => {
      if (!old) return old
      return old.filter((m) => m.id !== id)
    })
  }

  const goals = goalsQ.data
  const totalCals = meals.reduce((s: number, m: FoodLog) => s + m.totalCalories, 0)
  const totalProtein = meals.reduce((s: number, m: FoodLog) => s + (m.totalProtein || 0), 0)
  const totalCarbs = meals.reduce((s: number, m: FoodLog) => s + (m.totalCarbs || 0), 0)
  const totalFat = meals.reduce((s: number, m: FoodLog) => s + (m.totalFat || 0), 0)
  const calGoal = goals?.dailyCalories ?? 2000

  const mealTypes = ["breakfast", "lunch", "dinner", "snack"] as const
  const mealLabels: Record<string, string> = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner", snack: "Snack" }

  const prevDay = () => {
    const d = new Date(date)
    d.setDate(d.getDate() - 1)
    setDate(d.toISOString().slice(0, 10))
  }
  const nextDay = () => {
    const d = new Date(date)
    d.setDate(d.getDate() + 1)
    setDate(d.toISOString().slice(0, 10))
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nutrition</h1>
          <p className="text-sm text-muted-foreground">Track your daily food intake</p>
        </div>
        <div className="flex gap-2">
          <Link to="/nutrition-add" className="flex items-center gap-1.5 px-3 py-2 bg-primary/10 border border-primary/20 rounded-lg text-xs text-primary hover:bg-primary/20 transition-colors">
            <Plus size={14} /> Log Food
          </Link>
          <Link to="/nutrition-goals" className="flex items-center gap-1.5 px-3 py-2 bg-accent border rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors">
            <Settings size={14} /> Goals
          </Link>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-center gap-4">
        <button onClick={prevDay} className="p-2 hover:bg-accent rounded-full transition-colors">
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-medium">{date}</span>
        <button onClick={nextDay} className="p-2 hover:bg-accent rounded-full transition-colors">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Daily Intake Card */}
      <div className="rounded-2xl border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Daily Intake</p>
          <div className="flex items-center gap-2">
            <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min((totalCals / calGoal) * 100, 100)}%` }} />
            </div>
            <span className="text-xs text-muted-foreground">{totalCals}/{calGoal}</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-bold text-[#0EA5E9]">{totalProtein}g</p>
            <p className="text-xs text-muted-foreground">Protein</p>
          </div>
          <div>
            <p className="text-lg font-bold text-[#F59E0B]">{totalCarbs}g</p>
            <p className="text-xs text-muted-foreground">Carbs</p>
          </div>
          <div>
            <p className="text-lg font-bold text-[#EF4444]">{totalFat}g</p>
            <p className="text-xs text-muted-foreground">Fat</p>
          </div>
        </div>
      </div>

      {/* Meal Sections */}
      {mealTypes.map((type) => {
        const items = meals.filter((m) => m.mealType === type)
        return (
          <div key={type} className="rounded-2xl border bg-card p-5">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">{mealLabels[type]}</h2>
            {items.length === 0 && <p className="text-xs text-muted-foreground/60 py-2">No items logged</p>}
            {items.map((item) => (
              <div key={item.id} className="space-y-1 py-2 border-b border-border last:border-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{item.loggedAt?.slice(11, 16)}</span>
                  <button onClick={() => handleDelete(item.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 size={12} />
                  </button>
                </div>
                {item.foodItems.map((fi, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{fi.name}</p>
                      <p className="text-xs text-muted-foreground">{fi.quantity}x {fi.unit}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{fi.calories} cal</p>
                      <p className="text-xs text-muted-foreground">P:{fi.protein} C:{fi.carbs} F:{fi.fat}</p>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )
      })}

      {meals.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-3xl border-muted">
          <Apple className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No food logged today</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Log your first meal using the AI food analyzer
          </p>
        </div>
      )}
    </div>
  )
}

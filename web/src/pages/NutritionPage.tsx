import { useState, useOptimistic } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { Settings, Plus, Trash2 } from "lucide-react"
import { getFoodLogs, getNutritionGoals, deleteFoodLog } from "../lib/api/nutritionApi"
import type { FoodLog } from "../lib/api/nutritionApi"
import Loading from "../components/Loading"
import ErrorMsg from "../components/ErrorMsg"

function today() {
  return new Date().toISOString().slice(0, 10)
}

export default function NutritionPage() {
  const [date] = useState(today())
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

  const [optimisticMeals, removeOptimistic] = useOptimistic(
    meals,
    (prev, deletedId: string) => prev.filter((m) => m.id !== deletedId)
  )

  const handleDelete = (id: string) => {
    removeOptimistic(id)
    deleteFoodLog(id).catch(() => queryClient.invalidateQueries({ queryKey: ["foodLogs", date] }))
    queryClient.setQueryData(["foodLogs", date], (old: FoodLog[] | undefined) => {
      if (!old) return old
      return old.filter((m) => m.id !== id)
    })
  }

  if (logsQ.isLoading) return <Loading />
  if (logsQ.error) return <ErrorMsg msg={(logsQ.error as Error).message} />

  const goals = goalsQ.data
  const totalCals = optimisticMeals.reduce((s: number, m: FoodLog) => s + m.totalCalories, 0)
  const totalProtein = optimisticMeals.reduce((s: number, m: FoodLog) => s + (m.totalProtein || 0), 0)
  const totalCarbs = optimisticMeals.reduce((s: number, m: FoodLog) => s + (m.totalCarbs || 0), 0)
  const totalFat = optimisticMeals.reduce((s: number, m: FoodLog) => s + (m.totalFat || 0), 0)
  const calGoal = goals?.dailyCalories ?? 2000

  const mealTypes = ["breakfast", "lunch", "dinner", "snack"] as const
  const mealLabels: Record<string, string> = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner", snack: "Snack" }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Nutrition</h1>
          <p className="text-sm text-gray-500 mt-1">{date}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/nutrition/add" className="flex items-center gap-1.5 px-3 py-2 bg-brand-green/10 border border-brand-green/20 rounded-lg text-xs text-brand-green hover:bg-brand-green/20 transition-colors"><Plus size={14} /> Log Food</Link>
          <Link to="/nutrition/goals" className="flex items-center gap-1.5 px-3 py-2 bg-bg-hover border border-bg-border rounded-lg text-xs text-gray-400 hover:text-white transition-colors"><Settings size={14} /> Goals</Link>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Daily Intake</p>
          <div className="flex items-center gap-2">
            <div className="h-2 w-32 bg-bg-hover rounded-full overflow-hidden">
              <div className="h-full bg-brand-green rounded-full" style={{ width: `${Math.min((totalCals / calGoal) * 100, 100)}%` }} />
            </div>
            <span className="text-xs text-gray-400">{totalCals}/{calGoal}</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div><p className="text-lg font-bold text-brand-blue">{totalProtein}g</p><p className="text-[11px] text-gray-500">Protein</p></div>
          <div><p className="text-lg font-bold text-brand-orange">{totalCarbs}g</p><p className="text-[11px] text-gray-500">Carbs</p></div>
          <div><p className="text-lg font-bold text-brand-red">{totalFat}g</p><p className="text-[11px] text-gray-500">Fat</p></div>
        </div>
      </div>

      {mealTypes.map((type) => {
        const items = optimisticMeals.filter((m) => m.mealType === type)
        return (
          <div key={type} className="card">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">{mealLabels[type]}</h2>
            {items.length === 0 && <p className="text-xs text-gray-600 py-2">No items logged</p>}
            {items.map((item) => (
              <div key={item.id} className="space-y-1 py-2 border-b border-bg-border last:border-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">{item.loggedAt?.slice(11, 16)}</span>
                  <button onClick={() => handleDelete(item.id)} className="text-gray-600 hover:text-red-400 transition-colors"><Trash2 size={12} /></button>
                </div>
                {item.foodItems.map((fi, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-200">{fi.name}</p>
                      <p className="text-xs text-gray-500">{fi.quantity}x {fi.unit}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-200">{fi.calories} cal</p>
                      <p className="text-xs text-gray-500">P:{fi.protein} C:{fi.carbs} F:{fi.fat}</p>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

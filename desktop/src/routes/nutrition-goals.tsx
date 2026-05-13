import { useState, useEffect } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getNutritionGoals, updateNutritionGoals } from "@/services/api/nutrition"

const defaults = { dailyCalories: 2000, proteinGrams: 150, carbsGrams: 200, fatGrams: 65 }

export default function NutritionGoalsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: goals, isLoading } = useQuery({
    queryKey: ["nutritionGoals"],
    queryFn: getNutritionGoals,
  })

  const [form, setForm] = useState(defaults)

  useEffect(() => {
    if (goals) {
      setForm({
        dailyCalories: goals.dailyCalories ?? defaults.dailyCalories,
        proteinGrams: goals.proteinGrams ?? defaults.proteinGrams,
        carbsGrams: goals.carbsGrams ?? defaults.carbsGrams,
        fatGrams: goals.fatGrams ?? defaults.fatGrams,
      })
    }
  }, [goals])

  const saveMutation = useMutation({
    mutationFn: async (data: typeof defaults) => {
      await updateNutritionGoals(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nutritionGoals"] })
      navigate({ to: "/nutrition" })
    },
  })

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>

  const fields = [
    { key: "dailyCalories" as const, label: "Daily Calories", unit: "kcal" },
    { key: "proteinGrams" as const, label: "Protein", unit: "g" },
    { key: "carbsGrams" as const, label: "Carbs", unit: "g" },
    { key: "fatGrams" as const, label: "Fat", unit: "g" },
  ]

  return (
    <div className="max-w-md mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nutrition Goals</h1>
        <p className="text-sm text-muted-foreground mt-1">Set your daily targets</p>
      </div>

      <div className="rounded-2xl border bg-card p-6 space-y-5">
        {fields.map(({ key, label }) => (
          <div key={key}>
            <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</label>
            <input type="number" value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) })}
              className="w-full mt-1 bg-accent border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/50" />
          </div>
        ))}
        <div className="flex gap-3 pt-2">
          <button onClick={() => navigate({ to: "/nutrition" })}
            className="flex-1 py-3 bg-accent border border-border rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors">
            Cancel
          </button>
          <button onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending}
            className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/80 transition-colors disabled:opacity-40">
            {saveMutation.isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  )
}

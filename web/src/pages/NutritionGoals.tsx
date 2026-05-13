import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getNutritionGoals } from "../lib/api/nutritionApi"
import { axiosInstance } from "../lib/api/config"
import Loading from "../components/Loading"

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
      await axiosInstance.put("/api/nutrition/goals", data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nutritionGoals"] })
      navigate("/nutrition")
    },
  })

  if (isLoading) return <Loading />

  const fields = [
    { key: "dailyCalories" as const, label: "Daily Calories", unit: "kcal" },
    { key: "proteinGrams" as const, label: "Protein", unit: "g" },
    { key: "carbsGrams" as const, label: "Carbs", unit: "g" },
    { key: "fatGrams" as const, label: "Fat", unit: "g" },
  ]

  return (
    <div className="max-w-md mx-auto space-y-8 pt-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Nutrition Goals</h1>
        <p className="text-sm text-gray-500 mt-1">Set your daily targets</p>
      </div>

      <div className="card space-y-5">
        {fields.map(({ key, label, unit }) => (
          <div key={key}>
            <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</label>
            <input type="number" value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) })}
              className="w-full mt-1 bg-bg-hover border border-bg-border rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-brand-blue/50" />
          </div>
        ))}
        <div className="flex gap-3 pt-2">
          <button onClick={() => navigate("/nutrition")}
            className="flex-1 py-3 bg-bg-hover border border-bg-border rounded-xl text-sm text-gray-400 hover:text-white transition-colors">
            Cancel
          </button>
          <button onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending}
            className="flex-1 py-3 bg-brand-blue rounded-xl text-sm font-medium hover:bg-brand-blue/80 transition-colors disabled:opacity-40">
            {saveMutation.isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  )
}

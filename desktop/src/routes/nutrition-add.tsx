import { useState, useRef } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, ImagePlus, X, Loader2, Check } from "lucide-react"
import { analyzeFoodImage, createFoodLog } from "@/services/api/nutrition"
import type { FoodItem, MealType } from "@/services/api/nutrition"

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack"]
const MEAL_LABELS: Record<string, string> = {
  breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner", snack: "Snack",
}

export default function NutritionAddPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)

  const [mealType, setMealType] = useState<MealType>("breakfast")
  const [imageUri, setImageUri] = useState<string | null>(null)
  const [base64Data, setBase64Data] = useState<string | null>(null)
  const [result, setResult] = useState<any | null>(null)
  const [foods, setFoods] = useState<FoodItem[]>([])
  const [analyzing, setAnalyzing] = useState(false)

  const handleFilePick = async (file: File) => {
    const uri = URL.createObjectURL(file)
    setImageUri(uri)
    const b64 = await toBase64(file)
    setBase64Data(b64)
    setResult(null)
    setFoods([])
  }

  const handleAnalyze = async () => {
    if (!base64Data) return
    setAnalyzing(true)
    try {
      const res = await analyzeFoodImage(base64Data)
      setResult(res)
      setFoods(res.foods.map(f => ({ ...f })))
    } catch (e: any) {
      console.error("Analysis failed", e)
    } finally {
      setAnalyzing(false)
    }
  }

  const updateFood = (index: number, field: keyof FoodItem, value: string | number) => {
    setFoods((prev) => prev.map((f, i) => (i === index ? { ...f, [field]: value } : f)))
  }

  const removeFood = (index: number) => {
    setFoods((prev) => prev.filter((_, i) => i !== index))
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const totalCalories = Math.round(foods.reduce((s, f) => s + f.calories, 0))
      const totalProtein = Math.round(foods.reduce((s, f) => s + f.protein, 0))
      const totalCarbs = Math.round(foods.reduce((s, f) => s + f.carbs, 0))
      const totalFat = Math.round(foods.reduce((s, f) => s + f.fat, 0))
      await createFoodLog({
        loggedAt: new Date().toISOString(),
        mealType,
        foodItems: foods,
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["foodLogs"] })
      navigate({ to: "/nutrition" })
    },
  })

  const clearImage = () => {
    setImageUri(null)
    setBase64Data(null)
    setResult(null)
    setFoods([])
  }

  return (
    <div className="max-w-lg mx-auto p-6 space-y-6">
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFilePick(e.target.files[0])} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => e.target.files?.[0] && handleFilePick(e.target.files[0])} />

      <div className="flex items-center gap-3">
        <button onClick={() => navigate({ to: "/nutrition" })} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold tracking-tight">Log Food</h1>
      </div>

      {/* Meal type selector */}
      <div className="flex gap-2">
        {MEAL_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setMealType(t)}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
              mealType === t
                ? "bg-primary text-primary-foreground"
                : "bg-accent text-muted-foreground border border-border hover:border-primary/30"
            }`}
          >
            {MEAL_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Image picker */}
      {!imageUri ? (
        <div className="flex gap-3">
          <button onClick={() => fileRef.current?.click()}
            className="flex-1 rounded-2xl border bg-card flex flex-col items-center gap-2 py-12 hover:bg-accent transition-colors cursor-pointer"
          >
            <ImagePlus size={32} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Choose from gallery</span>
          </button>
          <button onClick={() => cameraRef.current?.click()}
            className="flex-1 rounded-2xl border bg-card flex flex-col items-center gap-2 py-12 hover:bg-accent transition-colors cursor-pointer"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            <span className="text-sm text-muted-foreground">Take a photo</span>
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border bg-card relative">
          <img src={imageUri} alt="Food" className="w-full h-64 object-cover rounded-2xl" />
          <button onClick={clearImage}
            className="absolute top-3 right-3 bg-black/60 p-2 rounded-full hover:bg-black/80 transition-colors">
            <X size={16} className="text-white" />
          </button>
        </div>
      )}

      {/* Analyze button */}
      {imageUri && !result && !analyzing && (
        <button onClick={handleAnalyze}
          className="w-full py-4 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/80 transition-colors"
        >
          Analyze Food
        </button>
      )}

      {analyzing && (
        <div className="rounded-2xl border bg-card flex items-center justify-center gap-3 py-6">
          <Loader2 size={20} className="animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Analyzing with AI...</span>
        </div>
      )}

      {/* Results */}
      {foods.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Detected Foods</h2>
            {result && (
              <span className="text-xs text-muted-foreground">Confidence: {Math.round(result.confidence * 100)}%</span>
            )}
          </div>

          {foods.map((food, i) => (
            <div key={i} className="rounded-2xl border bg-card p-5">
              <div className="flex items-center justify-between mb-3">
                <input
                  value={food.name}
                  onChange={(e) => updateFood(i, "name", e.target.value)}
                  className="text-base font-semibold bg-transparent border-b border-transparent hover:border-border focus:border-primary/50 outline-none"
                />
                <button onClick={() => removeFood(i)} className="text-destructive hover:text-destructive/80">
                  <X size={16} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <label className="text-xs text-muted-foreground uppercase">Qty</label>
                  <input type="number" value={food.quantity}
                    onChange={(e) => updateFood(i, "quantity", Number(e.target.value) || 0)}
                    className="w-full bg-accent border border-border rounded-lg px-3 py-1.5 outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase">Cal</label>
                  <input type="number" value={food.calories}
                    onChange={(e) => updateFood(i, "calories", Number(e.target.value) || 0)}
                    className="w-full bg-accent border border-border rounded-lg px-3 py-1.5 outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase">Protein</label>
                  <input type="number" value={food.protein}
                    onChange={(e) => updateFood(i, "protein", Number(e.target.value) || 0)}
                    className="w-full bg-accent border border-border rounded-lg px-3 py-1.5 outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase">Carbs</label>
                  <input type="number" value={food.carbs}
                    onChange={(e) => updateFood(i, "carbs", Number(e.target.value) || 0)}
                    className="w-full bg-accent border border-border rounded-lg px-3 py-1.5 outline-none focus:border-primary/50" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-muted-foreground uppercase">Fat</label>
                  <input type="number" value={food.fat}
                    onChange={(e) => updateFood(i, "fat", Number(e.target.value) || 0)}
                    className="w-full bg-accent border border-border rounded-lg px-3 py-1.5 outline-none focus:border-primary/50" />
                </div>
              </div>
            </div>
          ))}

          <div className="rounded-2xl border bg-card p-5 bg-primary/5 border-primary/20">
            <div className="grid grid-cols-4 gap-2 text-center text-sm">
              <div><span className="text-lg font-bold">{foods.reduce((s, f) => s + f.calories, 0)}</span><p className="text-xs text-muted-foreground">Cal</p></div>
              <div><span className="text-lg font-bold text-[#0EA5E9]">{Math.round(foods.reduce((s, f) => s + f.protein, 0))}g</span><p className="text-xs text-muted-foreground">Protein</p></div>
              <div><span className="text-lg font-bold text-[#F59E0B]">{Math.round(foods.reduce((s, f) => s + f.carbs, 0))}g</span><p className="text-xs text-muted-foreground">Carbs</p></div>
              <div><span className="text-lg font-bold text-[#EF4444]">{Math.round(foods.reduce((s, f) => s + f.fat, 0))}g</span><p className="text-xs text-muted-foreground">Fat</p></div>
            </div>
          </div>

          <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || foods.length === 0}
            className="w-full py-4 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/80 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saveMutation.isPending ? (
              <><Loader2 size={16} className="animate-spin" /> Saving...</>
            ) : (
              <><Check size={16} /> Confirm & Log {MEAL_LABELS[mealType]}</>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

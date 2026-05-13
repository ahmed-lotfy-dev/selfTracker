import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, Camera, ImagePlus, X, Loader2, Check } from "lucide-react"
import { analyzeFoodImage, createFoodLog } from "../lib/api/nutritionApi"
import type { FoodItem, MealType, FoodAnalysisResult } from "../lib/api/nutritionApi"

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

export default function NutritionAdd() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)

  const [mealType, setMealType] = useState<MealType>("breakfast")
  const [imageUri, setImageUri] = useState<string | null>(null)
  const [base64Data, setBase64Data] = useState<string | null>(null)
  const [result, setResult] = useState<FoodAnalysisResult | null>(null)
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
      navigate("/nutrition")
    },
  })

  const clearImage = () => {
    setImageUri(null)
    setBase64Data(null)
    setResult(null)
    setFoods([])
  }

  return (
    <div className="max-w-lg mx-auto space-y-6 pt-6 pb-20">
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFilePick(e.target.files[0])} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => e.target.files?.[0] && handleFilePick(e.target.files[0])} />

      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/nutrition")} className="text-gray-500 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-white">Log Food</h1>
      </div>

      {/* Meal type selector */}
      <div className="flex gap-2">
        {MEAL_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setMealType(t)}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
              mealType === t
                ? "bg-brand-blue text-white"
                : "bg-white/5 text-white/40 border border-white/10 hover:border-white/30"
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
            className="flex-1 card flex flex-col items-center gap-2 py-12 hover:bg-white/5 transition-colors cursor-pointer"
          >
            <ImagePlus size={32} className="text-gray-500" />
            <span className="text-sm text-gray-500">Choose from gallery</span>
          </button>
          <button onClick={() => cameraRef.current?.click()}
            className="flex-1 card flex flex-col items-center gap-2 py-12 hover:bg-white/5 transition-colors cursor-pointer"
          >
            <Camera size={32} className="text-gray-500" />
            <span className="text-sm text-gray-500">Take a photo</span>
          </button>
        </div>
      ) : (
        <div className="card relative">
          <img src={imageUri} alt="Food" className="w-full h-64 object-cover rounded-xl" />
          <button onClick={clearImage}
            className="absolute top-3 right-3 bg-black/60 p-2 rounded-full hover:bg-black/80 transition-colors">
            <X size={16} className="text-white" />
          </button>
        </div>
      )}

      {/* Analyze button */}
      {imageUri && !result && !analyzing && (
        <button onClick={handleAnalyze}
          className="w-full py-4 bg-brand-blue rounded-xl text-sm font-semibold hover:bg-brand-blue/80 transition-colors"
        >
          Analyze Food
        </button>
      )}

      {analyzing && (
        <div className="card flex items-center justify-center gap-3 py-6">
          <Loader2 size={20} className="animate-spin text-brand-blue" />
          <span className="text-sm text-gray-400">Analyzing with AI...</span>
        </div>
      )}

      {/* Results */}
      {foods.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Detected Foods</h2>
            {result && (
              <span className="text-xs text-gray-500">Confidence: {Math.round(result.confidence * 100)}%</span>
            )}
          </div>

          {foods.map((food, i) => (
            <div key={i} className="card border-white/10">
              <div className="flex items-center justify-between mb-3">
                <input
                  value={food.name}
                  onChange={(e) => updateFood(i, "name", e.target.value)}
                  className="text-base font-semibold bg-transparent border-b border-transparent hover:border-white/20 focus:border-brand-blue/50 text-white outline-none"
                />
                <button onClick={() => removeFood(i)} className="text-red-400 hover:text-red-300">
                  <X size={16} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase">Qty</label>
                  <input type="number" value={food.quantity}
                    onChange={(e) => updateFood(i, "quantity", Number(e.target.value) || 0)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-gray-200 outline-none focus:border-brand-blue/50" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase">Cal</label>
                  <input type="number" value={food.calories}
                    onChange={(e) => updateFood(i, "calories", Number(e.target.value) || 0)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-gray-200 outline-none focus:border-brand-blue/50" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase">Protein</label>
                  <input type="number" value={food.protein}
                    onChange={(e) => updateFood(i, "protein", Number(e.target.value) || 0)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-gray-200 outline-none focus:border-brand-blue/50" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase">Carbs</label>
                  <input type="number" value={food.carbs}
                    onChange={(e) => updateFood(i, "carbs", Number(e.target.value) || 0)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-gray-200 outline-none focus:border-brand-blue/50" />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] text-gray-500 uppercase">Fat</label>
                  <input type="number" value={food.fat}
                    onChange={(e) => updateFood(i, "fat", Number(e.target.value) || 0)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-gray-200 outline-none focus:border-brand-blue/50" />
                </div>
              </div>
            </div>
          ))}

          <div className="card bg-brand-green/5 border-brand-green/20">
            <div className="grid grid-cols-4 gap-2 text-center text-sm">
              <div><span className="text-lg font-bold text-white">{foods.reduce((s, f) => s + f.calories, 0)}</span><p className="text-[10px] text-gray-500">Cal</p></div>
              <div><span className="text-lg font-bold text-brand-blue">{Math.round(foods.reduce((s, f) => s + f.protein, 0))}g</span><p className="text-[10px] text-gray-500">Protein</p></div>
              <div><span className="text-lg font-bold text-brand-orange">{Math.round(foods.reduce((s, f) => s + f.carbs, 0))}g</span><p className="text-[10px] text-gray-500">Carbs</p></div>
              <div><span className="text-lg font-bold text-brand-red">{Math.round(foods.reduce((s, f) => s + f.fat, 0))}g</span><p className="text-[10px] text-gray-500">Fat</p></div>
            </div>
          </div>

          <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || foods.length === 0}
            className="w-full py-4 bg-brand-green rounded-xl text-sm font-semibold hover:bg-brand-green/80 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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

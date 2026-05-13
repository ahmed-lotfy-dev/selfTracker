import { axiosInstance } from "./config"

export interface FoodItem {
  name: string
  quantity: number
  unit: string
  calories: number
  protein: number
  carbs: number
  fat: number
  estimatedGrams?: number
  confidence?: number
}

export type MealType = "breakfast" | "lunch" | "dinner" | "snack"

export interface FoodLog {
  id: string
  userId: string
  loggedAt: string
  mealType: MealType
  foodItems: FoodItem[]
  totalCalories: number
  totalProtein: number | null
  totalCarbs: number | null
  totalFat: number | null
  createdAt: string
}

export interface FoodAnalysisResult {
  foods: FoodItem[]
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  confidence: number
  notes?: string[]
}

export interface NutritionGoals {
  dailyCalories: number
  proteinGrams: number
  carbsGrams: number
  fatGrams: number
}

export async function analyzeFoodImage(base64Image: string): Promise<FoodAnalysisResult> {
  const res = await axiosInstance.post<FoodAnalysisResult>("/api/nutrition/analyze", {
    image: base64Image,
  })
  return res.data
}

export async function getFoodLogs(date: string): Promise<FoodLog[]> {
  const res = await axiosInstance.get<{ foodLogs: FoodLog[] }>(`/api/nutrition/logs?date=${date}`)
  return res.data.foodLogs
}

export async function createFoodLog(data: {
  loggedAt: string
  mealType: MealType
  foodItems: FoodItem[]
  totalCalories: number
  totalProtein?: number
  totalCarbs?: number
  totalFat?: number
}): Promise<FoodLog> {
  const res = await axiosInstance.post<{ foodLog: FoodLog }>("/api/nutrition/logs", data)
  return res.data.foodLog
}

export async function deleteFoodLog(id: string): Promise<void> {
  await axiosInstance.delete(`/api/nutrition/logs/${id}`)
}

export async function getNutritionGoals(): Promise<NutritionGoals | null> {
  const res = await axiosInstance.get<{ goals: NutritionGoals | null }>("/api/nutrition/goals")
  return res.data.goals
}

export type FoodItem = {
  name: string
  quantity: number
  unit: string
  calories: number
  protein: number
  carbs: number
  fat: number
  estimatedGrams?: number
  confidence?: number
  confidenceReason?: string
  nutritionSource?: "model_estimate" | "open_food_facts"
  matchedProductName?: string | null
  detectionConfidence?: number
}

export type MealType = "breakfast" | "lunch" | "dinner" | "snack"

export type FoodLog = {
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
  updatedAt: string
}

export type NutritionGoals = {
  id: string
  userId: string
  dailyCalories: number
  proteinGrams: number | null
  carbsGrams: number | null
  fatGrams: number | null
}

export type FoodAnalysisResult = {
  foods: FoodItem[]
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  confidence: number
  confidenceBreakdown?: {
    detection: number
    nutritionData: number
    portionEstimation: number
  }
  notes?: string[]
}

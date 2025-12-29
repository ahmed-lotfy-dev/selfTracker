import axiosInstance from "./axiosInstance"
import { API_BASE_URL } from "./config"
import type {
  FoodLog,
  FoodAnalysisResult,
  NutritionGoals,
  FoodItem,
  MealType
} from "@/src/types/nutrition"

export const analyzeFoodImage = async (base64Image: string): Promise<FoodAnalysisResult> => {
  const response = await axiosInstance.post(`${API_BASE_URL}/api/nutrition/analyze`, {
    image: base64Image,
  })
  return response.data
}

type GetFoodLogsParams = {
  date?: string
  mealType?: MealType
}

export const getFoodLogs = async (params?: GetFoodLogsParams): Promise<FoodLog[]> => {
  const queryParams = new URLSearchParams()
  if (params?.date) queryParams.append("date", params.date)
  if (params?.mealType) queryParams.append("mealType", params.mealType)

  const queryString = queryParams.toString()
  const url = `${API_BASE_URL}/api/nutrition/logs${queryString ? `?${queryString}` : ""}`

  const response = await axiosInstance.get(url)
  return response.data.foodLogs
}

type CreateFoodLogData = {
  id?: string
  loggedAt: Date
  mealType: MealType
  foodItems: FoodItem[]
  totalCalories: number
  totalProtein?: number
  totalCarbs?: number
  totalFat?: number
}

export const createFoodLog = async (data: CreateFoodLogData): Promise<FoodLog> => {
  const response = await axiosInstance.post(`${API_BASE_URL}/api/nutrition/logs`, {
    ...data,
    loggedAt: data.loggedAt.toISOString(),
  })
  return response.data.foodLog
}

type UpdateFoodLogData = Partial<{
  loggedAt: Date
  mealType: MealType
  foodItems: FoodItem[]
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
}>

export const updateFoodLog = async (id: string, data: UpdateFoodLogData): Promise<FoodLog> => {
  const response = await axiosInstance.patch(`${API_BASE_URL}/api/nutrition/logs/${id}`, {
    ...data,
    loggedAt: data.loggedAt?.toISOString(),
  })
  return response.data.foodLog
}

export const deleteFoodLog = async (id: string): Promise<void> => {
  await axiosInstance.delete(`${API_BASE_URL}/api/nutrition/logs/${id}`)
}

export const getNutritionGoals = async (): Promise<NutritionGoals | null> => {
  const response = await axiosInstance.get(`${API_BASE_URL}/api/nutrition/goals`)
  return response.data.goals
}

type SetNutritionGoalsData = {
  dailyCalories: number
  proteinGrams?: number
  carbsGrams?: number
  fatGrams?: number
}

export const setNutritionGoals = async (data: SetNutritionGoalsData): Promise<NutritionGoals> => {
  const response = await axiosInstance.put(`${API_BASE_URL}/api/nutrition/goals`, data)
  return response.data.goals
}

import React from "react"
import { View, Text, Pressable, Image, ScrollView, ActivityIndicator, Alert } from "react-native"
import { useState } from "react"
import { useRouter, useLocalSearchParams } from "expo-router"
import { useThemeColors } from "@/src/constants/Colors"
import Header from "@/src/components/Header"
import { Ionicons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import { analyzeFoodImage } from "@/src/lib/api/nutritionApi"
import { useNutritionStore } from "@/src/stores/useNutritionStore"
import type { FoodItem, MealType, FoodAnalysisResult } from "@/src/types/nutritionType"
import FoodResultsSheet from "@/src/features/nutrition/FoodResultsSheet"
import * as Crypto from "expo-crypto"

import { useAuth } from "@/src/features/auth/useAuthStore"

import LogFoodDateHeader from "@/src/components/features/nutrition/LogFoodDateHeader"
import MealTypeSelector from "@/src/components/features/nutrition/MealTypeSelector"
import FoodImagePicker from "@/src/components/features/nutrition/FoodImagePicker"

export default function LogFoodScreen() {
  const colors = useThemeColors()
  const router = useRouter()
  const { user } = useAuth()
  const addFoodLog = useNutritionStore((s) => s.addFoodLog)

  const [imageUri, setImageUri] = useState<string | null>(null)
  const [base64Image, setBase64Image] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<FoodAnalysisResult | null>(null)
  const [selectedMealType, setSelectedMealType] = useState<MealType>("breakfast")
  const [showResults, setShowResults] = useState(false)

  const { date } = useLocalSearchParams<{ date: string }>()
  const [selectedDate, setSelectedDate] = useState(() => {
    if (date) {
      const parsed = new Date(date)
      if (!isNaN(parsed.getTime())) return parsed
    }
    return new Date()
  })

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      Alert.alert("Permission", "Please allow access to photos.")
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    })

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri)
      setBase64Image(result.assets[0].base64 || null)
    }
  }

  const handleTakePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync()
    if (!permission.granted) return

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    })

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri)
      setBase64Image(result.assets[0].base64 || null)
    }
  }

  const handleAnalyze = async () => {
    if (!base64Image) return
    setIsAnalyzing(true)
    try {
      const result = await analyzeFoodImage(`data:image/jpeg;base64,${base64Image}`)
      setAnalysisResult(result)
      setShowResults(true)
    } catch (error: any) {
      console.error("Analysis failed:", error)
      const message = error.response?.data?.message || "Failed to analyze image"
      Alert.alert("Analysis Failed", message)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleConfirmLog = async (foods: FoodItem[], mealType: MealType) => {
    const totalCalories = Math.round(foods.reduce((sum, f) => sum + f.calories, 0))
    const totalProtein = Math.round(foods.reduce((sum, f) => sum + f.protein, 0))
    const totalCarbs = Math.round(foods.reduce((sum, f) => sum + f.carbs, 0))
    const totalFat = Math.round(foods.reduce((sum, f) => sum + f.fat, 0))

    const now = new Date()
    const logDate = new Date(selectedDate)
    logDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds())

    const tempLog = {
      id: Crypto.randomUUID(),
      userId: user?.id || 'user_local',
      loggedAt: logDate.toISOString(),
      mealType,
      foodItems: foods,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      deletedAt: null
    }

    addFoodLog(tempLog)
    router.replace('/nutrition')
  }

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate)
    newDate.setDate(selectedDate.getDate() + days)
    setSelectedDate(newDate)
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <Header title="Log Food" />
      
      <LogFoodDateHeader 
        selectedDate={selectedDate} 
        onChangeDate={changeDate} 
      />

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="py-4">
          <MealTypeSelector 
            selectedMealType={selectedMealType} 
            onSelectMealType={setSelectedMealType} 
          />

          <FoodImagePicker 
            imageUri={imageUri}
            onTakePhoto={handleTakePhoto}
            onPickImage={handlePickImage}
            onClearImage={() => {
              setImageUri(null)
              setBase64Image(null)
              setAnalysisResult(null)
            }}
          />

          {imageUri && !analysisResult && (
            <Pressable
              onPress={handleAnalyze}
              disabled={isAnalyzing}
              className="py-4 rounded-xl items-center"
              style={{ backgroundColor: colors.primary, opacity: isAnalyzing ? 0.7 : 1 }}
            >
              {isAnalyzing ? (
                <View className="flex-row items-center">
                  <ActivityIndicator color="white" />
                  <Text className="text-white font-semibold ml-2">Analyzing with AI...</Text>
                </View>
              ) : (
                <Text className="text-white font-semibold">Analyze Food</Text>
              )}
            </Pressable>
          )}
        </View>
      </ScrollView>

      {showResults && analysisResult && (
        <FoodResultsSheet
          result={analysisResult}
          mealType={selectedMealType}
          onConfirm={handleConfirmLog}
          onClose={() => setShowResults(false)}
        />
      )}
    </View>
  )
}

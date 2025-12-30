import React from "react"
import { View, Text, Pressable, Image, ScrollView, ActivityIndicator, Alert } from "react-native"
import { useState } from "react"
import { useRouter } from "expo-router"
import { useThemeColors } from "@/src/constants/Colors"
import Header from "@/src/components/Header"
import { Ionicons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import { analyzeFoodImage } from "@/src/lib/api/nutritionApi"
import { useNutritionStore } from "@/src/stores/useNutritionStore"
import type { FoodItem, MealType, FoodAnalysisResult } from "@/src/types/nutrition"
import FoodResultsSheet from "@/src/features/nutrition/FoodResultsSheet"

export default function LogFoodScreen() {
  const colors = useThemeColors()
  const router = useRouter()
  const addFoodLog = useNutritionStore((s) => s.addFoodLog)

  const [imageUri, setImageUri] = useState<string | null>(null)
  const [base64Image, setBase64Image] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<FoodAnalysisResult | null>(null)
  const [selectedMealType, setSelectedMealType] = useState<MealType>("breakfast")
  const [showResults, setShowResults] = useState(false)

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      Alert.alert("Permission", "Please allow access to photos.")
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
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
    const totalCalories = foods.reduce((sum, f) => sum + f.calories, 0)
    const totalProtein = foods.reduce((sum, f) => sum + f.protein, 0)
    const totalCarbs = foods.reduce((sum, f) => sum + f.carbs, 0)
    const totalFat = foods.reduce((sum, f) => sum + f.fat, 0)

    const now = new Date()
    const tempLog = {
      id: `temp_${Date.now()}`,
      userId: 'current_user',
      loggedAt: now.toISOString(),
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

    // Optimistic update - add immediately to store
    addFoodLog(tempLog)

    // Navigate back immediately for instant UX
    router.replace('/nutrition')
  }

  const mealTypes: { value: MealType; label: string; icon: string }[] = [
    { value: "breakfast", label: "Breakfast", icon: "sunny-outline" },
    { value: "lunch", label: "Lunch", icon: "restaurant-outline" },
    { value: "dinner", label: "Dinner", icon: "moon-outline" },
    { value: "snack", label: "Snack", icon: "cafe-outline" },
  ]

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <Header
        title="Log Food"
        leftAction={
          <Pressable onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={colors.text} />
          </Pressable>
        }
      />

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="py-4">
          <Text className="text-base font-medium mb-3" style={{ color: colors.text }}>
            Select Meal Type
          </Text>
          <View className="flex-row justify-between mb-6">
            {mealTypes.map((meal) => (
              <Pressable
                key={meal.value}
                onPress={() => setSelectedMealType(meal.value)}
                className={`items-center p-3 rounded-xl flex-1 mx-1 ${selectedMealType === meal.value ? "border-2" : ""
                  }`}
                style={{
                  backgroundColor: selectedMealType === meal.value ? colors.card : colors.border,
                  borderColor: colors.primary,
                }}
              >
                <Ionicons
                  name={meal.icon as any}
                  size={24}
                  color={selectedMealType === meal.value ? colors.primary : colors.text}
                />
                <Text
                  className="text-xs mt-1"
                  style={{ color: selectedMealType === meal.value ? colors.primary : colors.text }}
                >
                  {meal.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {imageUri ? (
            <View className="mb-4">
              <Image
                source={{ uri: imageUri }}
                className="w-full h-64 rounded-xl"
                resizeMode="cover"
              />
              <Pressable
                onPress={() => {
                  setImageUri(null)
                  setBase64Image(null)
                  setAnalysisResult(null)
                }}
                className="absolute top-2 right-2 w-8 h-8 rounded-full items-center justify-center"
                style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
              >
                <Ionicons name="close" size={20} color="white" />
              </Pressable>
            </View>
          ) : (
            <View className="flex-row gap-4 mb-6">
              <Pressable
                onPress={handleTakePhoto}
                className="flex-1 items-center justify-center p-8 rounded-xl border-2 border-dashed"
                style={{ borderColor: colors.primary }}
              >
                <Ionicons name="camera" size={48} color={colors.primary} />
                <Text className="mt-2" style={{ color: colors.text }}>Take Photo</Text>
              </Pressable>
              <Pressable
                onPress={handlePickImage}
                className="flex-1 items-center justify-center p-8 rounded-xl border-2 border-dashed"
                style={{ borderColor: colors.primary }}
              >
                <Ionicons name="images" size={48} color={colors.primary} />
                <Text className="mt-2" style={{ color: colors.text }}>Gallery</Text>
              </Pressable>
            </View>
          )}

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

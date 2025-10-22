import React, { useState } from "react"
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native"
import { Picker } from "@react-native-picker/picker"
import DatePicker from "@/src/components/DatePicker"
import DateDisplay from "@/src/components/DateDisplay"
import { useAdd } from "@/src/hooks/useAdd"
import { useRouter } from "expo-router"
import { createWeight, updateWeight } from "@/src/lib/api/weightsApi"
import { useSelectedWeight } from "@/src/store/useWeightStore"
import { useUpdate } from "@/src/hooks/useUpdate"
import { z } from "zod"
import { WeightLogSchema, WeightLogType } from "@/src/types/weightLogType"
import { useAuth } from "@/src/hooks/useAuth"
import { format } from "date-fns"
import Header from "../Header"
import { COLORS, useThemeColors } from "@/src/constants/Colors"
import Entypo from "@expo/vector-icons/Entypo"

export default function WeightForm({ isEditing }: { isEditing?: boolean }) {
  const colors = useThemeColors();
  const router = useRouter()
  const { user } = useAuth()
  const selectedWeight = useSelectedWeight()
  const [showDate, setShowDate] = useState(false)

  // Form state
  const [weight, setWeight] = useState(
    isEditing ? String(selectedWeight.weight) : ""
  )
  const [energy, setEnergy] = useState(isEditing ? selectedWeight.energy : "")
  const [mood, setMood] = useState(isEditing ? selectedWeight.mood : "")

  const [notes, setNotes] = useState(isEditing ? selectedWeight.notes : "")
  const [createdAt, setCreatedAt] = useState(
    isEditing
      ? format(new Date(selectedWeight.createdAt || ""), "yyyy-MM-dd")
      : format(new Date(), "yyyy-MM-dd")
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { addMutation } = useAdd({
    mutationFn: (weight) => createWeight(weight),
    onSuccessInvalidate: [
      { queryKey: ["weightLogs"] },
      { queryKey: ["userHomeData"] },
      { queryKey: ["weightLogsChartData"] }, // Invalidate chart data
    ],
    onSuccessCallback: () => {
      router.push("/weights")
    },
    onErrorMessage: "Failed to Save Weight Log.",
  })

  const { updateMutation } = useUpdate({
    mutationFn: (weight: WeightLogType) => updateWeight(weight),
    onSuccessInvalidate: [
      { queryKey: ["weightLogs"] },
      { queryKey: ["userHomeData"] },
      { queryKey: ["weightLogsChartData"] }, // Invalidate chart data
    ],
    onSuccessCallback: () => {
      router.push("/weights")
    },
    onErrorMessage: "Failed to Update Weight Log.",
  })

  const handleSubmit = () => {
    setIsSubmitting(true)

    const formData: WeightLogType = {
      id: isEditing ? selectedWeight.id : undefined,
      userId: user?.id || "",
      weight: Number(weight),
      mood,
      energy,
      notes,
      createdAt,
    }

    const result = WeightLogSchema.safeParse(formData)
    if (!result.success) {
      const newErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        newErrors[issue.path[0]] = issue.message
      }
      setErrors(newErrors)
      setIsSubmitting(false)
      return
    }

    if (isEditing && selectedWeight) {
      updateMutation.mutate(formData)
    } else {
      addMutation.mutate(formData)
    }

    setIsSubmitting(false)
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView className="flex-1 px-5" keyboardShouldPersistTaps="handled">
        <View>
          <Text className={`my-3 font-bold text-[${colors.text}]`}>
            Weight:
          </Text>
          <View className="flex-row items-center gap-2">
            <TextInput
              className={`flex-1 border-[1px] text-lg h-12 justify-center pl-3 border-[${colors.border}] rounded-md mb-4 text-[${colors.text}]`}
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
              placeholder="Enter your weight"
              placeholderTextColor={colors.inputText}
            />
            <Pressable
              className={`${
                !isSubmitting ? "bg-green-700" : "bg-green-400"
              } rounded-md mt-4 p-3 items-center mb-4 w-12 h-12 justify-center`}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Entypo name="plus" size={24} color="white" />
            </Pressable>
          </View>
        </View>
        {errors.weight && (
          <Text className="text-red-500 mt-2">{errors.weight}</Text>
        )}

        <View>
          <Text className={`my-3 font-bold text-[${colors.text}]`}>Energy</Text>
          <View
            className={`border-[1px] border-[${colors.border}] rounded-md mb-4 h-12 p-2 justify-center`}
          >
            <Picker
              selectedValue={energy}
              onValueChange={setEnergy}
              style={{ color: colors.inputText }}
            >
              <Picker.Item label="Select your energy" value="" />
              <Picker.Item label="Low" value="Low" />
              <Picker.Item label="Okay" value="Okay" />
              <Picker.Item label="Good" value="Good" />
              <Picker.Item label="Great" value="Great" />
            </Picker>
          </View>
        </View>
        {errors.energy && (
          <Text className="text-red-500 mt-2">{errors.energy}</Text>
        )}

        <View>
          <Text className={`my-3 font-bold text-[${colors.text}]`}>Mood</Text>
          <View
            className={`border-[1px] border-[${colors.border}] rounded-md mb-4 h-12 p-2 justify-center`}
          >
            <Picker
              selectedValue={mood}
              onValueChange={setMood}
              style={{ color: colors.inputText }}
            >
              <Picker.Item label="Select your mood" value="" />
              <Picker.Item label="Low" value="Low" />
              <Picker.Item label="Medium" value="Medium" />
              <Picker.Item label="High" value="High" />
            </Picker>
          </View>
        </View>
        {errors.mood && (
          <Text className="text-red-500 mt-2">{errors.mood}</Text>
        )}

        <View className="mb-2">
          <Text className={`my-3 font-bold text-[${colors.text}]`}>
            Weight In Date:
          </Text>
          <Pressable onPress={() => setShowDate(!showDate)}>
            <DateDisplay date={createdAt} />
          </Pressable>
          {showDate && (
            <DatePicker
              date={createdAt}
              setDate={setCreatedAt}
              showDate={showDate}
              setShowDate={setShowDate}
            />
          )}
        </View>

        <View>
          <Text className={`my-3 font-bold text-[${colors.text}]`}>Notes:</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Enter Weight In notes"
            multiline
            className={`border-[1px] text-lg h-[100px] justify-center pl-3 border-[${colors.border}] rounded-md mb-4 text-start pt-3 text-[${colors.text}]`}
            style={{ textAlignVertical: "top" }}
            placeholderTextColor={colors.inputText}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

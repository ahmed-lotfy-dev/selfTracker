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
import { Feather } from "@expo/vector-icons"
import { Picker } from "@react-native-picker/picker"
import DatePicker from "@/src/components/DatePicker"
import DateDisplay from "@/src/components/DateDisplay"
import { useRouter } from "expo-router"
import { useSelectedWeight } from "@/src/features/weight/useWeightStore"
import { WeightLogSchema } from "@/src/types/weightLogType"
import { useUser } from "@/src/features/auth/useAuthStore"
import { format } from "date-fns"
import { useThemeColors } from "@/src/constants/Colors"
import { formatLocal, formatUTC, safeParseDate } from "@/src/lib/utils/dateUtils"
import { useCollections } from "@/src/db/collections"

import Button from "@/src/components/ui/Button"
import { Section } from "@/src/components/ui/Section"

export default function WeightForm({ isEditing }: { isEditing?: boolean }) {
  const router = useRouter()
  const user = useUser()
  const selectedWeight = useSelectedWeight()
  const colors = useThemeColors()
  const collections = useCollections()
  const [showDate, setShowDate] = useState(false)

  const [weight, setWeight] = useState(
    isEditing && selectedWeight ? String(selectedWeight.weight) : ""
  )
  const [energy, setEnergy] = useState(isEditing && selectedWeight ? selectedWeight.energy || "Okay" : "Okay")
  const [mood, setMood] = useState(isEditing && selectedWeight ? selectedWeight.mood || "Medium" : "Medium")

  const [notes, setNotes] = useState(isEditing && selectedWeight ? selectedWeight.notes || "" : "")
  const [createdAt, setCreatedAt] = useState(() => {
    return formatUTC(isEditing && selectedWeight ? selectedWeight.createdAt : new Date())
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async () => {
    setIsSubmitting(true)

    const formData = {
      userId: user?.id || "",
      weight: Number(weight),
      mood: mood as "Low" | "Medium" | "High",
      energy: energy as "Low" | "Okay" | "Good" | "Great",
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

    try {
      if (isEditing && selectedWeight) {
        await collections.weightLogs.update(selectedWeight.id!, (draft: any) => {
          draft.weight = String(weight)
          draft.mood = mood
          draft.energy = energy
          draft.notes = notes
          draft.updated_at = new Date()
        })
      } else {
        await collections.weightLogs.insert({
          id: crypto.randomUUID(),
          user_id: user?.id || "",
          weight: String(weight),
          mood,
          energy,
          notes,
          created_at: formatUTC(createdAt),
          deleted_at: null,
        })
      }

      setIsSubmitting(false)
      router.push("/weights")
    } catch (e) {
      console.error("Failed to save weight log:", e)
      setIsSubmitting(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-background"
    >
      <ScrollView className="flex-1 px-4 pt-4" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        <Section title="Measurements" error={errors.weight}>
          <View className="flex-row items-center py-2 px-4">
            <View className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-full items-center justify-center mr-3">
              <Feather name="activity" size={20} color={colors.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-gray-500 text-xs">Current Weight</Text>
              <View className="flex-row items-end">
                <TextInput
                  className="text-2xl font-bold text-text p-0 mr-1"
                  keyboardType="numeric"
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="0.0"
                  placeholderTextColor="#d1d5db"
                />
                <Text className="text-gray-400 font-medium mb-1.5">kg</Text>
              </View>
            </View>
          </View>
        </Section>

        <Section title="Date" error={errors.createdAt}>
          <Pressable onPress={() => setShowDate(!showDate)} className="flex-row items-center py-3 px-4">
            <View className="w-8 items-center justify-center mr-3">
              <Feather name="calendar" size={20} color={colors.placeholder} />
            </View>
            <View className="flex-1">
              <DateDisplay date={createdAt} />
            </View>
          </Pressable>
          {showDate && (
            <View className="mt-2 px-4">
              <DatePicker
                date={createdAt}
                setDate={setCreatedAt}
                showDate={showDate}
                setShowDate={setShowDate}
              />
            </View>
          )}
        </Section>

        <Section title="Details">
          <View className="py-2 border-b border-gray-100 dark:border-gray-800 px-4">
            <Text className="text-gray-500 text-xs mb-1">Mood</Text>
            <View className="-ml-3 -my-2">
              <Picker
                selectedValue={mood}
                onValueChange={setMood}
                dropdownIconColor="#6b7280"
                style={{ color: colors.text }}
                itemStyle={{ color: colors.text }}
              >
                <Picker.Item label="High" value="High" />
                <Picker.Item label="Medium" value="Medium" />
                <Picker.Item label="Low" value="Low" />
              </Picker>
            </View>
          </View>

          <View className="py-2 mt-1 px-4">
            <Text className="text-gray-500 text-xs mb-1">Energy</Text>
            <View className="-ml-3 -my-2">
              <Picker
                selectedValue={energy}
                onValueChange={setEnergy}
                dropdownIconColor="#6b7280"
                style={{ color: colors.text }}
                itemStyle={{ color: colors.text }}
              >
                <Picker.Item label="Great" value="Great" />
                <Picker.Item label="Good" value="Good" />
                <Picker.Item label="Okay" value="Okay" />
                <Picker.Item label="Low" value="Low" />
              </Picker>
            </View>
          </View>
        </Section>

        <Section title="Notes">
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Add any additional notes..."
            multiline
            className="text-base text-text min-h-[80px] py-2 px-4"
            style={{ textAlignVertical: "top" }}
            placeholderTextColor="#9ca3af"
          />
        </Section>

        <Button
          onPress={handleSubmit}
          loading={isSubmitting}
          className={`mb-16 ${!isSubmitting ? "bg-primary" : ""}`}
        >
          {isEditing ? "Update Entry" : "Save Entry"}
        </Button>

      </ScrollView>
    </KeyboardAvoidingView>
  )
}

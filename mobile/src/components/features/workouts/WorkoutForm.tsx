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
import { useQuery } from "@tanstack/react-query"
import { fetchAllWorkouts } from "@/src/lib/api/workouts"
import { useAdd } from "@/src/hooks/useAdd"
import { createWorkout, updateWorkout } from "@/src/lib/api/workoutsApi"
import { useRouter } from "expo-router"
import { useSelectedWorkout } from "@/src/store/useWokoutStore"
import { useUpdate } from "@/src/hooks/useUpdate"
import { WorkoutLogType, WorkoutLogSchema } from "@/src/types/workoutLogType"
import { WorkoutType } from "@/src/types/workoutType"
import { useUser } from "@/src/store/useAuthStore"
import { format } from "date-fns"
import { useThemeColors } from "@/src/constants/Colors"
import { safeParseDate } from "@/src/lib/utils/dateUtils"

// UI Components
import Button from "@/src/components/ui/Button"
import { Section } from "@/src/components/ui/Section"

export default function WorkoutForm({ isEditing }: { isEditing?: boolean }) {
  const router = useRouter()
  const user = useUser()
  const selectedWorkout = useSelectedWorkout()
  const colors = useThemeColors()
  const { data } = useQuery({
    queryKey: ["workouts"],
    queryFn: fetchAllWorkouts,
    staleTime: 1000 * 60 * 60,
    gcTime: Infinity,
    retry: false,
  })
  const workouts = data?.workouts ?? []

  const selectedYear = new Date().getFullYear()
  const selectedMonth = new Date().getMonth() + 1

  const [workoutId, setWorkoutId] = useState(
    isEditing ? selectedWorkout?.workoutId || "" : ""
  )
  const [notes, setNotes] = useState(
    isEditing ? selectedWorkout?.notes || "" : ""
  )
  const [createdAt, setCreatedAt] = useState(() => {
    const rawDate = isEditing && selectedWorkout?.createdAt ? selectedWorkout.createdAt : new Date()
    return format(safeParseDate(rawDate), "yyyy-MM-dd")
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showDate, setShowDate] = useState(false)

  const { addMutation } = useAdd({
    mutationFn: (workout: WorkoutLogType) => createWorkout(workout),
    onSuccessInvalidate: [
      { queryKey: ["workoutLogs"] },
      { queryKey: ["workoutLogsCalendar", selectedMonth, selectedYear] },
      { queryKey: ["userHomeData"] },
    ],
    onSuccessCallback: () => router.push("/workouts"),
    onErrorMessage: "Failed to Add Workout Log.",
  })

  const { updateMutation } = useUpdate({
    mutationFn: (workout: WorkoutLogType) => updateWorkout(workout),
    onSuccessInvalidate: [
      { queryKey: ["workoutLogs"] },
      { queryKey: ["workoutLogsCalendar", selectedMonth, selectedYear] },
      { queryKey: ["userHomeData"] },
    ],
    onSuccessCallback: () => router.push("/workouts"),
    onErrorMessage: "Failed to Update Workout Log.",
  })

  const handleSubmit = () => {
    const workoutName =
      workouts.find((w: WorkoutType) => w.id === workoutId)?.name || ""

    const formData: WorkoutLogType = {
      id: isEditing ? selectedWorkout?.id : undefined,
      userId: user?.id,
      workoutId,
      workoutName,
      notes,
      createdAt,
    }

    const result = WorkoutLogSchema.safeParse(formData)

    if (!result.success) {
      const newErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        newErrors[issue.path[0]] = issue.message
      }
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    if (isEditing && selectedWorkout) {
      updateMutation.mutate(formData)
    } else {
      addMutation.mutate(formData)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-background"
    >
      <ScrollView
        className="flex-1 px-4 pt-4"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        {/* Workout Type */}
        <Section title="Activity" error={errors.workoutId}>
          <View className="flex-row items-center py-2 px-4">
            <View className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-full items-center justify-center mr-3">
              <Feather name="layers" size={20} color={colors.primary} />
            </View>
            <View className="flex-1 -my-2 -mr-3">
              <Picker
                selectedValue={workoutId}
                onValueChange={(val) => setWorkoutId(val)}
                dropdownIconColor={colors.placeholder}
                style={{ color: colors.text }}
                itemStyle={{ color: colors.text }}
              >
                <Picker.Item label="Select Workout Type" value="" />
                {workouts.map((w: WorkoutType) => (
                  <Picker.Item key={w.id} label={w.name} value={w.id} />
                ))}
              </Picker>
            </View>
          </View>
        </Section>

        {/* Date Selection */}
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
            <View className="mt-2 px-4 bg-card">
              <DatePicker
                date={createdAt}
                setDate={setCreatedAt}
                showDate={showDate}
                setShowDate={setShowDate}
              />
            </View>
          )}
        </Section>

        {/* Notes */}
        <Section title="Notes" error={errors.notes}>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Details about your session..."
            multiline
            className="text-base text-text min-h-[100px] py-2 px-4"
            style={{ textAlignVertical: "top" }}
            placeholderTextColor="#9ca3af"
          />
        </Section>

        {/* Submit Button */}
        <Button
          onPress={handleSubmit}
          loading={isSubmitting}
          className={`mb-16 ${!isSubmitting ? "bg-primary" : ""}`}
        >
          {isEditing ? "Update Workout" : "Log Workout"}
        </Button>

      </ScrollView>
    </KeyboardAvoidingView>
  )
}

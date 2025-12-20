import React, { useState } from "react"
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
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
  const [createdAt, setCreatedAt] = useState(
    isEditing && selectedWorkout?.createdAt
      ? format(new Date(selectedWorkout.createdAt), "yyyy-MM-dd")
      : format(new Date(), "yyyy-MM-dd")
  )

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
    // IsSubmitting handled by mutation hook or manually reset if needed, but router push happens
  }

  // Reusable Form Row Component
  const FormSection = ({ title, children, error }: any) => (
    <View className="mb-6">
      <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">{title}</Text>
      <View className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden px-4 py-2">
        {children}
      </View>
      {error && <Text className="text-red-500 text-sm mt-1 ml-1">{error}</Text>}
    </View>
  )

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-gray-50"
    >
      <ScrollView
        className="flex-1 px-4 pt-4"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        {/* Workout Type */}
        <FormSection title="Activity" error={errors.workoutId}>
          <View className="flex-row items-center py-2">
            <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center mr-3">
              <Feather name="layers" size={20} color="#3b82f6" />
            </View>
            <View className="flex-1 -my-2 -mr-3">
              <Picker
                selectedValue={workoutId}
                onValueChange={(val) => setWorkoutId(val)}
                dropdownIconColor="#6b7280"
                style={{ color: '#111827' }} // Text color
              >
                <Picker.Item label="Select Workout Type" value="" />
                {workouts.map((w: WorkoutType) => (
                  <Picker.Item key={w.id} label={w.name} value={w.id} />
                ))}
              </Picker>
            </View>
          </View>
        </FormSection>

        {/* Date Selection */}
        <FormSection title="Date" error={errors.createdAt}>
          <Pressable onPress={() => setShowDate(!showDate)} className="flex-row items-center py-3">
            <View className="w-8 items-center justify-center mr-3">
              <Feather name="calendar" size={20} color="#6b7280" />
            </View>
            <View className="flex-1">
              <DateDisplay date={createdAt} />
            </View>
          </Pressable>
          {showDate && (
            <View className="mt-2">
              <DatePicker
                date={createdAt}
                setDate={setCreatedAt}
                showDate={showDate}
                setShowDate={setShowDate}
              />
            </View>
          )}
        </FormSection>

        {/* Notes */}
        <FormSection title="Notes" error={errors.notes}>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Details about your session..."
            multiline
            className="text-base text-gray-900 min-h-[100px] py-2"
            style={{ textAlignVertical: "top" }}
            placeholderTextColor="#9ca3af"
          />
        </FormSection>

        {/* Submit Button */}
        <Pressable
          className={`rounded-2xl py-4 items-center mb-16 shadow-md shadow-blue-200 active:bg-blue-700 ${!isSubmitting ? "bg-blue-600" : "bg-gray-400"}`}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="font-bold text-white text-lg">
              {isEditing ? "Update Workout" : "Log Workout"}
            </Text>
          )}
        </Pressable>

      </ScrollView>
    </KeyboardAvoidingView>
  )
}

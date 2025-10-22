import React, { useEffect, useState } from "react"
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
} from "react-native"
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
import { z } from "zod"
import { WorkoutLogType, WorkoutLogSchema } from "@/src/types/workoutLogType"
import { WorkoutType } from "@/src/types/workoutType"
import { useAuth } from "@/src/hooks/useAuth"
import { format } from "date-fns"
import Header from "../Header"
import { useThemeColors } from "@/src/constants/Colors"

export default function WorkoutForm({ isEditing }: { isEditing?: boolean }) {
  const router = useRouter()
  const { user } = useAuth()
  const selectedWorkout = useSelectedWorkout()
  const colors = useThemeColors()
  const { data } = useQuery({
    queryKey: ["workouts"],
    queryFn: fetchAllWorkouts,
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
    isEditing
      ? format(new Date(selectedWorkout?.createdAt || ""), "yyyy-MM-dd")
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

    if (isEditing && selectedWorkout) {
      updateMutation.mutate(formData)
    } else {
      addMutation.mutate(formData)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={{ flex: 1, paddingInline: 20, paddingBlock: 5 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Workout Picker */}
        <Text className={`my-3 font-bold text-[${colors.text}]`}>
          Workout Type:
        </Text>
        <View
          className={`border-[1px] h-12 justify-center rounded-md p-1 border-[${colors.primary}]`}
        >
          <Picker
            selectedValue={workoutId}
            onValueChange={(val) => setWorkoutId(val)}
            dropdownIconColor={colors.inputText}
            selectionColor={"black"}
            style={{ color: colors.inputText }}
          >
            <Picker.Item
              label="Select a workout type"
              value=""
              style={{ color: colors.inputText }}
              color="black"
            />
            {workouts.map((w: WorkoutType) => (
              <Picker.Item key={w.id} label={w.name} value={w.id} />
            ))}
          </Picker>
        </View>
        {errors.workoutId && (
          <Text className={`mt-2 text-[${colors.error}]`}>
            {errors.workoutId}
          </Text>
        )}

        {/* Date Picker */}
        <Text className={`my-3 font-bold text-[${colors.text}]`}>
          Workout Date:
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
        {errors.createdAt && (
          <Text className={`mt-2 text-[${colors.error}]`}>
            {errors.createdAt}
          </Text>
        )}

        {/* Notes */}
        <Text className={`my-3 font-bold text-[${colors.text}]`}>Notes:</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Enter notes"
          multiline
          className={`border-[1px] text-lg h-[100px] pl-3 rounded-md mb-4 pt-3 border-[${colors.primary}] text-[${colors.inputText}]`}
          style={{ textAlignVertical: "top" }}
          placeholderTextColor={colors.inputText}
        />
        {errors.notes && (
          <Text className={`mt-2 text-[${colors.error}]`}>{errors.notes}</Text>
        )}

        {/* Submit */}

        <Pressable
          className={`${
            !isSubmitting ? "bg-green-700" : "bg-green-400"
          } rounded-md mt-4 p-3 items-center mb-16`}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text className="font-bold text-white">
            {isSubmitting ? "Adding Task..." : "Add Task"}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

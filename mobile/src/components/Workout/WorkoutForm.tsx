import React, { useEffect, useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
} from "react-native"
import { Picker } from "@react-native-picker/picker"
import DatePicker from "@/src/components/DatePicker"
import DateDisplay from "@/src/components/DateDisplay"
import { useQuery } from "@tanstack/react-query"
import { fetchAllWorkouts } from "@/src/utils/api/workouts"
import { useAdd } from "@/src/hooks/useAdd"
import { createWorkout, updateWorkout } from "@/src/utils/api/workoutsApi"
import { useRouter } from "expo-router"
import { useSelectedWorkout } from "@/src/store/useWokoutStore"
import { useUpdate } from "@/src/hooks/useUpdate"
import { z } from "zod"
import { WorkoutLogType, WorkoutLogSchema } from "@/src/types/workoutLogType"
import { WorkoutType } from "@/src/types/workoutType"
import { useAuth } from "@/src/hooks/useAuth"
import { format } from "date-fns"

export default function WorkoutForm({ isEditing }: { isEditing?: boolean }) {
  const router = useRouter()
  const { user } = useAuth()
  const selectedWorkout = useSelectedWorkout()
  const { data } = useQuery({
    queryKey: ["workouts"],
    queryFn: fetchAllWorkouts,
  })
  const workouts = data?.workouts ?? []

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
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showDate, setShowDate] = useState(false)

  const { addMutation } = useAdd({
    mutationFn: (workout: WorkoutLogType) => createWorkout(workout),
    onSuccessInvalidate: [
      { queryKey: ["workoutLogs"] },
      { queryKey: ["workoutLogsCalendar"] },
      { queryKey: ["userHomeData"] },
    ],
    onSuccessCallback: () => router.push("/workouts"),
    onErrorMessage: "Failed to Add Workout Log.",
  })

  const { updateMutation } = useUpdate({
    mutationFn: (workout: WorkoutLogType) => updateWorkout(workout),
    onSuccessInvalidate: [
      { queryKey: ["workoutLogs"] },
      { queryKey: ["workoutLogsCalendar"] },
      { queryKey: ["userHomeData"] },
    ],
    onSuccessCallback: () => router.push("/workouts"),
    onErrorMessage: "Failed to Update Workout Log.",
  })

  const handleSubmit = () => {
    const workoutName =
      workouts.find((w: WorkoutLogType) => w.id === workoutId)?.name || ""

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
        style={{ flex: 1, padding: 10, marginTop: 80 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Workout Picker */}
        <Text className="my-3 font-bold">Workout Type:</Text>
        <View className="border-[1px] border-primary h-12 justify-center rounded-md p-4">
          <Picker
            selectedValue={workoutId}
            onValueChange={(val) => setWorkoutId(val)}
          >
            <Picker.Item label="Select a workout type" value="" />
            {workouts.map((w: WorkoutType) => (
              <Picker.Item key={w.id} label={w.name} value={w.id} />
            ))}
          </Picker>
        </View>
        {errors.workoutId && (
          <Text className="text-red-500 mt-2">{errors.workoutId}</Text>
        )}

        {/* Date Picker */}
        <Text className="my-3 font-bold">Workout Date:</Text>
        <TouchableOpacity onPress={() => setShowDate(!showDate)}>
          <DateDisplay date={createdAt} />
        </TouchableOpacity>
        {showDate && (
          <DatePicker
            date={createdAt}
            setDate={setCreatedAt}
            showDate={showDate}
            setShowDate={setShowDate}
          />
        )}
        {errors.createdAt && (
          <Text className="text-red-500 mt-2">{errors.createdAt}</Text>
        )}

        {/* Notes */}
        <Text className="my-3 font-bold">Notes:</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Enter notes"
          multiline
          className="border-[1px] text-lg h-[100px] pl-3 border-primary rounded-md mb-4 pt-3"
          style={{ textAlignVertical: "top" }}
        />
        {errors.notes && (
          <Text className="text-red-500 mt-2">{errors.notes}</Text>
        )}

        {/* Submit */}
        <TouchableOpacity
          className="bg-slate-700 rounded-md mt-4 items-center p-3 mb-16"
          onPress={handleSubmit}
        >
          <Text className="font-bold text-white">
            {isEditing ? "Update Workout" : "Save Workout"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

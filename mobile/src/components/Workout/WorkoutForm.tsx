import { useEffect, useState } from "react"
import { useForm } from "@tanstack/react-form"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native"
import { Picker } from "@react-native-picker/picker"
import DatePicker from "@/src/components/DatePicker"
import DateDisplay from "@/src/components/DateDisplay"
import { useQuery } from "@tanstack/react-query"
import { fetchAllWorkouts } from "@/src/utils/api/workouts"
import { useAdd } from "@/src/hooks/useAdd"
import { createWorkout, updateWorkout } from "@/src/utils/api/workoutsApi"
import { useRouter } from "expo-router"
import dayjs from "dayjs"
import { useSelectedWorkout } from "@/src/store/useWokoutStore"
import { useUpdate } from "@/src/hooks/useUpdate"
import { useDirtyFields } from "@/src/hooks/useDirtyFields"
import { z } from "zod"
import { WorkoutLogType } from "@/src/types/workoutLogType"
import { WorkoutType, WorkoutSchema } from "@/src/types/workoutType"
import { useAuth } from "@/src/hooks/useAuth"

export default function WorkoutForm({ isEditing }: { isEditing?: boolean }) {
  const router = useRouter()
  const [showDate, setShowDate] = useState(false)
  const { user } = useAuth()
  const selectedWorkout = useSelectedWorkout()

  const { data } = useQuery({
    queryKey: ["workouts"],
    queryFn: fetchAllWorkouts,
  })

  const workouts = data?.workouts ?? []

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

  const form = useForm({
    onSubmit: async ({ value }) => {
      onFormSubmit(value)
    },
    defaultValues: {
      id: selectedWorkout?.id ?? "",
      userId: user?.id ?? "",
      workoutId: isEditing ? selectedWorkout?.workoutId ?? "" : "",
      workoutName: isEditing ? selectedWorkout?.workoutName ?? "" : "",
      notes: isEditing ? selectedWorkout?.notes ?? "" : "",
      createdAt: isEditing
        ? dayjs(selectedWorkout?.createdAt).format("YYYY-MM-DD")
        : dayjs().format("YYYY-MM-DD"),
    },
  })

  const dirtyFields = useDirtyFields(form)

  const onFormSubmit = (value: WorkoutLogType) => {
    const selectedWorkoutItem = workouts?.find(
      (w: WorkoutLogType) => w.id === value.workoutId
    )

    const fullWorkoutData = {
      ...value,
      workoutName: selectedWorkoutItem?.name || "",
    }

    if (isEditing && selectedWorkout) {
      const payload = dirtyFields.reduce(
        (acc: any, name) => {
          acc[name] = fullWorkoutData[name as keyof WorkoutLogType]
          return acc
        },
        { id: selectedWorkout.id, workoutName: selectedWorkoutItem?.name || "" }
      )
      updateMutation.mutate(payload)
    } else {
      addMutation.mutate(fullWorkoutData)
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
        {/* Hidden Fields */}
        <form.Field name="userId">
          {(field) => (
            <TextInput
              value={field.state.value}
              onChangeText={field.handleChange}
              className="hidden"
            />
          )}
        </form.Field>

        <form.Field name="workoutName">
          {(field) => (
            <TextInput
              value={field.state.value}
              onChangeText={field.handleChange}
              className="hidden"
            />
          )}
        </form.Field>

        {isEditing && (
          <form.Field name="id">
            {(field) => (
              <TextInput
                value={field.state.value}
                onChangeText={field.handleChange}
                className="hidden"
              />
            )}
          </form.Field>
        )}

        {/* Workout Picker */}
        <form.Field
          name="workoutId"
          validators={{
            onChangeAsyncDebounceMs: 300,
            onChangeAsync: async (value) => {
              const result = WorkoutSchema.shape.id.safeParse(
                value.fieldApi.state.value
              )
              return result.success ? undefined : result.error.issues[0].message
            },
          }}
        >
          {(field) => (
            <View className="">
              <Text className="my-3 font-bold">Workout Type:</Text>
              <View className="border-[1px] border-primary h-12 justify-center rounded-md p-4">
                <Picker
                  selectedValue={field.state.value}
                  onValueChange={field.handleChange}
                >
                  <Picker.Item label="Select a workout type" value="" />
                  {workouts?.map((option: WorkoutType) => (
                    <Picker.Item
                      key={option.id}
                      label={option.name}
                      value={option.id}
                    />
                  ))}
                </Picker>
              </View>
              {field.state.meta.errors.length > 0 && (
                <Text className="text-red-500 mt-2">
                  {field.state.meta.errors[0]}
                </Text>
              )}
            </View>
          )}
        </form.Field>

        {/* Date Picker */}
        <form.Field
          name="createdAt"
          validators={{
            onChangeAsyncDebounceMs: 300,
            onChangeAsync: async (value) => {
              const result = WorkoutSchema.shape.createdAt.safeParse(
                value.fieldApi.state.value
              )
              return result.success ? undefined : result.error.issues[0].message
            },
          }}
        >
          {(field) => (
            <View>
              <Text className="my-3 font-bold">Workout Date:</Text>
              <TouchableOpacity onPress={() => setShowDate(!showDate)}>
                <DateDisplay date={field.state.value} />
              </TouchableOpacity>
              {showDate && (
                <DatePicker
                  date={field.state.value}
                  setDate={field.handleChange}
                  showDate={showDate}
                  setShowDate={setShowDate}
                />
              )}
              {field.state.meta.errors.length > 0 && (
                <Text className="text-red-500 mt-2">
                  {field.state.meta.errors[0]}
                </Text>
              )}
            </View>
          )}
        </form.Field>

        {/* Notes Input */}
        <form.Field name="notes">
          {(field) => (
            <View>
              <Text className="my-3 font-bold">Notes:</Text>
              <TextInput
                value={field.state.value || ""}
                onBlur={field.handleBlur}
                onChangeText={field.handleChange}
                placeholder="Enter notes"
                multiline
                className="border-[1px] text-lg h-[100px] pl-3 border-primary rounded-md mb-4 pt-3"
                style={{ textAlignVertical: "top" }}
              />
              {field.state.meta.errors.length > 0 && (
                <Text className="text-red-500 mt-2">
                  {field.state.meta.errors[0]}
                </Text>
              )}
            </View>
          )}
        </form.Field>

        {/* Submit Button */}
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <TouchableOpacity
              className={`${
                canSubmit ? "bg-slate-700" : "bg-gray-300"
              } rounded-md mt-4 items-center p-3 mb-16`}
              onPress={() => form.handleSubmit()}
              disabled={!canSubmit}
            >
              <Text className="font-bold text-white">
                {isSubmitting ? "Submitting..." : "Save Workout"}
              </Text>
            </TouchableOpacity>
          )}
        </form.Subscribe>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

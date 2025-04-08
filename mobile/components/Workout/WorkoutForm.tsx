import { useState } from "react"
import { WorkoutType } from "@/types/workoutType"
import { useForm } from "@tanstack/react-form"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native"
import { Picker } from "@react-native-picker/picker"
import DatePicker from "@/components/DatePicker"
import DateDisplay from "@/components/DateDisplay"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { fetchAllWorkouts } from "@/utils/api/workouts"
import { useUser } from "@/store/useAuthStore"
import { useAdd } from "@/hooks/useAdd"
import { createWorkout, updateWorkout } from "@/utils/api/workoutsApi"
import { useRouter } from "expo-router"
import dayjs from "dayjs"
import { useSelectedWorkout } from "@/store/useWokoutStore"
import { useUpdate } from "@/hooks/useUpdate"
import { useDirtyFields } from "@/hooks/useDirtyFields"

export default function WorkoutForm({ isEditing }: { isEditing?: boolean }) {
  const router = useRouter()
  const [showDate, setShowDate] = useState(false)
  const user = useUser()
  const queryClient = useQueryClient()
  const year = new Date().getFullYear()
  const month = new Date().getMonth() + 1
  const selectedWorkout = useSelectedWorkout()

  const { data: workouts } = useQuery({
    queryKey: ["workouts"],
    queryFn: fetchAllWorkouts,
    initialData: [],
  })

  const { addMutation } = useAdd({
    mutationFn: (workout: WorkoutType) => createWorkout(workout),
    onSuccessInvalidate: [
      { queryKey: ["workoutLogs"] },
      { queryKey: ["workoutLogsCalendar"] },
    ],
    onSuccessCallback: () => {
      router.navigate("/workouts")
    },
    onErrorMessage: "Failed to Add Workout Log.",
  })

  const { updateMutation } = useUpdate({
    mutationFn: (workout: WorkoutType) => updateWorkout(workout),
    onSuccessInvalidate: [
      { queryKey: ["workoutLogs"] },
      { queryKey: ["workoutLogsCalendar"] },
    ],
    onSuccessCallback: () => {
      router.navigate("/workouts")
    },
    onErrorMessage: "Failed to Update Workout Log.",
  })

  const form = useForm({
    onSubmit: async ({ value }) => {
      console.log({ Value: value })
      onFormSubmit({ value })
    },

    defaultValues: {
      id: selectedWorkout?.id,
      userId: isEditing ? user?.id : user?.id,
      workoutId: isEditing ? selectedWorkout?.workoutId : "",
      notes: isEditing ? selectedWorkout?.notes : "",
      createdAt: isEditing
        ? dayjs(selectedWorkout?.createdAt).format("YYYY-MM-DD")
        : dayjs(new Date()).format("YYYY-MM-DD"),
    } as WorkoutType,
  })

  const dirtyFields = useDirtyFields(form)

  const onFormSubmit = async ({ value }: { value: WorkoutType }) => {
    if (isEditing && selectedWorkout) {
      const payload = dirtyFields.reduce(
        (acc: { [key: string]: any }, name) => {
          acc[name as keyof WorkoutType] = value[name as keyof WorkoutType]
          return acc
        },
        { id: selectedWorkout.id }
      )

      updateMutation.mutate(payload)
    } else {
      addMutation.mutate(value)
    }
  }

  return (
    <SafeAreaView className="flex-1 mt-14">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1 px-5 justify-center"
          keyboardShouldPersistTaps="handled"
        >
          <form.Field
            name="userId"
            children={(field) => (
              <TextInput
                className="hidden"
                value={field.state.value}
                onChangeText={field.handleChange}
              />
            )}
          />

          {isEditing && (
            <form.Field
              name="id"
              children={(field) => (
                <TextInput
                  className="hidden"
                  value={field.state.value}
                  onChangeText={field.handleChange}
                />
              )}
            />
          )}

          <form.Field
            name="workoutId"
            children={(field) => (
              <View className="mb-4">
                <Text className="mb-3">Workout Type:</Text>
                <View className="border-2 border-primary h-12 justify-center text-600 rounded-md">
                  <Picker
                    selectedValue={field.state.value}
                    onValueChange={field.handleChange}
                  >
                    <Picker.Item label="Select a workout type" value="" />
                    {workouts.map((option: any, idx: any) => (
                      <Picker.Item
                        key={option.id}
                        label={`${option.name}`}
                        value={option.id}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            )}
          />
          <form.Field
            name="createdAt"
            children={(field) => (
              <View className="">
                <Text className="mb-2">Workout Date:</Text>
                <TouchableOpacity onPress={() => setShowDate(!showDate)}>
                  <DateDisplay date={field.state.value} />
                </TouchableOpacity>

                {showDate && (
                  <DatePicker
                    date={field.state.value}
                    setDate={(date: any) => {
                      field.handleChange(date)
                    }}
                    showDate={showDate}
                    setShowDate={setShowDate}
                  />
                )}
                {field.state.meta.errors && (
                  <Text className="text-red-500 mt-2">
                    {field.state.meta.errors}
                  </Text>
                )}
              </View>
            )}
          />

          <form.Field
            name="notes"
            children={(field) => (
              <View>
                <Text className="mb-2">Notes:</Text>
                <TextInput
                  className=""
                  value={field.state.value || ""}
                  onBlur={field.handleBlur}
                  onChangeText={field.handleChange}
                  placeholder="Enter workout notes"
                  multiline
                  style={{
                    borderWidth: 1,
                    borderColor: "#ccc",
                    borderRadius: 4,
                    padding: 20,
                    minHeight: 100,
                  }}
                />
                {field.state.meta.errors && (
                  <Text className="text-red-500 mt-2">
                    {field.state.meta.errors}
                  </Text>
                )}
              </View>
            )}
          />

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
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
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

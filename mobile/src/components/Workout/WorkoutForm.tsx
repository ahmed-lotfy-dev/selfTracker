import { useEffect, useState } from "react"
import { WorkoutType } from "@/src/types/workoutType"
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
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { fetchAllWorkouts } from "@/src/utils/api/workouts"
import { useUser } from "@/src/store/useAuthStore"
import { useAdd } from "@/src/hooks/useAdd"
import { createWorkout, updateWorkout } from "@/src/utils/api/workoutsApi"
import { useRouter } from "expo-router"
import dayjs from "dayjs"
import { useSelectedWorkout } from "@/src/store/useWokoutStore"
import { useUpdate } from "@/src/hooks/useUpdate"
import { useDirtyFields } from "@/src/hooks/useDirtyFields"

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
  })

  console.log(workouts)
  const { addMutation } = useAdd({
    mutationFn: (workout: WorkoutType) => createWorkout(workout),
    onSuccessInvalidate: [
      { queryKey: ["workoutLogs"] },
      { queryKey: ["workoutLogsCalendar"] },
    ],
    onSuccessCallback: () => {
      router.push("/workouts")
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
      router.push("/workouts")
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
      workoutName: isEditing ? selectedWorkout?.workoutName : "",
      notes: isEditing ? selectedWorkout?.notes : "",
      createdAt: isEditing
        ? dayjs(selectedWorkout?.createdAt).format("YYYY-MM-DD")
        : dayjs(new Date()).format("YYYY-MM-DD"),
    } as WorkoutType,
  })

  const dirtyFields = useDirtyFields(form)

  const onFormSubmit = async ({ value }: { value: WorkoutType }) => {
    const selectedWorkoutItem = workouts?.find(
      (w: WorkoutType) => w.id === value.workoutId
    )

    const fullWorkoutData = {
      ...value,
      workoutName: selectedWorkoutItem?.name || "",
    }

    if (isEditing && selectedWorkout) {
      const payload = dirtyFields.reduce(
        (acc: { [key: string]: any }, name) => {
          acc[name as keyof WorkoutType] =
            fullWorkoutData[name as keyof WorkoutType]
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
      <ScrollView className="flex-1 px-5" keyboardShouldPersistTaps="handled">
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

        <form.Field
          name="workoutName"
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
            name="workoutName"
            children={(field) => (
              <TextInput
                className="hidden"
                value={field.state.value}
                onChangeText={field.handleChange}
              />
            )}
          />
        )}

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
            <View className="mt-32">
              <Text className="my-3 font-bold">Workout Type:</Text>
              <View className="border-[1px] border-primary h-12 justify-center text-600 rounded-md p-4">
                <Picker
                  selectedValue={field.state.value}
                  onValueChange={field.handleChange}
                >
                  <Picker.Item
                    label="Select a workout type"
                    value=""
                    style={{ paddingLeft: 3 }}
                  />
                  {workouts &&
                    workouts.map((option: any, idx: any) => (
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
              <Text className="my-3 font-bold">Workout Date:</Text>
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
              {field.state.meta.errors.length > 0 && (
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
              <Text className="my-3 font-bold">Notes:</Text>
              <TextInput
                value={field.state.value || ""}
                onBlur={field.handleBlur}
                onChangeText={field.handleChange}
                placeholder="Enter Weight In notes"
                multiline
                className="border-[1px] text-lg h-[100px] justify-center pl-3 border-primary text-600 rounded-md mb-4 text-start pt-3"
                style={{ textAlignVertical: "top" }}
              />
              {field.state.meta.errors.length > 0 && (
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
  )
}

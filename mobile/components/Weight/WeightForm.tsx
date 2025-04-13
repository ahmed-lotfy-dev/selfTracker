import React, { useState } from "react"
import { WeightType } from "@/types/weightType"
import { useForm, useStore } from "@tanstack/react-form"
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
import DatePicker from "@/components/DatePicker"
import DateDisplay from "@/components/DateDisplay"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useUser } from "@/store/useAuthStore"
import { useAdd } from "@/hooks/useAdd"
import { useRouter } from "expo-router"
import dayjs from "dayjs"
import { createWeight, updateWeight } from "@/utils/api/weightsApi"
import { useSelectedWeight } from "@/store/useWeightStore"
import { useUpdate } from "@/hooks/useUpdate"
import { useDirtyFields } from "@/hooks/useDirtyFields"

export default function WeightForm({ isEditing }: { isEditing?: boolean }) {
  const router = useRouter()
  const [showDate, setShowDate] = useState(false)
  const user = useUser()
  const queryClient = useQueryClient()
  const selectedWeight = useSelectedWeight()

  const { addMutation } = useAdd({
    mutationFn: (weight) => createWeight(weight),
    onSuccessInvalidate: [{ queryKey: ["weightLogs"] }],
    onSuccessCallback: () => {
      router.push("/weights")
    },
    onErrorMessage: "Failed to Save Weight Log.",
  })

  const { updateMutation } = useUpdate({
    mutationFn: (weight) => updateWeight(weight),
    onSuccessInvalidate: [{ queryKey: ["weightLogs"] }],
    onSuccessCallback: () => {
      router.push("/weights")
    },
    onErrorMessage: "Failed to Update Weight Log.",
  })

  const form = useForm({
    onSubmit: async ({ value }) => {
      onFormSubmit({ value })
    },

    defaultValues: {
      id: selectedWeight?.id,
      userId: user?.id,
      weight: isEditing ? selectedWeight?.weight : 0,
      mood: isEditing ? selectedWeight?.mood : "",
      energy: isEditing ? selectedWeight?.energy : "",
      notes: isEditing ? selectedWeight?.notes : "",
      createdAt: isEditing
        ? dayjs(selectedWeight?.createdAt).format("YYYY-MM-DD")
        : dayjs(new Date()).format("YYYY-MM-DD"),
    } as WeightType,
  })

  const dirtyFields = useDirtyFields(form)

  const onFormSubmit = async ({ value }: { value: WeightType }) => {
    if (isEditing && selectedWeight) {
      const payload = dirtyFields.reduce(
        (acc: { [key: string]: any }, name) => {
          acc[name as keyof WeightType] = value[name as keyof WeightType]
          return acc
        },
        { id: selectedWeight.id }
      )

      updateMutation.mutate(payload)
    } else {
      addMutation.mutate(value)
    }
  }

  return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1 px-5"
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
            name="weight"
            children={(field) => (
              <View className="mt-14">
                <Text className="mb-2">Weight:</Text>
                <TextInput
                  className="border-2 text-lg h-10 justify-center pl-3 border-primary text-600 rounded-md mb-4"
                  keyboardType="number-pad"
                  value={String(field.state.value || "")}
                  onBlur={field.handleBlur}
                  onChangeText={(text) => field.handleChange(Number(text))}
                  placeholder="Enter your weight"
                />
                {field.state.meta.errors && (
                  <Text className="text-red-500 mt-2">
                    {field.state.meta.errors}
                  </Text>
                )}
              </View>
            )}
          />

          <form.Field
            name="energy"
            children={(field) => (
              <View className="mb-4">
                <Text className="mb-2">Energy</Text>
                <Picker
                  className="w-full h-full px-4 py-2"
                  selectedValue={field.state.value}
                  onValueChange={field.handleChange}
                >
                  <Picker.Item label="Select your energy" value="" />
                  <Picker.Item label="Low" value="Low" />
                  <Picker.Item label="Okay" value="Okay" />
                  <Picker.Item label="Good" value="Good" />
                  <Picker.Item label="Great" value="Great" />
                </Picker>
              </View>
            )}
          />

          <form.Field
            name="mood"
            children={(field) => (
              <View className="mt-2 mb-4">
                <Text className="mb2">Mood</Text>
                <Picker
                  className="w-full h-full px-4 py-2"
                  selectedValue={field.state.value}
                  onValueChange={field.handleChange}
                >
                  <Picker.Item label="Select your mood" value="" />
                  <Picker.Item label="Low" value="Low" />
                  <Picker.Item label="Medium" value="Medium" />
                  <Picker.Item label="High" value="High" />
                </Picker>
              </View>
            )}
          />

          <form.Field
            name="createdAt"
            children={(field) => (
              <View className="mb-2">
                <Text className="mb-2">Weight In Date:</Text>
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
                  <Text style={{ color: "red", marginTop: 4 }}>
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
                <Text className="mb-3">Notes:</Text>
                <TextInput
                  value={field.state.value || ""}
                  onBlur={field.handleBlur}
                  onChangeText={field.handleChange}
                  placeholder="Enter Weight In notes"
                  multiline
                  style={{
                    borderWidth: 1,
                    borderColor: "#ccc",
                    borderRadius: 4,
                    padding: 8,
                    minHeight: 100,
                  }}
                />
                {field.state.meta.errors && (
                  <Text className="color-red-500 mt-2">
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
                } rounded-md mt-4 p-3 items-center mb-16`}
                onPress={() => form.handleSubmit()}
                disabled={!canSubmit}
              >
                <Text className="font-bold text-white">
                  {isSubmitting
                    ? "Submitting..."
                    : isEditing
                    ? "Update Weight Log"
                    : "Save Weight Log"}
                </Text>
              </TouchableOpacity>
            )}
          />
        </ScrollView>
      </KeyboardAvoidingView>
  )
}

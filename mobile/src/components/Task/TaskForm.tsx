import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { TaskSchema, TaskType } from "@/src/types/taskType"
import { useForm } from "@tanstack/react-form"
import { useAuth } from "../../hooks/useAuth"
import dayjs from "dayjs"
import { COLORS } from "../../constants/Colors"
import { useAdd } from "../../hooks/useAdd"
import { createTask } from "../../utils/api/tasksApi"

interface TaskFormProps {}

export default function TaskForm({}: TaskFormProps) {
  const { user } = useAuth()
  const [error, setError] = useState("")

  const { addMutation } = useAdd({
    mutationFn: (task: TaskType) => createTask(task),
    onSuccessInvalidate: [{ queryKey: ["tasks"] }],
    onSuccessCallback() {
      console.log("Task added successfully")
    },
    onErrorMessage: "Failed to Add Task Log.",
  })

  const form = useForm({
    onSubmit: async ({ value }) => {
      console.log(value)
      addMutation.mutate({ ...value })
      form.reset()
    },
    defaultValues: {
      userId: user?.id || "",
      title: "",
      completed: false,
      dueDate: null,
      category: "general",
      createdAt: dayjs(new Date()).format("YYYY-MM-DD"),
    } as TaskType,
  })

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <form.Field
        name="userId"
        children={(field) => (
          <TextInput
            className="hidden"
            value={field.state.value || ""}
            onChangeText={field.handleChange}
          />
        )}
      />

      <form.Field
        name="title"
        validators={{
          onChangeAsyncDebounceMs: 200,
          onChangeAsync: (value) => {
            const result = TaskSchema.shape.title.safeParse(
              value.fieldApi.state.value
            )
            return result.success ? undefined : result.error.issues[0].message
          },
        }}
        children={(field) => (
          <View className="my-2">
            <TextInput
              className="p-2 border border-gray-500 rounded-md outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
              placeholder="Task Title..."
              value={field.state.value || ""}
              onChangeText={field.handleChange}
              onSubmitEditing={() => {
                if (form.state.canSubmit) {
                  form.handleSubmit()
                }
              }}
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
              canSubmit ? "bg-slate-700" : "bg-gray-500"
            } rounded-md mt-4 p-3 items-center mb-16`}
            onPress={() => form.handleSubmit()}
            disabled={!canSubmit}
          >
            <Text className="font-bold text-white">
              {isSubmitting ? "Adding Task..." : "Add Task"}
            </Text>
          </TouchableOpacity>
        )}
      />
    </KeyboardAvoidingView>
  )
}

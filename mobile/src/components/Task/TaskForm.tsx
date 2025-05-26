import React, { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { TaskSchema, TaskType } from "@/src/types/taskType"
import { useAuth } from "../../hooks/useAuth"
import { COLORS } from "../../constants/Colors"
import { useAdd } from "../../hooks/useAdd"
import { createTask } from "../../lib/api/tasksApi"
import { format } from "date-fns"

export default function TaskForm() {
  const { user } = useAuth()
  const [title, setTitle] = useState("")
  const [titleError, setTitleError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { addMutation } = useAdd({
    mutationFn: (task: TaskType) => createTask(task),
    onSuccessInvalidate: [
      { queryKey: ["tasks"] },
      { queryKey: ["userHomeData"] },
    ],
    onSuccessCallback() {
      console.log("Task added successfully")
    },
    onErrorMessage: "Failed to Add Task Log.",
  })

  const handleSubmit = () => {
    const result = TaskSchema.shape.title.safeParse(title.trim())

    if (!result.success) {
      setTitleError(result.error.issues[0].message)
      return
    }

    setTitleError("")
    setIsSubmitting(true)

    const task: any = {
      userId: user?.id || "",
      title: title.trim(),
      category: "general",
    }

    addMutation.mutate(task, {
      onSuccess: () => {
        setTitle("")
        setIsSubmitting(false)
      },
      onError: () => {
        setIsSubmitting(false)
      },
    })
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="w-full"
    >
      <View className="my-2">
        <TextInput
          className="p-2 border border-gray-500 rounded-md outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
          placeholder="Task Title..."
          value={title}
          onChangeText={setTitle}
          onSubmitEditing={handleSubmit}
        />
        {titleError ? (
          <Text className="text-red-500 mt-2">{titleError}</Text>
        ) : null}
      </View>

      <TouchableOpacity
        className={`${
          !isSubmitting ? "bg-slate-700" : "bg-gray-500"
        } rounded-md mt-4 p-3 items-center mb-16`}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        <Text className="font-bold text-white">
          {isSubmitting ? "Adding Task..." : "Add Task"}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  )
}

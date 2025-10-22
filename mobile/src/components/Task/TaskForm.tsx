import React, { useState } from "react"
import {
  View,
  Text,
  TextInput,
  Pressable,
  Platform,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { TaskSchema, TaskType } from "@/src/types/taskType"
import { useAuth } from "../../hooks/useAuth"
import { COLORS } from "../../constants/Colors"
import { useAdd } from "../../hooks/useAdd"
import { createTask } from "../../lib/api/tasksApi"
import { format } from "date-fns"
import { KeyboardAvoidingView } from "react-native-keyboard-controller"

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
      <View className="flex-row items-center mb-5">
        <TextInput
          className="flex-1  border border-gray-500 pl-3 rounded-md  focus:border-blue-500 focus:ring-1 focus:ring-blue-400 text-inputText"
          placeholder="Task Title..."
          value={title}
          onChangeText={setTitle}
          onSubmitEditing={handleSubmit}
          placeholderTextColor={COLORS.placeholder}
        />
        <Pressable
          className={`${
            !isSubmitting ? "bg-green-700" : "bg-green-400"
          } rounded-md px-3 py-2.5 items-center ml-2`}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Ionicons name="add" size={24} color="white" />
        </Pressable>
      </View>
      {titleError ? (
        <Text className="text-red-500 mt-2">{titleError}</Text>
      ) : null}
    </KeyboardAvoidingView>
  )
}

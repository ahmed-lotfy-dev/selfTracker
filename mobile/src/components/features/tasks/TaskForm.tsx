import React, { useState } from "react"
import {
  View,
  Text,
  TextInput,
  Pressable,
  Platform,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { TaskSchema } from "@/src/types/taskType"
import { useUser } from "@/src/store/useAuthStore"
import { COLORS } from "@/src/constants/Colors"
import { useAdd } from "@/src/hooks/useAdd"
import { createTask } from "@/src/lib/api/tasksApi"
import { KeyboardAvoidingView } from "react-native-keyboard-controller"

export default function TaskForm() {
  const user = useUser()
  const [title, setTitle] = useState("")
  const [titleError, setTitleError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { addMutation } = useAdd({
    mutationFn: createTask,
    onSuccessInvalidate: [
      { queryKey: ["tasks"] },
      { queryKey: ["userHomeData"] },
    ],
    onSuccessCallback() {
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
      <View className="flex-row items-center bg-card rounded-2xl p-2 mx-1 my-1 shadow-sm border border-border">
        <TextInput
          className="flex-1 ml-3 text-base text-text"
          placeholder="What needs to be done?"
          value={title}
          onChangeText={setTitle}
          onSubmitEditing={handleSubmit}
          placeholderTextColor="#9ca3af"
        />
        <Pressable
          className={`${!isSubmitting ? "bg-primary" : "bg-emerald-400"
            } w-10 h-10 rounded-xl items-center justify-center shadow-sm shadow-emerald-200`}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Ionicons name="add" size={24} color="white" />
        </Pressable>
      </View>
      {titleError ? (
        <Text className="text-red-500 text-xs ml-2 mb-2">{titleError}</Text>
      ) : null}
    </KeyboardAvoidingView>
  )
}

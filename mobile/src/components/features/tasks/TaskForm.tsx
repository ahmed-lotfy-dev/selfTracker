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
import { useUser } from "@/src/features/auth/useAuthStore"
import axiosInstance from "@/src/lib/api/axiosInstance"
import { KeyboardAvoidingView } from "react-native-keyboard-controller"

export default function TaskForm() {
  const user = useUser()
  const [title, setTitle] = useState("")
  const [titleError, setTitleError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    const result = TaskSchema.shape.title.safeParse(title.trim())

    if (!result.success) {
      setTitleError(result.error.issues[0].message)
      return
    }

    setTitleError("")
    setIsSubmitting(true)

    try {
      const now = new Date()
      const newTask = {
        id: crypto.randomUUID(),
        title: title.trim(),
        category: "general",
        completed: false,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      }

      console.log('[TaskForm] Creating task via API:', newTask)
      const resp = await axiosInstance.post('/api/tasks', newTask)
      console.log('[TaskForm] Task created successfully, ElectricSQL will sync:', resp.data)
      setTitle("")
    } catch (e) {
      console.error("[TaskForm] Failed to add task:", e)
    } finally {
      setIsSubmitting(false)
    }
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

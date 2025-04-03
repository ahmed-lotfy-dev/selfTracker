import React, { useState, useEffect } from "react"
import { View, Text, TextInput, TouchableOpacity } from "react-native"
import { TaskType } from "@/types/taskType"

interface TaskFormProps {
  onSubmit: (taskData: { title: string; description?: string }) => void
  initialTask?: TaskType | null
  submitButtonText?: string
}

export default function TaskForm({
  onSubmit,
  initialTask = null,
  submitButtonText = "Add Task",
}: TaskFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title)
      setDescription(initialTask.description || "")
    } else {
      setTitle("")
      setDescription("")
    }
  }, [initialTask])

  const handleSubmit = () => {
    if (!title.trim()) {
      setError("Title is required.")
      return
    }
    setError("")
    onSubmit({ title, description })

    if (!initialTask) {
      setTitle("")
      setDescription("")
    }
  }

  return (
    <View className="p-4 bg-white m-5">
      {error ? <Text className="text-red-500 mb-2">{error}</Text> : null}

      <View className="mb-4">
        <Text className="text-lg font-medium text-gray-800 mb-1">Title</Text>
        <TextInput
          className="border border-gray-300 rounded-md p-3 text-base bg-gray-50"
          value={title}
          onChangeText={setTitle}
          placeholder="Task title"
          autoCapitalize="sentences"
        />
      </View>

      <View className="mb-4">
        <Text className="text-lg font-medium text-gray-800 mb-1">
          Description (Optional)
        </Text>
        <TextInput
          className="border border-gray-300 rounded-md p-3 text-base bg-gray-50 h-20"
          value={description}
          onChangeText={setDescription}
          placeholder="Task description"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity
        className="bg-green-800 py-3 rounded-md items-center"
        onPress={handleSubmit}
      >
        <Text className="text-white text-lg font-medium">Add Task </Text>
      </TouchableOpacity>
    </View>
  )
}

import { View, Text, Pressable, TextInput } from "react-native"
import { TaskType } from "@/src/types/taskType"
import { useDelete } from "@/src/hooks/useDelete"
import { deleteTask, updateTask } from "@/src/lib/api/tasksApi"
import { useUpdate } from "@/src/hooks/useUpdate"
import React, { useState, useRef } from "react"
import { MaterialIcons, Ionicons } from "@expo/vector-icons"
import { COLORS } from "@/src/constants/Colors"
import ActivitySpinner from "@/src/components/ActivitySpinner"
import { Swipeable } from "react-native-gesture-handler"

interface TaskListItemProps {
  task: TaskType
}

export default function TaskListItem({ task }: TaskListItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(task.title)
  const inputRef = useRef<TextInput>(null)
  const swipeableRef = useRef<Swipeable>(null)

  const { deleteMutation } = useDelete({
    mutationFn: () => deleteTask(String(task.id)),
    onSuccessInvalidate: [{ queryKey: ["tasks"] }, { queryKey: ["userHomeData"] }],
    confirmTitle: "Delete Task",
    confirmMessage: "Are you sure you want to delete this task?",
  })

  const { updateMutation } = useUpdate({
    mutationFn: (data: { id: string; completed?: boolean; title?: string }) =>
      updateTask({ ...task, ...data }),
    onSuccessInvalidate: [
      { queryKey: ["tasks"] },
      { queryKey: ["userHomeData"] },
    ],
  })

  const toggleTask = () => {
    if (!isEditing) {
      updateMutation.mutate({ id: task.id, completed: !task.completed })
    }
  }

  const startEditing = () => {
    setEditedTitle(task.title)
    setIsEditing(true)
    swipeableRef.current?.close()
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const saveEdit = () => {
    const trimmed = editedTitle.trim()
    if (trimmed && trimmed !== task.title) {
      updateMutation.mutate({ id: task.id, title: trimmed })
    }
    setIsEditing(false)
  }

  const cancelEdit = () => {
    setEditedTitle(task.title)
    setIsEditing(false)
  }

  const handleDelete = () => {
    swipeableRef.current?.close()
    deleteMutation.mutate()
  }

  const renderRightActions = () => {
    return (
      <View className="flex-row items-center ml-2 h-[85%] pr-2">
        <Pressable
          onPress={startEditing}
          className="w-12 h-full bg-blue-500 rounded-l-2xl items-center justify-center mr-[1px]"
        >
          <MaterialIcons name="edit" size={24} color="white" />
        </Pressable>
        <Pressable
          onPress={handleDelete}
          className="w-12 h-full bg-red-500 rounded-r-2xl items-center justify-center"
        >
          {deleteMutation.isPending ? (
            <ActivitySpinner size="small" color="white" />
          ) : (
            <MaterialIcons name="delete-outline" size={24} color="white" />
          )}
        </Pressable>
      </View>
    )
  }

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      containerStyle={{ marginBottom: 12 }}
    >
      <Pressable
        className={`flex-row items-center p-4 bg-white rounded-2xl shadow-sm border ${task.completed ? "border-gray-100 bg-gray-50/50" : "border-gray-100"
          }`}
        onPress={toggleTask}
      >
        {/* Custom Checkbox */}
        <Pressable
          onPress={(e) => {
            e.stopPropagation()
            toggleTask()
          }}
          className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-4 ${task.completed ? "bg-green-500 border-green-500" : "border-gray-300 bg-white"
            }`}
        >
          {task.completed && <Ionicons name="checkmark" size={16} color="white" />}
        </Pressable>

        {/* Content */}
        <View className="flex-1 mr-2">
          {isEditing ? (
            <View>
              <TextInput
                ref={inputRef}
                value={editedTitle}
                onChangeText={setEditedTitle}
                className="text-base font-medium text-gray-800 p-0 m-0 mb-2"
                autoFocus
                multiline
              />
              <View className="flex-row justify-end gap-3 mt-1">
                <Pressable onPress={cancelEdit} className="p-1">
                  <Ionicons name="close-circle" size={28} color="#ef4444" />
                </Pressable>
                <Pressable onPress={saveEdit} className="p-1">
                  <Ionicons name="checkmark-circle" size={28} color="#22c55e" />
                </Pressable>
              </View>
            </View>
          ) : (
            <View>
              <Text
                className={`text-base font-medium shrink ${task.completed ? "text-gray-400 line-through" : "text-gray-800"
                  }`}
              >
                {task.title.slice(0, 1).toUpperCase() + task.title.slice(1)}
              </Text>
              {task.category && task.category !== "general" && (
                <View className="self-start bg-gray-100 px-2 py-0.5 rounded-md mt-1">
                  <Text className="text-xs text-gray-500 uppercase font-medium">{task.category}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </Pressable>
    </Swipeable>
  )
}

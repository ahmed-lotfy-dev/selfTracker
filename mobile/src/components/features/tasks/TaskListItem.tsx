import { View, Text, Pressable, TextInput } from "react-native"
import Animated, { FadeIn, FadeOutRight, LinearTransition } from "react-native-reanimated"
import React, { useState, useRef } from "react"
import { MaterialIcons, Ionicons } from "@expo/vector-icons"
import { useThemeColors } from "@/src/constants/Colors"
import { Swipeable } from "react-native-gesture-handler"
import { useAlertStore } from "@/src/features/ui/useAlertStore"
import { useTasksStore } from "@/src/stores/useTasksStore"

type TaskItem = {
  id: string
  title: string
  completed: boolean
  category?: string
}

interface TaskListItemProps {
  task: TaskItem
  index?: number
  onToggle?: () => void
}

export default function TaskListItem({ task, index = 0, onToggle }: TaskListItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(task.title)
  const inputRef = useRef<TextInput>(null)
  const swipeableRef = useRef<Swipeable>(null)
  const colors = useThemeColors()
  const { showAlert } = useAlertStore()

  const updateTask = useTasksStore((s) => s.updateTask)
  const deleteTask = useTasksStore((s) => s.deleteTask)

  const handleToggle = () => {
    if (isEditing) return
    if (onToggle) {
      onToggle()
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
      updateTask(task.id, { title: trimmed })
    }
    setIsEditing(false)
  }

  const cancelEdit = () => {
    setEditedTitle(task.title)
    setIsEditing(false)
  }

  const handleDelete = () => {
    swipeableRef.current?.close()
    showAlert(
      "Delete Task",
      "Are you sure you want to delete this task?",
      () => deleteTask(task.id),
      () => { },
      "Delete",
      "Cancel"
    )
  }

  const renderRightActions = () => {
    return (
      <View className="flex-row items-center ml-2 h-[85%] pr-2">
        <Pressable
          onPress={startEditing}
          className="w-12 h-full bg-primary rounded-l-2xl items-center justify-center mr-px"
        >
          <MaterialIcons name="edit" size={24} color={colors.card} />
        </Pressable>
        <Pressable
          onPress={handleDelete}
          className="w-12 h-full bg-error rounded-r-2xl items-center justify-center"
        >
          <MaterialIcons name="delete-outline" size={24} color={colors.card} />
        </Pressable>
      </View>
    )
  }

  return (
    <Animated.View
      entering={FadeIn.delay(Math.min(index * 35, 500)).duration(400)}
      exiting={FadeOutRight.duration(300)}
      layout={LinearTransition.duration(400)}
      className="px-4"
    >
      <Swipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        containerStyle={{ marginBottom: 12 }}
      >
        <Pressable
          className={`flex-row items-center p-4 bg-card rounded-2xl shadow-sm border ${task.completed ? "border-border bg-background/50" : "border-border"
            }`}
          onPress={handleToggle}
          onLongPress={startEditing}
        >
          <Pressable
            onPress={(e) => {
              e.stopPropagation()
              handleToggle()
            }}
            className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-4 ${task.completed ? "bg-primary border-primary" : "border-placeholder bg-card"
              }`}
          >
            {task.completed && <Ionicons name="checkmark" size={16} color={colors.card} />}
          </Pressable>

          <View className="flex-1 mr-2">
            {isEditing ? (
              <View>
                <TextInput
                  ref={inputRef}
                  value={editedTitle}
                  onChangeText={setEditedTitle}
                  className="text-base font-medium text-text p-0 m-0 mb-2"
                  autoFocus
                  multiline
                />
                <View className="flex-row justify-end gap-3 mt-1">
                  <Pressable onPress={cancelEdit} className="p-1">
                    <Ionicons name="close-circle" size={28} color={colors.error} />
                  </Pressable>
                  <Pressable onPress={saveEdit} className="p-1">
                    <Ionicons name="checkmark-circle" size={28} color={colors.primary} />
                  </Pressable>
                </View>
              </View>
            ) : (
              <View>
                <Text
                  className={`text-base font-medium shrink ${task.completed ? "text-placeholder line-through" : "text-text"
                    }`}
                >
                  {task.title ? (task.title.slice(0, 1).toUpperCase() + task.title.slice(1)) : 'Untitled'}
                </Text>
                {task.category && task.category !== "general" && (
                  <View className="self-start bg-secondary/10 px-2 py-0.5 rounded-md mt-1">
                    <Text className="text-xs text-secondary/80 uppercase font-medium">{task.category}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </Pressable>
      </Swipeable>
    </Animated.View>
  )
}

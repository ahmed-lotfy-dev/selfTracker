import { View, Text, Pressable, TextInput } from "react-native"
import Animated, { FadeIn, FadeOutRight, LinearTransition } from "react-native-reanimated"
import React, { useState, useRef } from "react"
import { MaterialIcons, Ionicons } from "@expo/vector-icons"
import { useThemeColors } from "@/src/constants/Colors"
import { Swipeable } from "react-native-gesture-handler"
import { useAlertStore } from "@/src/features/ui/useAlertStore"
import { useTasksStore } from "@/src/stores/useTasksStore"
import { PremiumCard } from "../../ui/PremiumCard"

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
      <View className="flex-row items-center ml-2 h-full pr-1">
        <Pressable
          onPress={startEditing}
          className="w-12 h-16 bg-white/5 rounded-xl items-center justify-center mr-1 border border-white/5"
        >
          <MaterialIcons name="edit" size={20} color="white" />
        </Pressable>
        <Pressable
          onPress={handleDelete}
          className="w-12 h-16 bg-red-500/10 rounded-xl items-center justify-center border border-red-500/10"
        >
          <MaterialIcons name="delete-outline" size={20} color="#ef4444" />
        </Pressable>
      </View>
    )
  }

  return (
    <Animated.View
      entering={FadeIn.delay(Math.min(index * 35, 500)).duration(400)}
      exiting={FadeOutRight.duration(300)}
      layout={LinearTransition.duration(400)}
      className="px-2"
    >
      <Swipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        containerStyle={{ marginBottom: 12 }}
      >
        <PremiumCard 
          onPress={handleToggle}
          onLongPress={startEditing}
          gradientColors={task.completed 
            ? ['rgba(255,255,255,0.02)', 'rgba(255,255,255,0.01)'] 
            : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']
          }
          containerStyle={`border-white/5 ${task.completed ? "opacity-60" : ""}`}
        >
          <View className="flex-row items-center">
            <Pressable
              onPress={(e) => {
                e.stopPropagation()
                handleToggle()
              }}
              className={`w-6 h-6 rounded-lg border-2 items-center justify-center mr-4 ${task.completed ? "bg-white border-white" : "border-white/20 bg-white/5"
                }`}
            >
              {task.completed && <Ionicons name="checkmark" size={16} color="black" />}
            </Pressable>

            <View className="flex-1">
              {isEditing ? (
                <View>
                  <TextInput
                    ref={inputRef}
                    value={editedTitle}
                    onChangeText={setEditedTitle}
                    className="text-base font-black text-white p-0 m-0 mb-2 tracking-tighter"
                    autoFocus
                    multiline
                  />
                  <View className="flex-row justify-end gap-3 mt-1">
                    <Pressable onPress={cancelEdit} className="p-1">
                      <Ionicons name="close-circle" size={28} color="rgba(255,255,255,0.3)" />
                    </Pressable>
                    <Pressable onPress={saveEdit} className="p-1">
                      <Ionicons name="checkmark-circle" size={28} color="white" />
                    </Pressable>
                  </View>
                </View>
              ) : (
                <View>
                  <Text
                    className={`text-base font-black tracking-tighter ${task.completed ? "text-white/30 line-through" : "text-white"
                      }`}
                  >
                    {task.title ? (task.title.slice(0, 1).toUpperCase() + task.title.slice(1)) : 'Untitled'}
                  </Text>
                  {task.category && task.category !== "general" && (
                    <View className="self-start bg-white/5 px-2 py-0.5 rounded-md mt-1.5 border border-white/5">
                      <Text className="text-[9px] text-white/40 uppercase font-black tracking-widest">{task.category}</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>
        </PremiumCard>
      </Swipeable>
    </Animated.View>
  )
}

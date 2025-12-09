import { View, Text, Pressable } from "react-native"
import { TaskType } from "@/src/types/taskType"
import { useDelete } from "@/src/hooks/useDelete"
import { deleteTask, updateTask } from "@/src/lib/api/tasksApi"
import { useUpdate } from "@/src/hooks/useUpdate"
import React from "react"
import { MaterialIcons, Ionicons } from "@expo/vector-icons"
import { COLORS } from "@/src/constants/Colors"
import ActivitySpinner from "@/src/components/ActivitySpinner"

interface TaskListItemProps {
  task: TaskType
}

export default function TaskListItem({ task }: TaskListItemProps) {
  const { deleteMutation } = useDelete({
    mutationFn: () => deleteTask(String(task.id)),
    onSuccessInvalidate: [{ queryKey: ["tasks"] }, { queryKey: ["userHomeData"] }],
    confirmTitle: "Delete Task",
    confirmMessage: "Are you sure you want to delete this task?",
  })

  const { updateMutation } = useUpdate({
    mutationFn: () => updateTask({ id: task.id, completed: !task.completed }),
    onSuccessInvalidate: [
      { queryKey: ["tasks"] },
      { queryKey: ["userHomeData"] },
    ],
  })

  const toggleTask = () => {
    updateMutation.mutate({ id: task.id, completed: !task.completed })
  }

  return (
    <Pressable
      className={`flex-row items-center p-4 mb-3 bg-white rounded-2xl shadow-sm border ${
        task.completed ? "border-gray-100 bg-gray-50/50" : "border-gray-100"
      }`}
      onPress={toggleTask}
    >
        {/* Custom Checkbox */}
        <Pressable 
            onPress={(e) => {
                e.stopPropagation()
                toggleTask()
            }}
            className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-4 ${
                task.completed ? "bg-green-500 border-green-500" : "border-gray-300 bg-white"
            }`}
        >
            {task.completed && <Ionicons name="checkmark" size={16} color="white" />}
        </Pressable>

        {/* Content */}
        <View className="flex-1 mr-2">
            <Text
            className={`text-base font-medium ${
                task.completed ? "text-gray-400 line-through" : "text-gray-800"
            }`}
            numberOfLines={1}
            >
                {task.title.slice(0, 1).toUpperCase() + task.title.slice(1)}
            </Text>
            {task.category && task.category !== "general" && (
                <View className="self-start bg-gray-100 px-2 py-0.5 rounded-md mt-1">
                    <Text className="text-xs text-gray-500 uppercase font-medium">{task.category}</Text>
                </View>
            )}
        </View>

        {/* Delete Action */}
        <Pressable
            onPress={(e) => {
                e.stopPropagation()
                deleteMutation.mutate()
            }}
            disabled={deleteMutation.isPending}
            className="w-8 h-8 items-center justify-center rounded-full active:bg-red-50"
        >
             {deleteMutation.isPending ? (
                 <ActivitySpinner size="small" color={COLORS.error || "#ef4444"} />
             ) : (
                <MaterialIcons name="delete-outline" size={20} color={COLORS.error || "#ef4444"} />
             )}
        </Pressable>
    </Pressable>
  )
}

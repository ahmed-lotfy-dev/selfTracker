import { View, Text, Pressable, Switch } from "react-native"
import { TaskType } from "@/src/types/taskType"
import { useDelete } from "@/src/hooks/useDelete"
import { deleteTask, updateTask } from "@/src/lib/api/tasksApi"
import DeleteButton from "../Buttons/DeleteButton"
import { useUpdate } from "@/src/hooks/useUpdate"
import React from "react"

interface TaskListItemProps {
  task: TaskType
}

export default function TaskListItem({ task }: TaskListItemProps) {
  const { deleteMutation } = useDelete({
    mutationFn: () => deleteTask(String(task.id)),
    onSuccessInvalidate: [{ queryKey: ["tasks"] }],
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

  return (
    <Pressable
      onPress={() => updateMutation.mutate({ id: task.id, completed: !task.completed })}
      className="flex-row items-center justify-between p-4 my-2 bg-white rounded-lg shadow-md"
    >
      <View className="flex-row items-center">
        <Switch
          value={task.completed}
          onValueChange={() => updateMutation.mutate({ id: task.id, completed: !task.completed })}
        />
        <View className="flex-1 ml-3">
          <Text
            className={`text-lg ${
              task.completed ? "line-through text-gray-500" : "text-gray-900"
            }`}
          >
            {task.title.slice(0, 1).toUpperCase() + task.title.slice(1)}
          </Text>
          <Text className="text-sm font-light text-gray-600 mt-1">{task.category}</Text>
        </View>
        <DeleteButton onPress={() => deleteMutation.mutate()} />
      </View>
    </Pressable>
  )
}

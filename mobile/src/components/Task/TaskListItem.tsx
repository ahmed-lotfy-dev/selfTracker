import { View, Text, TouchableOpacity, Switch } from "react-native"
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
    <>
      <Switch
        value={task.completed}
        onValueChange={() => updateMutation.mutate({ id: task.id, completed: !task.completed })}
      />
      {/* <TouchableOpacity className="" onPress={() => updateMutation.mutate()}> */}
      <View className="w-full flex-row items-center justify-between p-2 border-slate-500 border-[1px] gap-4">
        <Text
          className={`text-lg flex-1 px-2 text-wrap w-[50] ${
            task.completed && "line-through font-light"
          }`}
        >
          {task.title.slice(0, 1).toUpperCase() + task.title.slice(1)}
        </Text>
        <Text className="text-sm font-light">{task.category}</Text>
        <DeleteButton onPress={() => deleteMutation.mutate()} />
      </View>
      {/* </TouchableOpacity> */}
    </>
  )
}

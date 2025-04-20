import { View, Text, TouchableOpacity } from "react-native"
import { TaskType } from "@/src/types/taskType"

interface TaskListItemProps {
  task: TaskType
  onPress: () => void
}

export default function TaskListItem({ task }: TaskListItemProps) {
  return (
    <View className="my-1 flex-1">
      <View className=" items-center justify-between p-4 gap-3 mx-5 border-primary border-[1px]">
        <Text className="text-lg font-bold">{task.title}</Text>
        <Text className="text-sm">{task.description}</Text>
        <Text className="text-sm">
          {task.completed ? "Completed" : "Not Completed"}
        </Text>
        <Text className="text-sm">{task.category}</Text>
      </View>
    </View>
  )
}

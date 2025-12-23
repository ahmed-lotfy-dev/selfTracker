import { View, Text, Pressable } from "react-native"
import React from "react"
import { MaterialIcons } from "@expo/vector-icons"
import { useThemeColors } from "@/src/constants/Colors"
import { Swipeable } from "react-native-gesture-handler"
import { useAlertStore } from "@/src/features/ui/useAlertStore"
import { useRouter } from "expo-router"
import { useWorkoutActions } from "@/src/features/workouts/useWorkoutStore"
import { safeParseDate } from "@/src/lib/utils/dateUtils"
import { format } from "date-fns"
import { workoutLogCollection } from "@/src/db/collections"

interface WorkoutLogItemProps {
  item: {
    id: string
    workoutName: string
    notes?: string | null
    createdAt: any
  }
  path: string
}

export default function WorkoutLogItem({ item, path }: WorkoutLogItemProps) {
  const colors = useThemeColors()
  const { showAlert } = useAlertStore()
  const router = useRouter()
  const { setSelectedWorkout } = useWorkoutActions()
  const swipeableRef = React.useRef<Swipeable>(null)

  const handlePress = () => {
    setSelectedWorkout(item as any)
    router.push(`${path}/${item.id}` as any)
  }

  const handleDelete = () => {
    swipeableRef.current?.close()
    showAlert(
      "Delete Workout Log",
      "Are you sure you want to delete this entry?",
      () => workoutLogCollection.delete(item.id),
      () => { },
      "Delete",
      "Cancel"
    )
  }

  const renderRightActions = () => (
    <View className="flex-row items-center ml-2 h-[85%] pr-2">
      <Pressable
        onPress={handleDelete}
        className="w-12 h-full bg-error rounded-2xl items-center justify-center"
      >
        <MaterialIcons name="delete-outline" size={24} color={colors.card} />
      </Pressable>
    </View>
  )

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      containerStyle={{ marginBottom: 12, marginHorizontal: 8 }}
    >
      <Pressable
        onPress={handlePress}
        className="bg-card rounded-2xl p-4 border border-border"
      >
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-lg font-bold text-text">{item.workoutName}</Text>
            <Text className="text-sm text-placeholder mt-1">
              {format(safeParseDate(item.createdAt), "MMM dd, yyyy")}
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={colors.placeholder} />
        </View>
      </Pressable>
    </Swipeable>
  )
}

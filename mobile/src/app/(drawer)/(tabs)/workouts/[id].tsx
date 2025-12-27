import { View, Text, ScrollView, Alert } from "react-native"
import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import React, { useMemo } from "react"
import BackButton from "@/src/components/Buttons/BackButton"
import { useThemeColors } from "@/src/constants/Colors"
import { useWorkoutsStore } from "@/src/stores/useWorkoutsStore"
import Button from "@/src/components/ui/Button"
import { Feather, FontAwesome5 } from "@expo/vector-icons"
import { format } from "date-fns"

export default function WorkoutLog() {
  const router = useRouter()
  const { id } = useLocalSearchParams()
  const colors = useThemeColors()

  const workoutLogs = useWorkoutsStore(s => s.workoutLogs)
  const deleteWorkoutLog = useWorkoutsStore(s => s.deleteWorkoutLog)

  const log = useMemo(() =>
    workoutLogs.find(l => l.id === id),
    [workoutLogs, id]
  )

  const handleDelete = () => {
    Alert.alert(
      "Delete Workout",
      "Are you sure you want to delete this workout log?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            if (typeof id === 'string') {
              deleteWorkoutLog(id)
              router.back()
            }
          }
        }
      ]
    )
  }

  if (!log) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Stack.Screen options={{ headerShown: true, title: "Workout Details" }} />
        <Text className="text-placeholder">Log not found.</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Workout Details",
          headerLeft: () => <BackButton />,
          headerRight: () => (
            <Feather
              name="edit-2"
              size={20}
              color={colors.primary}
              onPress={() => router.push(`/workouts/edit?id=${id}`)}
            />
          )
        }}
      />

      <ScrollView className="flex-1 p-5">

        {/* Header Card */}
        <View className="bg-card rounded-3xl p-6 border border-border mb-6">
          <View className="flex-row items-center gap-3 mb-2">
            <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
              <FontAwesome5 name="dumbbell" size={18} color={colors.primary} />
            </View>
            <View>
              <Text className="text-sm text-placeholder font-medium">Workout</Text>
              <Text className="text-xl font-bold text-text">{log.workoutName}</Text>
            </View>
          </View>

          <View className="mt-4 pt-4 border-t border-border flex-row items-center gap-2">
            <Feather name="calendar" size={16} color={colors.placeholder} />
            <Text className="text-base text-text font-medium">
              {format(new Date(log.createdAt), "EEEE, MMMM do, yyyy")}
            </Text>
          </View>
          <Text className="text-xs text-placeholder mt-1 ml-6">
            {format(new Date(log.createdAt), "h:mm a")}
          </Text>
        </View>

        {/* Notes Card */}
        {log.notes ? (
          <View className="bg-card rounded-3xl p-6 border border-border mb-6">
            <Text className="text-sm text-placeholder font-bold uppercase mb-3 tracking-wider">Notes</Text>
            <Text className="text-base text-text leading-6">{log.notes}</Text>
          </View>
        ) : (
          <View className="bg-card rounded-3xl p-6 border border-border mb-6 border-dashed opacity-70">
            <Text className="text-center text-placeholder italic">No notes for this workout.</Text>
          </View>
        )}

      </ScrollView>

      <View className="p-5 pb-8 border-t border-border bg-background">
        <Button
          onPress={handleDelete}
          variant="outline"
          className="border-red-500/50"
          textClassName="text-red-500"
        >
          Delete Workout
        </Button>
      </View>
    </View>
  )
}

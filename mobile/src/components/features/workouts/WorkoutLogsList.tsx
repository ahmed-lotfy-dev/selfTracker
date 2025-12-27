import React from "react"
import { View, Text, ScrollView, Pressable } from "react-native"
import { useThemeColors } from "@/src/constants/Colors"
import { FontAwesome5 } from "@expo/vector-icons"

import { useWorkoutsStore } from "@/src/stores/useWorkoutsStore"
import { useRouter } from "expo-router"

interface WorkoutLogsListProps {
  headerElement?: React.ReactNode
}

export const WorkoutLogsList = ({ headerElement }: WorkoutLogsListProps) => {
  const colors = useThemeColors()
  const router = useRouter()
  const workoutLogs = useWorkoutsStore(s => s.workoutLogs)

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 150 }}
    >
      {headerElement}
      {workoutLogs.length === 0 ? (
        <View className="items-center justify-center py-16 border-2 border-dashed rounded-3xl mx-2 opacity-50" style={{ borderColor: colors.border }}>
          <View className="w-16 h-16 rounded-full items-center justify-center mb-4 bg-black/5 dark:bg-white/5">
            <FontAwesome5 name="dumbbell" size={24} color={colors.text} style={{ opacity: 0.5 }} />
          </View>
          <Text className="text-lg font-bold mb-1 text-text">No workouts yet</Text>
          <Text className="text-sm text-center px-8 text-placeholder">
            Workout tracking will be available once sync is enabled.
          </Text>
        </View>
      ) : (
        Array.from(new Map(workoutLogs.map((item: any) => [item.id, item])).values()).map((log: any) => (
          <Pressable
            key={log.id}
            onPress={() => router.push(`/workouts/${log.id}`)}
            className="p-4 bg-card rounded-xl mb-2 mx-2 border border-border"
          >
            <Text className="text-text font-medium">{log.workoutName}</Text>
            {log.notes && <Text className="text-sm text-placeholder mt-1" numberOfLines={1}>{log.notes}</Text>}
            <Text className="text-xs text-placeholder mt-2">{new Date(log.createdAt).toLocaleDateString()}</Text>
          </Pressable>
        ))
      )}
    </ScrollView>
  )
}

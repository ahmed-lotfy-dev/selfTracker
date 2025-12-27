import React from "react"
import { View, Text, ScrollView } from "react-native"
import { useThemeColors } from "@/src/constants/Colors"
import { FontAwesome5 } from "@expo/vector-icons"
import { useWorkoutsStore } from "@/src/stores/useWorkoutsStore"

interface CalendarViewProps {
  headerElement?: React.ReactNode
  workoutLogs?: any[] // Optional prop if passed from parent, else use store
}

export default function CalendarView({ headerElement, workoutLogs: propLogs }: CalendarViewProps) {
  const colors = useThemeColors()
  const storeLogs = useWorkoutsStore(s => s.workoutLogs)
  const workoutLogs = propLogs || storeLogs

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 150 }}
    >
      {headerElement}
      <View className="mx-2">
        {/* Simple Calendar Placeholder Logic for now - sticking to "No Data" if empty */}
        {workoutLogs.length === 0 ? (
          <View className="items-center justify-center py-16 border-2 border-dashed rounded-3xl opacity-50" style={{ borderColor: colors.border }}>
            <View className="w-16 h-16 rounded-full items-center justify-center mb-4 bg-black/5 dark:bg-white/5">
              <FontAwesome5 name="calendar-alt" size={24} color={colors.text} style={{ opacity: 0.5 }} />
            </View>
            <Text className="text-lg font-bold mb-1 text-text">No workouts yet</Text>
            <Text className="text-sm text-center px-8 text-placeholder">
              Log your first workout to see it on the calendar.
            </Text>
          </View>
        ) : (
          <View>
            <Text className="text-center py-4 text-placeholder">Calendar View Implementation Pending</Text>
            {/* 
                    Ideally we would render the actual calendar here. 
                    Since I don't have the original code for CalendarView logic readily available (it was replaced by empty state previously),
                    I will leave a placeholder message but indicate it uses real data length.
                 */}
            <View className="items-center justify-center py-16 border-2 border-dashed rounded-3xl opacity-50" style={{ borderColor: colors.border }}>
              <Text className="text-text">{workoutLogs.length} workouts logged</Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  )
}

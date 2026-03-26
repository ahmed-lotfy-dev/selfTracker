import { View, Text, Dimensions } from "react-native"
import React, { useMemo } from "react"
import { PieChart } from "react-native-chart-kit"
import { Ionicons } from "@expo/vector-icons"
import { useThemeColors } from "@/src/constants/Colors"
import { useTasksStore } from "@/src/stores/useTasksStore"
import { useSyncStore } from "@/src/stores/useSyncStore"
import { PremiumCard } from "../../ui/PremiumCard"

const SCREEN_WIDTH = Dimensions.get("window").width

export const TasksChart = () => {
  const colors = useThemeColors()
  const tasks = useTasksStore((s) => s.tasks)
  const isSyncComplete = useSyncStore((s) => s.isInitialSyncComplete)

  const stats = useMemo(() => {
    const activeTasks = tasks.filter((t) => !t.deletedAt)
    const pendingTasks = activeTasks.filter((t) => !t.completed).length
    const completedTasks = activeTasks.filter((t) => t.completed).length
    return { pendingTasks, completedTasks }
  }, [tasks])

  const data = [
    {
      name: "Pending",
      population: stats.pendingTasks,
      color: "#6366f1", // Indigo
      legendFontColor: "rgba(255,255,255,0.7)",
      legendFontSize: 11,
    },
    {
      name: "Done",
      population: stats.completedTasks,
      color: "#10b981", // Emerald
      legendFontColor: "rgba(255,255,255,0.7)",
      legendFontSize: 11,
    },
  ]

  const hasData = stats.pendingTasks > 0 || stats.completedTasks > 0

  return (
    <View className="my-2">
      <PremiumCard 
        gradientColors={['rgba(255,255,255,0.03)', 'rgba(255,255,255,0.01)']}
      >
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-white/40 font-bold text-[10px] uppercase tracking-wider">
            Tasks Overview
          </Text>
          {hasData && (
             <View className="bg-primary/20 px-2 py-0.5 rounded-full">
               <Text className="text-primary text-[10px] font-bold">LIVE</Text>
             </View>
          )}
        </View>

        {hasData ? (
          <View className="items-center -ml-4">
            <PieChart
              data={data}
              width={SCREEN_WIDTH - 64}
              height={160}
              chartConfig={{
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
              hasLegend={true}
            />
          </View>
        ) : (
          <View className="items-center justify-center py-10">
            <View className="p-4 rounded-full bg-white/5 mb-3">
              <Ionicons 
                name={!isSyncComplete ? "sync" : "stats-chart-outline"} 
                size={32} 
                color="rgba(255,255,255,0.2)" 
              />
            </View>
            <Text className="text-white/30 text-center text-sm px-10">
              {!isSyncComplete 
                ? "Syncing your data from the cloud... This may take a moment." 
                : "Your productivity insights will appear here once you start completing tasks."}
            </Text>
          </View>
        )}
      </PremiumCard>
    </View>
  )
}

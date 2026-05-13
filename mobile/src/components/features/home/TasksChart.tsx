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
    <View>
      <PremiumCard 
        gradientColors={['rgba(99,102,241,0.15)', 'rgba(255,255,255,0.01)']}
        containerStyle="border-white/5 pt-2"
      >
        <View className="flex-row items-center justify-between mb-2">
          <View>
            <Text className="text-white/40 text-[10px] font-black uppercase tracking-[2px] mb-1">Productivity</Text>
            <Text className="text-white text-3xl font-black tracking-tighter">Task Overview</Text>
          </View>
          {hasData && (
             <View className="bg-indigo-500/20 px-3 py-1.5 rounded-full border border-indigo-500/20">
               <Text className="text-indigo-400 text-[10px] font-black uppercase tracking-widest">LIVE</Text>
             </View>
          )}
        </View>

        {hasData ? (
          <View className="items-center -ml-4 mt-2">
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
          <View className="items-center justify-center py-10 mt-2 bg-black/20 rounded-2xl border border-white/5">
            <View className="p-4 rounded-full bg-white/5 mb-3">
              <Ionicons 
                name={!isSyncComplete ? "sync" : "checkmark-circle-outline"}
                size={32} 
                color="rgba(255,255,255,0.5)" 
              />
            </View>
            <Text className="text-white/50 text-center text-xs font-bold px-10 leading-5">
              {!isSyncComplete 
                ? "SYNCING YOUR DATA FROM THE CLOUD..." 
                : "YOUR PRODUCTIVITY INSIGHTS WILL APPEAR HERE ONCE YOU COMPLETE TASKS."}
            </Text>
          </View>
        )}
      </PremiumCard>
    </View>
  )
}

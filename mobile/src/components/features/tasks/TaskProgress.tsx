import React from "react"
import { View, Text } from "react-native"
import { PremiumCard } from "../../ui/PremiumCard"
import { useThemeColors } from "@/src/constants/Colors"

interface TaskProgressProps {
  tasks: { id: string; completed: boolean }[]
}

export default function TaskProgress({ tasks }: TaskProgressProps) {
  const colors = useThemeColors()
  const total = tasks.length
  const completed = tasks.filter((t) => t.completed).length
  const progress = total === 0 ? 0 : (completed / total) * 100

  return (
    <View className="mx-1 my-4">
      <PremiumCard 
        gradientColors={['#6366f1', '#3730a3']}
        containerStyle="h-32 justify-center"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">Daily Momentum</Text>
            <Text className="text-white text-2xl font-black tracking-tighter">Task Mastery</Text>
            <Text className="text-white/40 text-[10px] font-bold uppercase tracking-tight mt-2">
              {completed} OF {total} TASKS COMPLETED
            </Text>
          </View>
          
          <View className="items-center justify-center">
            <View className="w-16 h-16 rounded-full border-4 border-white/10 justify-center items-center bg-white/5">
              <Text className="text-white font-black text-sm">
                {Math.round(progress)}%
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-4 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
          <View 
            className="h-full bg-white rounded-full" 
            style={{ width: `${progress}%` }} 
          />
        </View>
      </PremiumCard>
    </View>
  )
}

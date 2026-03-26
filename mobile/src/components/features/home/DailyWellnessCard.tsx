import React from "react"
import { View, Text } from "react-native"
import { PremiumCard } from "@/src/components/ui/PremiumCard"

export const DailyWellnessCard = () => {
  return (
    <View className="mb-6">
      <PremiumCard
        gradientColors={['#10b981', '#064e3b']}
        containerStyle="h-56 justify-center"
      >
        <View className="flex-row justify-between items-start">
          <View>
            <Text className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">Daily Wellness</Text>
            <Text className="text-white text-4xl font-black tracking-tighter">84%</Text>
          </View>
          <View className="bg-white/20 px-3 py-1 rounded-full items-center justify-center">
            <Text className="text-white text-[10px] font-bold">PRO MAX</Text>
          </View>
        </View>

        <View className="mt-8">
          <View className="flex-row justify-between mb-2">
            <Text className="text-white/80 text-sm font-medium">Consistency Target</Text>
            <Text className="text-white text-sm font-bold">90%</Text>
          </View>
          <View className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
            <View className="h-full bg-white rounded-full" style={{ width: '84%' }} />
          </View>
        </View>

        <View className="flex-row mt-6 gap-4">
          <View>
            <Text className="text-white/60 text-[10px] uppercase font-bold">Streak</Text>
            <Text className="text-white text-lg font-bold">12 Days</Text>
          </View>
          <View className="w-px h-8 bg-white/10" />
          <View>
            <Text className="text-white/60 text-[10px] uppercase font-bold">Active</Text>
            <Text className="text-white text-lg font-bold">6 Habits</Text>
          </View>
        </View>
      </PremiumCard>
    </View>
  )
}

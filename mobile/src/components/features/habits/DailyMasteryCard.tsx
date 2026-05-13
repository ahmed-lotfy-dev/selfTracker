import React from "react"
import { View, Text } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons"
import { PremiumCard } from "@/src/components/ui/PremiumCard"

interface DailyMasteryCardProps {
  completedCount: number
  totalCount: number
  completionRate: number
}

export default function DailyMasteryCard({ 
  completedCount, 
  totalCount, 
  completionRate 
}: DailyMasteryCardProps) {
  return (
    <View className="mb-4">
      <PremiumCard 
        gradientColors={['rgba(99, 102, 241, 0.15)', 'rgba(79, 70, 229, 0.05)']}
      >
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">
              Daily Mastery
            </Text>
            <View className="flex-row items-center gap-2">
              <Text className="text-4xl font-extrabold text-white">{completionRate}%</Text>
              {completionRate === 100 && totalCount > 0 && (
                <View className="bg-yellow-500/20 px-2 py-0.5 rounded-md">
                  <Text className="text-yellow-500 text-[10px] font-black">FLAWLESS</Text>
                </View>
              )}
            </View>
          </View>
          
          <View className="items-center justify-center bg-white/5 w-16 h-16 rounded-3xl border border-white/10">
            <MaterialCommunityIcons 
              name={completionRate >= 50 ? "trophy-variant" : "timer-sand"} 
              size={32} 
              color={completionRate >= 50 ? "#fbbf24" : "rgba(255,255,255,0.4)"} 
            />
          </View>
        </View>

        <View className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-3">
          <LinearGradient
            colors={['#6366f1', '#a855f7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ width: `${completionRate}%`, height: '100%' }}
          />
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="text-white/30 text-xs font-medium">
            {completedCount} of {totalCount} habits locked in
          </Text>
          <View className="flex-row items-center gap-1">
            <Ionicons name="stats-chart" size={10} color="rgba(255,255,255,0.2)" />
            <Text className="text-white/20 text-[10px] uppercase font-bold">Live Pulse</Text>
          </View>
        </View>
      </PremiumCard>
    </View>
  )
}

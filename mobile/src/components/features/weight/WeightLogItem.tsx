import React from "react"
import { View, Text } from "react-native"
import { useThemeColors } from "@/src/constants/Colors"
import { PremiumCard } from "../../ui/PremiumCard"
import { format } from "date-fns"
import { WeightLog } from "@/src/types/weightType"

export default function WeightLogItem({ log }: { log: WeightLog }) {
  const colors = useThemeColors()
  const date = new Date(log.createdAt)

  return (
    <View className="mb-3">
      <PremiumCard 
        gradientColors={['rgba(255,255,255,0.03)', 'rgba(255,255,255,0.01)']}
        containerStyle="border-white/5"
      >
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-white text-lg font-black tracking-tighter" style={{ color: colors.statSecondary }}>
              {log?.weight || "0"} <Text className="text-xs text-white/40 uppercase">kg</Text>
            </Text>
            <Text className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-0.5">
              {format(date, "MMM dd, yyyy")}
            </Text>
          </View>
          {log?.notes && (
            <View className="flex-1 ml-4 items-end">
              <Text className="text-[10px] text-white/50 italic text-right" numberOfLines={2}>
                {log.notes}
              </Text>
            </View>
          )}
        </View>
      </PremiumCard>
    </View>
  )
}

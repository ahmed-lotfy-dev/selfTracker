import React from "react"
import { View, Text } from "react-native"
import { useThemeColors } from "@/src/constants/Colors"
import { PremiumCard } from "../../ui/PremiumCard"
import { format } from "date-fns"
import { FontAwesome5 } from "@expo/vector-icons"
import { WorkoutLog } from "@/src/types/workoutType"

export default function WorkoutLogItem({ log }: { log: WorkoutLog }) {
  const colors = useThemeColors()
  const date = new Date(log.createdAt)

  return (
    <View className="mb-3">
      <PremiumCard 
        gradientColors={['rgba(255,255,255,0.03)', 'rgba(255,255,255,0.01)']}
        containerStyle="border-white/5"
      >
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center flex-1">
            <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
              <FontAwesome5 name="running" size={18} color={colors.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-white text-base font-black tracking-tighter" numberOfLines={1}>
                {log?.workoutName || "Workout"}
              </Text>
              <Text className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-0.5">
                {format(date, "MMM dd, yyyy")}
              </Text>
            </View>
          </View>
          
          <View className="items-end">
            <View className="bg-white/5 px-2 py-1 rounded-md">
              <Text className="text-primary text-[10px] font-black uppercase tracking-tighter">
                Completed
              </Text>
            </View>
          </View>
        </View>
        
        {log?.notes && (
          <View className="mt-3 pt-3 border-t border-white/5">
            <Text className="text-[10px] text-white/50 italic" numberOfLines={2}>
              {log.notes}
            </Text>
          </View>
        )}
      </PremiumCard>
    </View>
  )
}

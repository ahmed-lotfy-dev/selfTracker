import React from "react"
import { View, Text, Pressable, StyleSheet } from "react-native"
import { useThemeColors } from "@/src/constants/Colors"
import { Ionicons } from "@expo/vector-icons"
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg"
import { PremiumCard } from "@/src/components/ui/PremiumCard"

type Props = {
  consumed: number
  goal: number
  onPressGoals?: () => void
}

export default function DailyIntakeCard({ consumed, goal, onPressGoals }: Props) {
  const colors = useThemeColors()

  const percentage = Math.min((consumed / goal) * 100, 100)
  const remaining = Math.max(goal - consumed, 0)

  const size = 160
  const strokeWidth = 14
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <View className="mb-6">
      <PremiumCard 
        gradientColors={['#3b82f6', '#1e3a8a']}
        containerStyle="h-72 justify-center"
      >
        <View className="flex-row justify-between items-start mb-2 px-1">
          <View>
            <Text className="text-white/40 text-[10px] font-black uppercase tracking-[2px] mb-1">Nutrition Dashboard</Text>
            <Text className="text-white text-3xl font-black tracking-tighter">Energy Balance</Text>
          </View>
          <Pressable 
            onPress={onPressGoals} 
            className="bg-white/20 px-3 py-1.5 rounded-full flex-row items-center border border-white/10"
          >
            <Text className="text-white text-[10px] font-black mr-1 uppercase">Goals</Text>
            <Ionicons name="settings" size={10} color="white" />
          </Pressable>
        </View>

        <View className="flex-row items-center justify-between mt-4">
          <View className="relative items-center justify-center">
            <Svg width={size} height={size}>
              <Defs>
                <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#60a5fa" />
                  <Stop offset="100%" stopColor="#ffffff" />
                </LinearGradient>
              </Defs>
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth={strokeWidth}
                fill="none"
              />
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="url(#grad)"
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
            </Svg>
            <View className="absolute items-center">
              <Text className="text-4xl font-black text-white tracking-tighter">
                {consumed}
              </Text>
              <Text className="text-[10px] text-white/50 font-bold uppercase tracking-widest">
                kcal
              </Text>
            </View>
          </View>

          <View className="flex-1 ml-8 gap-4">
            <View>
              <Text className="text-white/60 text-[10px] uppercase font-black tracking-widest">Target</Text>
              <Text className="text-white text-xl font-black tracking-tighter">{goal} <Text className="text-[10px] text-white/40 uppercase">kcal</Text></Text>
            </View>
            <View className="h-px bg-white/10 w-full" />
            <View>
              <Text className="text-white/60 text-[10px] uppercase font-black tracking-widest">Remaining</Text>
              <Text className="text-white text-xl font-black tracking-tighter">{remaining} <Text className="text-[10px] text-white/40 uppercase">kcal</Text></Text>
            </View>
          </View>
        </View>
      </PremiumCard>
    </View>
  )
}

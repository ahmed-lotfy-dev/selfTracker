import React from "react"
import { View, Text, Pressable } from "react-native"
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg"
import { Ionicons } from "@expo/vector-icons"
import { useThemeColors } from "@/src/constants/Colors"
import { useNutritionStore } from "@/src/stores/useNutritionStore"
import type { FoodLog } from "@/src/types/nutritionType"
import { LinearGradient as ExpoGradient } from "expo-linear-gradient"

type Props = {
  consumed: number
  goal: number
  logs: FoodLog[]
  onPressGoals?: () => void
}

type MacroBarProps = {
  label: string
  value: number
  max: number
  color: string
}

function MacroBar({ label, value, max, color }: MacroBarProps) {
  const pct = Math.min((value / Math.max(max, 1)) * 100, 100)
  return (
    <View className="flex-1">
      <View className="flex-row justify-between mb-1">
        <Text className="text-[9px] font-black uppercase tracking-widest text-white/40">{label}</Text>
        <Text className="text-[9px] font-black text-white/70">{value}g</Text>
      </View>
      <View className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <View
          className="h-full rounded-full"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </View>
    </View>
  )
}

export default function DailyIntakeCard({ consumed, goal, logs = [], onPressGoals }: Props) {
  const colors = useThemeColors()
  const goals = useNutritionStore(s => s.goals)

  const percentage = Math.min((consumed / Math.max(goal, 1)) * 100, 100)
  const remaining = Math.max(goal - consumed, 0)

  const totalProtein = logs.reduce((s, l) => s + (l.totalProtein || 0), 0)
  const totalCarbs = logs.reduce((s, l) => s + (l.totalCarbs || 0), 0)
  const totalFat = logs.reduce((s, l) => s + (l.totalFat || 0), 0)

  const size = 130
  const strokeWidth = 10
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  const isOverGoal = consumed > goal

  return (
    <View className="mb-6 rounded-2xl overflow-hidden">
      <ExpoGradient
        colors={isOverGoal ? ['#7f1d1d', '#450a0a'] : ['#1d4ed8', '#0f172a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 16, padding: 20 }}
      >
        {/* Header Row */}
        <View className="flex-row items-center justify-between mb-5">
          <View>
            <Text className="text-white/50 text-[9px] font-black uppercase tracking-[3px] mb-0.5">
              Today's Intake
            </Text>
            <Text className="text-white text-2xl font-black tracking-tighter">
              Energy Balance
            </Text>
          </View>
          <Pressable
            onPress={onPressGoals}
            className="flex-row items-center bg-white/10 rounded-full px-3 py-1.5 border border-white/10"
          >
            <Ionicons name="flag" size={9} color="rgba(255,255,255,0.6)" />
            <Text className="text-white/70 text-[9px] font-black uppercase tracking-wider ml-1">Goals</Text>
          </Pressable>
        </View>

        {/* Ring + Stats Row */}
        <View className="flex-row items-center">
          {/* Ring Chart */}
          <View className="relative items-center justify-center mr-6">
            <Svg width={size} height={size}>
              <Defs>
                <LinearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor={isOverGoal ? "#f87171" : "#60a5fa"} />
                  <Stop offset="100%" stopColor={isOverGoal ? "#dc2626" : "#ffffff"} />
                </LinearGradient>
              </Defs>
              <Circle
                cx={size / 2} cy={size / 2} r={radius}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth={strokeWidth}
                fill="none"
              />
              <Circle
                cx={size / 2} cy={size / 2} r={radius}
                stroke="url(#ringGrad)"
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
            </Svg>
            <View className="absolute items-center">
              <Text className="text-3xl font-black text-white tracking-tighter leading-none">
                {consumed}
              </Text>
              <Text className="text-[8px] text-white/40 font-black uppercase tracking-widest">
                kcal
              </Text>
            </View>
          </View>

          {/* Stats Column */}
          <View className="flex-1 gap-3">
            <View className="bg-white/5 rounded-xl p-3">
              <Text className="text-white/40 text-[8px] uppercase font-black tracking-widest mb-0.5">Goal</Text>
              <Text className="text-white text-lg font-black tracking-tighter">
                {goal} <Text className="text-[9px] text-white/40 font-bold">kcal</Text>
              </Text>
            </View>
            <View className="bg-white/5 rounded-xl p-3">
              <Text className="text-white/40 text-[8px] uppercase font-black tracking-widest mb-0.5">
                {isOverGoal ? "Over by" : "Remaining"}
              </Text>
              <Text
                className="text-lg font-black tracking-tighter"
                style={{ color: isOverGoal ? "#f87171" : "white" }}
              >
                {isOverGoal ? consumed - goal : remaining}{" "}
                <Text className="text-[9px] text-white/40 font-bold">kcal</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Macro Progress Bars */}
        <View className="mt-5 pt-4 border-t border-white/10 flex-row gap-3">
          <MacroBar label="Protein" value={totalProtein} max={goals?.proteinGrams || 150} color="#60a5fa" />
          <MacroBar label="Carbs" value={totalCarbs} max={goals?.carbsGrams || 250} color="#34d399" />
          <MacroBar label="Fat" value={totalFat} max={goals?.fatGrams || 80} color="#f59e0b" />
        </View>
      </ExpoGradient>
    </View>
  )
}

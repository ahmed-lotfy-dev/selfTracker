import React from "react"
import { View, Text, Pressable } from "react-native"
import { useThemeColors } from "@/src/constants/Colors"
import { Ionicons } from "@expo/vector-icons"
import type { FoodItem } from "@/src/types/nutritionType"

type Props = {
  item: FoodItem
  isLast?: boolean
  onDelete?: () => void
}

export default function FoodItemRow({ item, isLast = false, onDelete }: Props) {
  const colors = useThemeColors()

  return (
    <View
      className={`flex-row items-center justify-between px-4 py-4 ${!isLast ? "border-b border-white/5" : ""}`}
    >
      <View className="flex-1">
        <Text className="text-white text-base font-black tracking-tighter">
          {item.name}
        </Text>
        <View className="flex-row items-center mt-1">
          <Text className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
            {item.quantity} {item.unit}
          </Text>
          <View className="w-1 h-1 rounded-full bg-white/10 mx-2" />
          <Text className="text-[10px] text-white/50 font-bold uppercase tracking-tight">
            P: {item.protein}g • C: {item.carbs}g • F: {item.fat}g
          </Text>
        </View>
      </View>
      <View className="flex-row items-center">
        <View className="bg-white/5 px-3 py-1 rounded-lg mr-3">
          <Text className="text-sm font-black text-white tracking-tighter">
            {item.calories} <Text className="text-[8px] text-white/40 uppercase">kcal</Text>
          </Text>
        </View>
        {onDelete && (
          <Pressable onPress={onDelete} className="p-2 bg-red-500/10 rounded-full">
            <Ionicons name="trash-outline" size={14} color="#ef4444" />
          </Pressable>
        )}
      </View>
    </View>
  )
}


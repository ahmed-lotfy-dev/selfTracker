import { View, Text, ScrollView } from "react-native"
import React from "react"
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons"
import { COLORS } from "@/src/constants/Colors"

interface StatCardProps {
  label: string
  value: string | number
  subLabel?: string
  icon: React.ReactNode
  colorClass: string
}

const StatCard = ({ label, value, subLabel, icon, colorClass }: StatCardProps) => (
  <View
    className={`bg-white p-4 rounded-xl shadow-sm mr-3 min-w-[140px] border border-gray-100 flex-1`}
  >
    <View className={`p-2 rounded-full self-start mb-3 ${colorClass.replace('text-', 'bg-').replace('500', '100')}`}>
      {icon}
    </View>
    <Text className="text-2xl font-bold text-gray-800">{value}</Text>
    <Text className="text-gray-500 font-medium text-xs uppercase mt-1">{label}</Text>
    {subLabel && <Text className="text-gray-400 text-xs mt-1">{subLabel}</Text>}
  </View>
)

interface StatsRowProps {
  weeklyWorkouts: number
  monthlyWorkouts: number
  weightChange: string
  bmi: number | null
  goalWeight: number | null
}

export const StatsRow = ({
  weeklyWorkouts,
  monthlyWorkouts,
  weightChange,
  bmi,
  goalWeight,
}: StatsRowProps) => {
  return (
    <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        className="flex-row py-2"
        contentContainerStyle={{ paddingRight: 20 }}
    >
      <StatCard
        label="Weekly Workouts"
        value={weeklyWorkouts}
        icon={<FontAwesome5 name="dumbbell" size={16} className="text-blue-500" color={COLORS.primary} />}
        colorClass="text-blue-500"
      />

      <StatCard
        label="Monthly Workouts"
        value={monthlyWorkouts}
        icon={<MaterialIcons name="calendar-today" size={16} className="text-indigo-500" color="#6366f1" />}
        colorClass="text-indigo-500"
      />
      
      <StatCard
        label="Weight Change"
        value={weightChange || "N/A"}
        icon={<MaterialIcons name="monitor-weight" size={18} className="text-purple-500" color="#a855f7" />}
        colorClass="text-purple-500"
      />

       {bmi && (
        <StatCard
            label="BMI"
            value={bmi.toFixed(1)}
            icon={<MaterialIcons name="accessibility" size={18} className="text-orange-500" color="#f97316" />}
            colorClass="text-orange-500"
        />
       )}

      {goalWeight && (
         <StatCard
            label="Goal Weight"
            value={`${goalWeight} kg`}
            icon={<MaterialIcons name="flag" size={18} className="text-green-500" color="#22c55e" />}
            colorClass="text-green-500"
        />
      )}
    </ScrollView>
  )
}

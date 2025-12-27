import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useThemeColors } from '@/src/constants/Colors';

interface HabitCardProps {
  habit: any;
  onToggle: (habit: any) => void;
  onDelete: (habit: any) => void;
}

export default function HabitCard({ habit, onToggle, onDelete }: HabitCardProps) {
  const colors = useThemeColors();
  const isCompleted = habit.completedToday;

  return (
    <Pressable onPress={() => onToggle(habit)} onLongPress={() => onDelete(habit)} delayLongPress={500} android_ripple={{ color: 'transparent' }} className="group relative overflow-hidden rounded-2xl border p-5 transition-all active:scale-[0.99]" style={{ backgroundColor: colors.card, borderColor: isCompleted ? '#22c55e80' : colors.border, opacity: 1 }}>
      {isCompleted && <View className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundColor: '#22c55e' }} />}
      <View className="flex-row items-start justify-between">
        <View className="flex-1 mr-4">
          <Text className="text-lg font-bold mb-1 leading-tight" style={{ color: isCompleted ? '#16a34a' : colors.text, textDecorationLine: 'none' }}>{habit.name}</Text>
          <Text className="text-xs opacity-50" style={{ color: colors.text }}>{isCompleted ? "Completed for today" : "Tap to mark done • Long press to delete"}</Text>
        </View>
        <View className="w-10 h-10 rounded-full items-center justify-center border-2 transition-all shadow-sm" style={{ borderColor: isCompleted ? '#22c55e' : `${colors.text}30`, backgroundColor: isCompleted ? '#22c55e' : 'transparent', transform: [{ scale: isCompleted ? 1.1 : 1 }] }}>{isCompleted && <Feather name="check" size={20} color="#FFF" strokeWidth={3} />}</View>
      </View>
      <View className="flex-row items-center mt-4">
        <View className="flex-row items-center gap-1.5 px-3 py-1 rounded-full" style={{ backgroundColor: isCompleted ? (habit.streak > 0 ? '#ffedd5' : `${colors.text}10`) : '#eff6ff' }}>
          <FontAwesome5 name="fire" size={12} color={isCompleted ? (habit.streak > 0 ? "#ea580c" : colors.placeholder) : "#3b82f6"} />
          <Text className="text-xs font-bold" style={{ color: isCompleted ? (habit.streak > 0 ? '#ea580c' : colors.placeholder) : "#3b82f6" }}>{isCompleted ? `${habit.streak} Day Streak` : `Reach ${habit.streak + 1} Day Streak!`}</Text>
        </View>
      </View>
    </Pressable>
  );
}

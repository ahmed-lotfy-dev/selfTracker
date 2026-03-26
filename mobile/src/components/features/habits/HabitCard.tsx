import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/src/constants/Colors';
import { PremiumCard } from '@/src/components/ui/PremiumCard';
import { Habit } from '@/src/types/habitType';
import { LinearGradient } from 'expo-linear-gradient';

interface HabitCardProps {
  habit: Habit;
  onToggle: () => void;
  onDelete: () => void;
}

export default function HabitCard({ habit, onToggle, onDelete }: HabitCardProps) {
  const colors = useThemeColors();
  const isCompleted = habit.completedToday;

  const gradientColors = isCompleted 
    ? ['rgba(34, 197, 94, 0.15)', 'rgba(34, 197, 94, 0.05)'] as const
    : ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)'] as const;

  return (
    <View className="mb-4">
      <PremiumCard 
        onPress={onToggle}
        gradientColors={gradientColors}
        containerStyle={`border-${isCompleted ? 'green-500/50' : 'white/10'}`}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1 mr-4">
            <View className="flex-row items-center gap-2 mb-1">
               <View 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: habit.color || colors.primary }} 
               />
               <Text 
                className={`text-lg font-bold leading-tight ${isCompleted ? 'text-green-400' : 'text-white'}`}
                style={{ textDecorationLine: isCompleted ? 'line-through' : 'none', opacity: isCompleted ? 0.6 : 1 }}
               >
                {habit.name}
              </Text>
            </View>
            
            <Text className="text-[11px] text-white/40 font-medium uppercase tracking-wider">
              {isCompleted ? "Goal achieved for today" : "Daily Dedication"}
            </Text>
          </View>

          <View 
            className={`w-12 h-12 rounded-2xl items-center justify-center border-2 ${
              isCompleted ? 'bg-green-500 border-green-400' : 'bg-white/5 border-white/10'
            }`}
          >
            {isCompleted ? (
              <Feather name="check" size={24} color="white" strokeWidth={3} />
            ) : (
              <Ionicons name="radio-button-off" size={24} color="rgba(255,255,255,0.2)" />
            )}
          </View>
        </View>

        <View className="flex-row items-center justify-between mt-4 border-t border-white/5 pt-3">
          <View className="flex-row items-center gap-2">
            <View className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5">
              <FontAwesome5 
                name="fire" 
                size={12} 
                color={habit.streak > 0 ? "#fb923c" : "rgba(255,255,255,0.3)"} 
              />
              <Text className="text-[11px] font-bold text-white/70">
                {habit.streak} Day Streak
              </Text>
            </View>
            
            {habit.lastCompletedAt && (
               <Text className="text-[10px] text-white/20">
                Last: {new Date(habit.lastCompletedAt).toLocaleDateString()}
              </Text>
            )}
          </View>

          <Feather 
            name="trash-2" 
            size={16} 
            color="rgba(255,255,255,0.2)" 
            onPress={onDelete}
          />
        </View>
      </PremiumCard>
    </View>
  );
}

import React from 'react';
import { View } from 'react-native';
import { useThemeColors } from '@/src/constants/Colors';

export default function HabitCardSkeleton() {
  const colors = useThemeColors();

  return (
    <View className="rounded-2xl border p-5" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
      <View className="flex-row items-start justify-between">
        <View className="flex-1 mr-4">
          <View className="h-6 w-3/4 rounded-lg mb-2" style={{ backgroundColor: `${colors.text}10` }} />
          <View className="h-4 w-1/2 rounded-lg" style={{ backgroundColor: `${colors.text}10` }} />
        </View>
        <View className="w-10 h-10 rounded-full" style={{ backgroundColor: `${colors.text}10` }} />
      </View>
      <View className="flex-row items-center mt-4">
        <View className="h-6 w-32 rounded-full" style={{ backgroundColor: `${colors.text}10` }} />
      </View>
    </View>
  );
}

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';

import { PremiumCardProps } from '@/src/types/uiType';

export const PremiumCard = ({ 
  children, 
  gradientColors = ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)'],
  containerStyle = "",
  onPress,
  onLongPress
}: PremiumCardProps) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View style={[animatedStyle, { flex: 1 }]}>
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        className={`rounded-2xl overflow-hidden border border-white/10 ${containerStyle}`}
        style={{ flex: 1 }}
      >
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill}>
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </BlurView>
        <View className="p-4 flex-1">
          {children}
        </View>
      </Pressable>
    </Animated.View>
  );
};

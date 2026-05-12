import React from 'react'
import { View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { StyleSheet } from 'react-native'
import Header from '@/src/components/Header'
import AnalyticsTab from '@/src/components/features/ai/AnalyticsTab'

export default function AiScreen() {
  return (
    <View className="flex-1 bg-background">
      <LinearGradient
        colors={['rgba(16, 185, 129, 0.06)', 'transparent']}
        style={StyleSheet.absoluteFill}
      />
      <AnalyticsTab />
    </View>
  )
}

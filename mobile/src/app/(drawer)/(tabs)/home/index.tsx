import { View, ScrollView, StyleSheet } from "react-native"
import React from "react"
import { LinearGradient } from 'expo-linear-gradient'
import DrawerToggleButton from "@/src/components/features/navigation/DrawerToggleButton"
import Header from "@/src/components/Header"
import { DailyWellnessCard } from "@/src/components/features/home/DailyWellnessCard"
import { QuickActionsSection } from "@/src/components/features/home/QuickActionsSection"
import { DailyInsightsSection } from "@/src/components/features/home/DailyInsightsSection"
import { TasksChart } from "@/src/components/features/home/TasksChart"

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-background px-4">
      <LinearGradient
        colors={['rgba(99, 102, 241, 0.1)', 'transparent']}
        style={StyleSheet.absoluteFill}
      />
      <Header
        title="SelfTracker"
        rightAction={<DrawerToggleButton />}
      />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 45 }}
      >
        <DailyWellnessCard />
        <QuickActionsSection />
        <DailyInsightsSection />
        <TasksChart />
      </ScrollView>
    </View>
  )
}

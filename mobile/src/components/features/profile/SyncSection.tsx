import React from "react"
import { View, Text, Pressable } from "react-native"
import { Feather } from "@expo/vector-icons"
import { useThemeColors } from "@/src/constants/Colors"
import { Section } from "@/src/components/ui/Section"

export default function SyncSection() {
  const colors = useThemeColors()

  return (
    <Section title="Sync">
      <View className="flex-row items-center py-4 px-4 bg-card">
        <View className="w-8 items-center justify-center mr-3">
          <Feather name="check-circle" size={20} color={colors.success} />
        </View>
        <View className="flex-1">
          <Text className="text-base text-text font-medium">Auto-Sync Enabled</Text>
          <Text className="text-xs text-placeholder">LiveStore syncs automatically when online</Text>
        </View>
      </View>

      <View className="flex-row items-center py-4 px-4 bg-card border-t border-border">
        <View className="w-8 items-center justify-center mr-3">
          <Feather name="wifi" size={20} color={colors.placeholder} />
        </View>
        <View className="flex-1">
          <Text className="text-base text-text font-medium">Offline Mode</Text>
          <Text className="text-xs text-placeholder">Changes are saved locally and synced when back online</Text>
        </View>
      </View>
    </Section>
  )
}

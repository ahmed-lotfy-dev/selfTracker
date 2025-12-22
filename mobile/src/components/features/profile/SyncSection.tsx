import React, { useState } from "react"
import { View, Text, Pressable, ActivityIndicator } from "react-native"
import { Feather } from "@expo/vector-icons"
import { useThemeColors } from "@/src/constants/Colors"
import { Section } from "@/src/components/ui/Section"
import axiosInstance from "@/src/lib/api/axiosInstane"
import { useAlertStore } from "@/src/features/ui/useAlertStore"

export default function SyncSection() {
  const colors = useThemeColors()
  const { showAlert } = useAlertStore()
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<string | null>(null)

  const handleSyncExisting = async () => {
    setIsSyncing(true)
    try {
      console.log(`[SyncSection] Attempting to sync existing data...`)
      const response = await axiosInstance.post("/api/livestore/sync-existing")
      setSyncResult(response.data.message)
      showAlert("Data Sync", "Your existing records have been successfully connected to this device!", () => { }, undefined, "Great!", undefined)
    } catch (error: any) {
      console.error("Sync failed:", error)
      showAlert("Error", "Could not sync existing data. Please check your connection.", () => { }, undefined, "OK", undefined)
    } finally {
      setIsSyncing(false)
    }
  }

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

      <Pressable
        onPress={handleSyncExisting}
        disabled={isSyncing}
        className="flex-row items-center py-4 px-4 bg-card border-t border-border active:opacity-70"
      >
        <View className="w-8 items-center justify-center mr-3">
          {isSyncing ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Feather name="refresh-cw" size={20} color={colors.secondary} />
          )}
        </View>
        <View className="flex-1">
          <Text className="text-base text-text font-medium">Sync Existing App Data</Text>
          <Text className="text-xs text-placeholder">
            {syncResult || "Bring your previously saved data to this device"}
          </Text>
        </View>
        <Feather name="chevron-right" size={16} color={colors.placeholder} />
      </Pressable>

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

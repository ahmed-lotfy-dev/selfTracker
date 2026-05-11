import React, { useState } from "react"
import { View, Text, Pressable, ActivityIndicator } from "react-native"
import { Feather } from "@expo/vector-icons"
import { useThemeColors } from "@/src/constants/Colors"
import { Section } from "@/src/components/ui/Section"
import axiosInstance from "@/src/lib/api/axiosInstance"
import { useAlertStore } from "@/src/features/ui/useAlertStore"
import { useSyncStore } from "@/src/stores/useSyncStore"
import { useAuthActions } from "@/src/features/auth/useAuthStore"

export default function SyncSection() {
  const colors = useThemeColors()
  const { showAlert } = useAlertStore()
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<string | null>(null)
  const tables = useSyncStore((s) => s.tables)
  const logout = useAuthActions().logout

  const hasAuthError = Object.values(tables).some((s) => s === 'auth_required')

  return (
    <Section title="Sync">
      {hasAuthError && (
        <View className="flex-row items-center py-4 px-4 bg-card border-b border-border">
          <View className="w-8 items-center justify-center mr-3">
            <Feather name="alert-circle" size={20} color={colors.error || '#ef4444'} />
          </View>
          <View className="flex-1">
            <Text className="text-base text-text font-medium">Session Expired</Text>
            <Text className="text-xs text-placeholder">Your session has expired. Please log out and log back in to resume syncing.</Text>
          </View>
          <Pressable
            onPress={() => showAlert(
              "Session Expired",
              "Your session has expired. You'll be logged out so you can log back in with a fresh session.",
              logout,
              undefined,
              "Log Out",
              "Cancel",
              "error"
            )}
            className="px-3 py-1.5 rounded-lg border border-error/30"
          >
            <Text className="text-xs text-error font-medium">Re-login</Text>
          </Pressable>
        </View>
      )}

      <View className="flex-row items-center py-4 px-4 bg-card">
        <View className="w-8 items-center justify-center mr-3">
          <Feather name="check-circle" size={20} color={hasAuthError ? colors.placeholder : colors.success} />
        </View>
        <View className="flex-1">
          <Text className="text-base text-text font-medium">
            {hasAuthError ? 'Sync Paused' : 'Auto-Sync Enabled'}
          </Text>
          <Text className="text-xs text-placeholder">ElectricSQL syncs automatically when online</Text>
        </View>
      </View>

      <View className="flex-row items-center py-4 px-4 bg-card border-t border-border">
        <View className="w-8 items-center justify-center mr-3">
          <Feather name="wifi" size={20} color={colors.placeholder} />
        </View>
        <View className="flex-1">
          <Text className="text-base text-text font-medium">Offline-First</Text>
          <Text className="text-xs text-placeholder">Changes are saved locally and synced when back online</Text>
        </View>
      </View>
    </Section>
  )
}

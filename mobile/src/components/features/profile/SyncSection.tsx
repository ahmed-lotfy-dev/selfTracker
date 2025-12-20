import React, { useState, useEffect } from "react"
import { View, Text, Pressable } from "react-native"
import { Feather } from "@expo/vector-icons"
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from "react-native-reanimated"
import { useAlertStore } from "@/src/store/useAlertStore"
import { useThemeColors } from "@/src/constants/Colors"
import { runSync, resetAndSync } from "@/src/services/sync"
import { Section } from "@/src/components/ui/Section"
import BackupSection from "./BackupSection"

export default function SyncSection() {
  const { showAlert } = useAlertStore()
  const colors = useThemeColors()
  const [isSyncing, setIsSyncing] = useState(false)

  const rotation = useSharedValue(0)

  useEffect(() => {
    if (isSyncing) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 1000, easing: Easing.linear }),
        -1,
        false
      )
    } else {
      rotation.value = withTiming(0, { duration: 200 })
    }
  }, [isSyncing])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }))

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      const result = await runSync()
      if (result.pullSuccess && result.pushSuccess) {
        showAlert(
          "Sync Complete",
          `Successfully synced your data!\n\nPulled: ${result.pulled} records\nPushed: ${result.pushed} records`,
          () => { },
          undefined,
          "Got it",
          undefined
        )
      } else {
        showAlert(
          "Sync Issue",
          "Some data might not have synced. Please try again.",
          () => { },
          undefined,
          "OK",
          undefined
        )
      }
    } catch {
      showAlert(
        "Sync Failed",
        "Failed to sync your data. Please check your connection.",
        () => { },
        undefined,
        "OK",
        undefined
      )
    } finally {
      setIsSyncing(false)
    }
  }

  const handleResetAndSync = () => {
    showAlert(
      "Reset Local Data?",
      "This will clear all local data and re-download everything from the cloud. Your cloud data is safe. This fixes corrupted local data.\n\nContinue?",
      async () => {
        setIsSyncing(true)
        try {
          const result = await resetAndSync()
          if (result.success) {
            showAlert(
              "Reset Complete",
              `Successfully reset and synced ${result.synced} records from the cloud!`,
              () => { },
              undefined,
              "Got it",
              undefined
            )
          } else {
            showAlert(
              "Reset Failed",
              "Failed to reset data. Please try again.",
              () => { },
              undefined,
              "OK",
              undefined
            )
          }
        } catch {
          showAlert(
            "Error",
            "An error occurred during reset. Please try again.",
            () => { },
            undefined,
            "OK",
            undefined
          )
        } finally {
          setIsSyncing(false)
        }
      },
      () => { },
      "Reset",
      "Cancel"
    )
  }

  return (
    <Section title="Sync">
      <Pressable onPress={handleSync} disabled={isSyncing}>
        <View className="flex-row items-center py-4 px-4 bg-card active:bg-inputBackground">
          <Animated.View className="w-8 items-center justify-center mr-3" style={animatedStyle}>
            <Feather name="refresh-cw" size={20} color={isSyncing ? colors.primary : colors.placeholder} />
          </Animated.View>
          <View className="flex-1">
            <Text className="text-base text-text font-medium">Sync Data</Text>
            <Text className="text-xs text-placeholder">Push local changes to cloud</Text>
          </View>
          {!isSyncing && <Feather name="chevron-right" size={20} color={colors.primary} />}
        </View>
      </Pressable>

      <Pressable onPress={handleResetAndSync} disabled={isSyncing} className="border-t border-border">
        <View className="flex-row items-center py-4 px-4 bg-card active:bg-inputBackground">
          <View className="w-8 items-center justify-center mr-3">
            <Feather name="database" size={20} color={colors.error} />
          </View>
          <View className="flex-1">
            <Text className="text-base text-error font-medium">Reset & Resync Data</Text>
            <Text className="text-xs text-placeholder">Fix corrupted local data</Text>
          </View>
          <Feather name="chevron-right" size={20} color={colors.error} />
        </View>
      </Pressable>

      <BackupSection />
    </Section>
  )
}

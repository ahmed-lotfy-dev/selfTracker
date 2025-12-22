import React, { useEffect } from "react"
import { Text, ActivityIndicator, Pressable } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Feather } from "@expo/vector-icons"
import { useThemeColors } from "@/src/constants/Colors"

interface SyncErrorViewProps {
  error: any
  isRepairing: boolean
  onRepair: () => void
}

/**
 * A specialized error view for LiveStore synchronization issues.
 * Powered by Uniwind classNames and dynamic theme tokens.
 */
export const SyncErrorView = ({ error, isRepairing, onRepair }: SyncErrorViewProps) => {
  const colors = useThemeColors()
  const msg = error?.message || error?.toString() || 'Unknown Error'

  const isCorruption = msg.includes('sqlite_master') ||
    msg.includes('NullPointerException') ||
    msg.includes('preparing statement')

  useEffect(() => {
    if (isCorruption && !isRepairing) {
      console.log("[LiveStore] Database corruption detected. Auto-repairing in 2 seconds...")
      const timer = setTimeout(onRepair, 2000) // Delay a bit to let previous state settle
      return () => clearTimeout(timer)
    } else if (isCorruption && isRepairing) {
      console.error("[LiveStore] CRITICAL: Auto-repair failed. Database still inaccessible.")
    }
  }, [isCorruption, isRepairing, onRepair])

  if (isRepairing) {
    return (
      <SafeAreaView
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: colors.background }}
      >
        <ActivityIndicator size="large" color="#F59E0B" />
        <Text
          className="mt-3 text-sm font-bold"
          style={{ color: '#D97706' }}
        >
          Repairing Database...
        </Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView
      className="flex-1 justify-center items-center p-5"
      style={{ backgroundColor: colors.background }}
    >
      <Feather name="alert-triangle" size={48} color={colors.error} />
      <Text
        className="mt-4 text-lg font-bold"
        style={{ color: colors.text }}
      >
        Sync Error
      </Text>
      <Text
        className="mt-3 text-sm text-center px-4"
        style={{ color: colors.placeholder }}
      >
        {msg}
      </Text>
      {isRepairing && (
        <Text className="mt-2 text-xs italic opacity-50 text-center px-6">
          Persistence reset was requested, but initialization still failed. This might require a cold restart or app data wipe.
        </Text>
      )}

      <Pressable
        onPress={onRepair}
        className="mt-5 px-5 py-3 rounded-lg overflow-hidden"
        style={({ pressed }) => ({
          backgroundColor: colors.primary,
          opacity: pressed ? 0.8 : 1
        })}
      >
        <Text className="text-white font-semibold">
          Reset & Repair Database
        </Text>
      </Pressable>
    </SafeAreaView>
  )
}

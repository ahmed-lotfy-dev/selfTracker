import { useCallback } from "react"
import * as Updates from "expo-updates"
import { AppState, AppStateStatus, Platform } from "react-native"
import { focusManager } from "@tanstack/react-query"

// Check for updates
export const checkForUpdates = useCallback(async () => {
  try {
    const update = await Updates.checkForUpdateAsync()
    if (update.isAvailable) {
      await Updates.fetchUpdateAsync()
      await Updates.reloadAsync() // Restarts the app with the new update
    }
  } catch (error) {
    console.error("Error checking for updates:", error)
  }
}, [])

export function onAppStateChange(status: AppStateStatus) {
  // React Query already supports in web browser refetch on window focus by default
  if (Platform.OS !== "web") {
    focusManager.setFocused(status === "active")
  }
}

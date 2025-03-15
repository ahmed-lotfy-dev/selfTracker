import { useCallback } from "react"
import * as Updates from "expo-updates"
import { AppState, AppStateStatus, Platform } from "react-native"
import { focusManager } from "@tanstack/react-query"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Check for updates
export const checkForUpdates = async () => {
  try {
    const update = await Updates.checkForUpdateAsync()
    if (update.isAvailable) {
      await Updates.fetchUpdateAsync()
      await Updates.reloadAsync() // Restarts the app with the new update
    }
  } catch (error) {
    console.error("Error checking for updates:", error)
  }
}

export function onAppStateChange(status: AppStateStatus) {
  // React Query already supports in web browser refetch on window focus by default
  if (Platform.OS !== "web") {
    focusManager.setFocused(status === "active")
  }
}

export const setTokens = async (value: unknown) => {
  try {
    const jsonValue = JSON.stringify(value)
    await AsyncStorage.setItem("tokens", jsonValue)
  } catch (e: any) {
    console.log(e.message)
  }
}

export const getTokens = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem("tokens")
    return jsonValue != null ? JSON.parse(jsonValue) : null
  } catch (e: any) {
    console.log(e.message)
  }
}

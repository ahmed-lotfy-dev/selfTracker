import * as Updates from "expo-updates"
import { Alert, AppStateStatus, Platform } from "react-native"
import { focusManager } from "@tanstack/react-query"

export const checkForUpdates = async () => {
  try {
    if (__DEV__) {
      return
    }

    const update = await Updates.checkForUpdateAsync()

    if (update.isAvailable) {
      await Updates.fetchUpdateAsync()
      await Updates.reloadAsync()
    } else {
    }
  } catch (error) {
    console.error("Error checking for updates:", error)
  }
}

import { runSync } from "../services/sync"
import NetInfo from "@react-native-community/netinfo"

export function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== "web") {
    focusManager.setFocused(status === "active")
    if (status === "active") {
      NetInfo.fetch().then((state) => {
        if (state.isConnected) {
          runSync().catch((e) => console.log("Sync failed:", e))
        }
      }).catch(() => { })
    }
  }
}

export const showAlert = (
  title: string,
  message: string,
  buttons?: {
    text: string
    onPress?: () => void
    style?: "cancel" | "destructive"
  }[]
) => {
  if (Platform.OS === "web") {
    alert(`${title}\n${message}`)
  } else {
    Alert.alert(title, message, buttons, { cancelable: true })
  }
}

export function formatLocalDate(date: string): string {
  const localDate = new Date(date)
  return (
    localDate.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }) || "No date available"
  )
}

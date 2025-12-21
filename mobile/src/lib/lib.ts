import * as Updates from "expo-updates"
import { Alert, AppStateStatus, Platform } from "react-native"
import { focusManager } from "@tanstack/react-query"
import NetInfo from "@react-native-community/netinfo"

export const checkForUpdates = async () => {
  try {
    if (__DEV__) {
      return
    }

    const update = await Updates.checkForUpdateAsync()

    if (update.isAvailable) {
      await Updates.fetchUpdateAsync()
      await Updates.reloadAsync()
    }
  } catch (error) {
    console.error("Error checking for updates:", error)
  }
}

export function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== "web") {
    focusManager.setFocused(status === "active")
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

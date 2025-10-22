import * as Updates from "expo-updates"
import { Alert, AppStateStatus, Platform } from "react-native"
import { focusManager } from "@tanstack/react-query"

export const checkForUpdates = async () => {
  try {
    if (__DEV__) {
      console.log("Skipping update check in development mode.")
      return
    }

    const update = await Updates.checkForUpdateAsync()

    if (update.isAvailable) {
      console.log("New update available! Downloading...")
      await Updates.fetchUpdateAsync()
      await Updates.reloadAsync()
    } else {
      console.log("App is up to date.")
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

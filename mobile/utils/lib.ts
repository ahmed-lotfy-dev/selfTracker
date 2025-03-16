import { useCallback } from "react"
import * as Updates from "expo-updates"
import { AppState, AppStateStatus, Platform } from "react-native"
import { focusManager } from "@tanstack/react-query"
import AsyncStorage from "@react-native-async-storage/async-storage"
import axiosInstance from "./api"

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

export const setToken = async (key: string, value: string) => {
  try {
    await AsyncStorage.setItem(key, value)
  } catch (e: any) {
    console.log(e.message)
  }
}

export const getToken = async (key: string) => {
  try {
    return await AsyncStorage.getItem(key)
  } catch (e: any) {
    console.log(e.message)
  }
}

export const getAllUsers = async () => {
  try {
    const users = await axiosInstance.get("/api/users")
    console.log(users)
    return users
  } catch (e: any) {
    console.log(e.message)
  }
}

import { useCallback } from "react"
import * as Updates from "expo-updates"
import { AppState, AppStateStatus, Platform } from "react-native"
import { focusManager } from "@tanstack/react-query"
import AsyncStorage from "@react-native-async-storage/async-storage"
import axiosInstance from "./api/axiosInstane"
import { API_BASE_URL } from "./api/auth"

import axios from "axios"
import { UserType } from "@/types/userType"

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

export const getUserData = async (): Promise<UserType> => {
  try {
    const accessToken = await AsyncStorage.getItem("accessToken")

    if (!accessToken) {
      throw new Error("No access token found")
    }

    const { data: user } = await axios.get<UserType>(
      `${API_BASE_URL}/api/users/me`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    return user
  } catch (error: any) {
    console.error("Failed to fetch user data:", error.message)

    throw new Error(
      error.response?.data?.message || "Failed to fetch user data"
    )
  }
}

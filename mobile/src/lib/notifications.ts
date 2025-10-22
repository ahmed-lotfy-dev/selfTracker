import * as Device from "expo-device"
import Constants from "expo-constants"
import { Platform } from "react-native"

export async function registerForPushNotificationsAsync(): Promise<
  string | undefined
> {
  // Skip if web or Expo Go
  if (Platform.OS === "web") {
    console.log("Skipping notifications setup on web.")
    return
  }
  if (Constants.appOwnership === "expo") {
    console.log("Skipping notifications setup in Expo Go.")
    return
  }
  if (!Device.isDevice) {
    console.warn("Must use physical device for Push Notifications")
    return
  }

  // Dynamically import only when needed (outside Expo Go)
  const Notifications = await import("expo-notifications")

  const { status: existingStatus } = await Notifications.default.getPermissionsAsync()
  let finalStatus = existingStatus

  if (existingStatus !== "granted") {
    const { status } = await Notifications.default.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== "granted") {
    console.warn("Push notification permissions not granted")
    return
  }

  const tokenData = await Notifications.default.getExpoPushTokenAsync()
  return tokenData.data
}

export function setUpNotificationListeners({
  onReceive,
  onResponse,
}: {
  onReceive?: (notification: any) => void
  onResponse?: (response: any) => void
}) {
  // Only set up listeners if not in Expo Go or web
  if (Platform.OS === "web" || Constants.appOwnership === "expo") {
    return () => {}
  }

  let notificationSubscription: any
  let responseSubscription: any

  const Notifications = require("expo-notifications")

  notificationSubscription =
    Notifications.addNotificationReceivedListener((notification: any) => {
      onReceive?.(notification)
    })

  responseSubscription =
    Notifications.addNotificationResponseReceivedListener((response: any) => {
      onResponse?.(response)
    })

  return () => {
    notificationSubscription?.remove()
    responseSubscription?.remove()
  }
}

// Setup notification handler only outside Expo Go
if (Platform.OS !== "web" && Constants.appOwnership !== "expo") {
  import("expo-notifications").then((Notifications) => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    })
  })
}

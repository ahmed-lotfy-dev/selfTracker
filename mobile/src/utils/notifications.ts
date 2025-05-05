// lib/notifications.ts
import * as Notifications from "expo-notifications"
import * as Device from "expo-device"

export async function registerForPushNotificationsAsync(): Promise<
  string | undefined
> {
  if (!Device.isDevice) {
    console.warn("Must use physical device for Push Notifications")
    return
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== "granted") {
    console.warn("Push notification permissions not granted")
    return
  }

  const tokenData = await Notifications.getExpoPushTokenAsync()
  return tokenData.data
}

export function setUpNotificationListeners({
  onReceive,
  onResponse,
}: {
  onReceive?: (notification: Notifications.Notification) => void
  onResponse?: (response: Notifications.NotificationResponse) => void
}) {
  const notificationSubscription =
    Notifications.addNotificationReceivedListener((notification) => {
      onReceive?.(notification)
    })

  const responseSubscription =
    Notifications.addNotificationResponseReceivedListener((response) => {
      onResponse?.(response)
    })

  return () => {
    notificationSubscription.remove()
    responseSubscription.remove()
  }
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

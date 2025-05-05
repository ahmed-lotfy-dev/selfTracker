import { useEffect } from "react"
import { Redirect, router, Stack, Tabs, useRouter } from "expo-router"
import { ActivityIndicator, View } from "react-native"

import Feather from "@expo/vector-icons/Feather"
import Ionicons from "@expo/vector-icons/Ionicons"
import AntDesign from "@expo/vector-icons/AntDesign"
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"
import FontAwesome5 from "@expo/vector-icons/FontAwesome5"

import { BottomTabBarProps } from "@react-navigation/bottom-tabs"
import { useAuth } from "@/src/hooks/useAuth"
import { COLORS } from "@/src/constants/Colors"
import { useHasHydrated } from "@/src/store/useAuthStore"

export default function TabsLayout() {
  const user = useAuth()
  const hasHydrated = useHasHydrated()

  useEffect(() => {
    if (hasHydrated && !user) {
      router.replace("/welcome")
    }
  }, [user, hasHydrated])

  if (!hasHydrated) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    )
  }

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Feather name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="weights"
        options={{
          title: "Weights",
          tabBarIcon: ({ color }) => (
            <Ionicons name="scale-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="workouts"
        options={{
          title: "Workouts",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="dumbbell" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tasks",
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="tasks" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <AntDesign name="user" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  )
}

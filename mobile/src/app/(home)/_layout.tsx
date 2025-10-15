import { useEffect } from "react"
import { Redirect, router, Stack, Tabs, useRouter } from "expo-router"
import { View } from "react-native"
import {
  NativeTabs,
  Icon,
  Label,
  VectorIcon,
} from "expo-router/unstable-native-tabs"

import Feather from "@expo/vector-icons/Feather"
import Ionicons from "@expo/vector-icons/Ionicons"
import AntDesign from "@expo/vector-icons/AntDesign"
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"
import FontAwesome5 from "@expo/vector-icons/FontAwesome5"
import Entypo from "@expo/vector-icons/Entypo"

import { BottomTabBarProps } from "@react-navigation/bottom-tabs"
import { useAuth } from "@/src/hooks/useAuth"
import { COLORS } from "@/src/constants/Colors"
import { useHasHydrated } from "@/src/store/useAuthStore"
import React from "react"
import { AnimatedTabBar } from "@/src/components/TabBar"
import ActivitySpinner from "@/src/components/ActivitySpinner"
import { MaterialIcons } from "@expo/vector-icons"

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
        <ActivitySpinner size="large" color={COLORS.primary} />
      </View>
    )
  }

  return (
    <NativeTabs
      tintColor={"lightgreen"}
      iconColor={"darkgreen"}
      backgroundColor={"white"}
      blurEffect="prominent"
      labelStyle={{ color: "blue" }}
      labelVisibilityMode="labeled"
      rippleColor={"darkgreen"}
      shadowColor={"green"}
      indicatorColor={"darkgreen"}
      backBehavior="initialRoute"
    >
      <NativeTabs.Trigger
        name="index"
        options={{
          labelStyle: { color: "darkgreen", fontWeight: 700 },
        }}
      >
        <Label>Home</Label>
        <Icon src={<VectorIcon family={Ionicons} name="home" />} />,
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        name="weights"
        options={{ labelStyle: { color: "darkgreen", fontWeight: 700 } }}
      >
        <Label>Weight</Label>
        <Icon src={<VectorIcon family={Ionicons} name="scale" />} />,
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        name="workouts"
        options={{ labelStyle: { color: "darkgreen", fontWeight: 700 } }}
      >
        <Label>Workout</Label>
        <Icon src={<VectorIcon family={FontAwesome5} name="dumbbell" />} />,
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        name="tasks"
        options={{ labelStyle: { color: "darkgreen", fontWeight: 700 } }}
      >
        <Label>Tasks</Label>
        <Icon src={<VectorIcon family={FontAwesome5} name="tasks" />} />,
      </NativeTabs.Trigger>
      {/* <NativeTabs.Trigger name="habits">
        <label>Habits</label>
      </NativeTabs.Trigger> */}
      <NativeTabs.Trigger
        name="profile"
        options={{ labelStyle: { color: "darkgreen", fontWeight: 700 } }}
      >
        <Label>Setting</Label>
        <Icon src={<VectorIcon family={Ionicons} name="settings" />} />,
      </NativeTabs.Trigger>
    </NativeTabs>
  )
}

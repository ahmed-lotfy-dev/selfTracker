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
      tintColor={COLORS.success}
      iconColor={"darkgreen"}
      backgroundColor={"white"}
      blurEffect="prominent"
    >
      <NativeTabs.Trigger
        name="index"
        options={{
          labelStyle: { color: "darkgreen", fontWeight: 700 },
          iconColor: "darkgreena",
          selectedIconColor: "darkgreen",blurEffect:"dark"
        }}
      >
        <Label>HOME</Label>
        <Icon src={<VectorIcon family={Ionicons} name="home" />} />,
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        name="weights"
        options={{ labelStyle: { color: "darkgreen", fontWeight: 700 } }}
      >
        <Label>WEIGHTS</Label>
        <Icon src={<VectorIcon family={Ionicons} name="scale" />} />,
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        name="workouts"
        options={{ labelStyle: { color: "darkgreen", fontWeight: 700 } }}
      >
        <Label>Workouts</Label>
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
        <Label>Settings</Label>
        <Icon src={<VectorIcon family={Ionicons} name="settings" />} />,
      </NativeTabs.Trigger>
    </NativeTabs>
    // <Tabs
    //   screenOptions={{ headerShown: false, headerTransparent: true }}
    //   tabBar={(props) => <AnimatedTabBar {...props} />}
    // >
    //   <Tabs.Screen
    //     name="index"
    //     options={{
    //       title: "Home",
    //     }}
    //   />
    //   <Tabs.Screen
    //     name="weights"
    //     options={{
    //       title: "Weights",
    //     }}
    //   />
    //   <Tabs.Screen
    //     name="workouts"
    //     options={{
    //       title: "Workouts",
    //     }}
    //   />
    //   <Tabs.Screen
    //     name="tasks"
    //     options={{
    //       title: "Tasks",
    //     }}
    //   />
    //   <Tabs.Screen
    //     name="habits"
    //     options={{
    //       title: "Habits",
    //     }}
    //   />
    //   <Tabs.Screen
    //     name="profile"
    //     options={{
    //       title: "Profile",
    //     }}
    //   />
    // </Tabs>
  )
}

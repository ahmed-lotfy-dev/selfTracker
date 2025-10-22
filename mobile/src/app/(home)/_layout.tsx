import { useEffect } from "react"
import { Redirect, router, Stack, Tabs, useRouter } from "expo-router"
import { Platform, View } from "react-native"
import {
  NativeTabs,
  Icon,
  Label,
  VectorIcon,
} from "expo-router/unstable-native-tabs"

import Ionicons from "@expo/vector-icons/Ionicons"
import FontAwesome5 from "@expo/vector-icons/FontAwesome5"

import { BottomTabBarProps } from "@react-navigation/bottom-tabs"
import { useAuth } from "@/src/hooks/useAuth"
import { COLORS, useThemeColors } from "@/src/constants/Colors"
import { useHasHydrated } from "@/src/store/useAuthStore"
import React from "react"
import { AnimatedTabBar } from "@/src/components/TabBar"
import ActivitySpinner from "@/src/components/ActivitySpinner"
import {
  AntDesign,
  Feather,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons"
import { Uniwind, useUniwind } from "uniwind"

export default function TabsLayout() {
  const { theme } = useUniwind()
  if (Platform.OS === "ios" || Platform.OS === "android") {
    return (
      <NativeTabs
        labelVisibilityMode="labeled"
        backBehavior="initialRoute"
        iconColor={theme === "light" ? "darkgreen" : "lightgreen"}
        
      >
        <NativeTabs.Trigger
          name="home"
          options={{
            labelStyle: {
              color: theme === "light" ? "green" : "lightgreen",
              fontWeight: 700,
            },
          }}
        >
          <Label>Home</Label>
          <Icon src={<VectorIcon family={Ionicons} name="home" />} />,
        </NativeTabs.Trigger>
        <NativeTabs.Trigger
          name="weights"
          options={{
            labelStyle: {
              color: theme === "light" ? "green" : "lightgreen",
              fontWeight: 700,
            },
          }}
        >
          <Label>Weight</Label>
          <Icon src={<VectorIcon family={Ionicons} name="scale" />} />,
        </NativeTabs.Trigger>
        <NativeTabs.Trigger
          name="workouts"
          options={{
            labelStyle: {
              color: theme === "light" ? "green" : "lightgreen",
              fontWeight: 700,
            },
          }}
        >
          <Label>Workout</Label>
          <Icon src={<VectorIcon family={FontAwesome5} name="dumbbell" />} />,
        </NativeTabs.Trigger>
        <NativeTabs.Trigger
          name="tasks"
          options={{
            labelStyle: {
              color: theme === "light" ? "green" : "lightgreen",
              fontWeight: 700,
            },
          }}
        >
          <Label>Tasks</Label>
          <Icon src={<VectorIcon family={FontAwesome5} name="tasks" />} />,
        </NativeTabs.Trigger>
        <NativeTabs.Trigger
          name="profile"
          options={{
            labelStyle: {
              color: theme === "light" ? "green" : "lightgreen",
              fontWeight: 700,
            },
          }}
        >
          <Label>Settings</Label>
          <Icon src={<VectorIcon family={Ionicons} name="settings" />} />,
        </NativeTabs.Trigger>
      </NativeTabs>
    )
  } else {
    return (
      <Tabs screenOptions={{ headerShown: false, headerTransparent: true }}>
        <Tabs.Screen
          name="home"
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
}

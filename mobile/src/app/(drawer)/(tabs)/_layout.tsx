import {
  NativeTabs,
  Icon,
  Label,
  VectorIcon,
} from "expo-router/unstable-native-tabs"
import React from "react"

import Ionicons from "@expo/vector-icons/Ionicons"
import FontAwesome5 from "@expo/vector-icons/FontAwesome5"

import { useThemeColors } from "@/src/constants/Colors"

export default function TabsLayout() {
  const colors = useThemeColors()

  return (
    <NativeTabs
      labelVisibilityMode="labeled"
      backBehavior="initialRoute"
      iconColor={{
        default: colors.icon,
        selected: colors.primary
      }}
    >
      <NativeTabs.Trigger
        name="home"
        options={{
          labelStyle: {
            color: colors.primary,
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
            color: colors.primary,
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
            color: colors.primary,
            fontWeight: 700,
          },
        }}
      >
        <Label>Workout</Label>
        <Icon src={<VectorIcon family={FontAwesome5} name="dumbbell" />} />,
      </NativeTabs.Trigger>

      <NativeTabs.Trigger
        name="habits"
        options={{
          labelStyle: {
            color: colors.primary,
            fontWeight: 700,
          },
        }}
      >
        <Label>Habits</Label>
        <Icon src={<VectorIcon family={FontAwesome5} name="fire" />} />,
      </NativeTabs.Trigger>

      <NativeTabs.Trigger
        name="tasks"
        options={{
          labelStyle: {
            color: colors.primary,
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
            color: colors.primary,
            fontWeight: 700,
          },
        }}
      >
        <Label>Settings</Label>
        <Icon src={<VectorIcon family={Ionicons} name="settings" />} />,
      </NativeTabs.Trigger>
    </NativeTabs>
  )
}

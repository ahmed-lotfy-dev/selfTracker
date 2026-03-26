import { NativeTabs } from "expo-router/unstable-native-tabs"
import React from "react"
import { useThemeColors } from "@/src/constants/Colors"

export default function TabsLayout() {
  const colors = useThemeColors()

  return (
    <NativeTabs
      labelVisibilityMode="labeled"
      tintColor={colors.primary}
      labelStyle={{
        default: {
          color: colors.text,
          fontWeight: '400',
        },
        selected: {
          color: colors.primary,
          fontWeight: '700',
        }
      }}
    >
      <NativeTabs.Trigger name="home">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "house", selected: "house.fill" }}
          md="home"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="nutrition">
        <NativeTabs.Trigger.Label>Food</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "leaf", selected: "leaf.fill" }}
          md="nutrition"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="habits">
        <NativeTabs.Trigger.Label>Habits</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "flame", selected: "flame.fill" }}
          md="local_fire_department"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "gearshape", selected: "gearshape.fill" }}
          md="settings"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  )
}

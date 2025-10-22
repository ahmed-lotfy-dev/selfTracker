import React from "react"
import { View, Pressable, Text } from "react-native"
import { Uniwind, useUniwind } from "uniwind"

interface ThemeOption {
  name: "light" | "dark" | "system";
  label: string;
  icon: string;
}

export const ThemeSwitcher = () => {
  const { theme } = useUniwind()

  const themes: ThemeOption[] = [
    { name: "light", label: "Light", icon: "☀️" },
    { name: "dark", label: "Dark", icon: "🌙" },
    { name: "system", label: "System", icon: "⚙️" },
  ]

  return (
    <View className="flex-1 flex-row gap-2 p-4">
      {themes.map((t) => (
        <Pressable
          key={t.name}
          onPress={() => Uniwind.setTheme(t.name)}
          className={`
            px-4 py-2 rounded-lg
            ${theme === t.name ? "bg-blue-500" : "bg-gray-200 dark:bg-gray-700"}
          `}
        >
          <Text
            className={
              theme === t.name ? "text-white" : "text-gray-900 dark:text-white"
            }
          >
            {t.icon} {t.label}
          </Text>
        </Pressable>
      ))}
    </View>
  )
}

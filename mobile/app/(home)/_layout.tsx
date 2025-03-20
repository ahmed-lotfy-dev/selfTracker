import { Tabs } from "expo-router"
import { Home, Weight, Dumbbell } from "@tamagui/lucide-icons"
export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color }) => <Home size={28} color={"darkgoldenrod"} />,
        }}
      />
      <Tabs.Screen
        name="weights"
        options={{
          title: "Weights",
          headerShown: false,
          tabBarIcon: ({ color }) => <Weight size={28} color={"darkgoldenrod"} />,
        }}
      />
      <Tabs.Screen
        name="workouts"
        options={{
          title: "Workouts",
          headerShown: false,
          tabBarIcon: ({ color }) => <Dumbbell size={28} color={"darkgoldenrod"} />,
        }}
      />
    </Tabs>
  )
}

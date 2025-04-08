import { Tabs, useRouter } from "expo-router"
import { Pressable } from "react-native"
import Feather from "@expo/vector-icons/Feather"
import Ionicons from "@expo/vector-icons/Ionicons"
import TabBar from "../../components/TabBar"
import AntDesign from "@expo/vector-icons/AntDesign"
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"
import FontAwesome5 from "@expo/vector-icons/FontAwesome5"

import { BottomTabBarProps } from "@react-navigation/bottom-tabs"

export default function TabsLayout() {
  const router = useRouter()

  return (
    <Tabs
      tabBar={(props: BottomTabBarProps) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <Feather name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="weights"
        options={{
          title: "Weights",
          headerShown: false,
          headerTitleAlign: "center",

          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name="scale-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="workouts"
        options={{
          title: "Workouts",
          headerShown: false,
          headerTitleAlign: "center",

          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons name="dumbbell" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tasks",
          headerShown: false,
          headerTitleAlign: "center",

          tabBarIcon: ({ color, size, focused }) => (
            <FontAwesome5 name="tasks" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          headerTitleAlign: "center",

          tabBarIcon: ({ color, size, focused }) => (
            <AntDesign name="user" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  )
}

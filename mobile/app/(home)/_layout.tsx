import { Tabs, useRouter } from "expo-router"
import { Pressable } from "react-native"
import Feather from "@expo/vector-icons/Feather"
import Ionicons from "@expo/vector-icons/Ionicons"
import FontAwesome6 from "@expo/vector-icons/FontAwesome6"
import Entypo from "@expo/vector-icons/Entypo"

export default function TabsLayout() {
  const router = useRouter()

  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Feather name="home" size={24} color="black" />
          ),
        }}
      />
      <Tabs.Screen
        name="weights"
        options={{
          title: "Weights",
          headerShown: true,
          headerTitleAlign: "center",

          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={{ padding: 10 }}>
              <Entypo name="chevron-thin-left" size={24} color="black" />
            </Pressable>
          ),
          tabBarIcon: ({ color }) => (
            <Ionicons name="scale-outline" size={24} color="black" />
          ),
        }}
      />
      <Tabs.Screen
        name="workouts"
        options={{
          title: "Workouts",
          headerShown: true,
          headerTitleAlign: "center",
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={{ padding: 10 }}>
              <Entypo name="chevron-thin-left" size={24} color="black" />
            </Pressable>
          ),

          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="dumbbell" size={24} color="black" />
          ),
        }}
      />
    </Tabs>
  )
}

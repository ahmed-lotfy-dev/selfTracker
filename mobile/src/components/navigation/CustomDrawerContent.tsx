import React from "react"
import { View, Text, Pressable, Image } from "react-native"
import { DrawerContentComponentProps, DrawerContentScrollView } from "@react-navigation/drawer"
import { Feather, FontAwesome5, Ionicons } from "@expo/vector-icons"
import { useRouter, usePathname } from "expo-router"
import { BlurView } from "expo-blur"
import { useThemeColors } from "@/src/constants/Colors"
import { LinearGradient } from "expo-linear-gradient"
import { useAuthStore } from "@/src/features/auth/useAuthStore"

export default function CustomDrawerContent(props: DrawerContentComponentProps) {
  const colors = useThemeColors()
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuthStore()

  const isActive = (route: string) => {
    if (route === "/home" && (pathname === "/home" || pathname === "/")) return true
    return pathname.startsWith(route)
  }

  const menuItems = [
    { label: "Home", icon: "home", route: "/home", type: "feather" },
    { label: "Weights", icon: "weight", route: "/weights", type: "font-awesome-5" },
    { label: "Workouts", icon: "dumbbell", route: "/workouts", type: "font-awesome-5" },
    { label: "Nutrition", icon: "nutrition", route: "/nutrition", type: "ionicon" },
    { label: "Tasks", icon: "check-square", route: "/tasks", type: "feather" },
    { label: "Habits", icon: "repeat", route: "/home/habits", type: "feather" },
    { label: "Finances", icon: "dollar-sign", route: "/finances", type: "feather", pending: true },
    { label: "Focus Timer", icon: "clock", route: "/focus", type: "feather", pending: true },
    { label: "Profile", icon: "user", route: "/profile", type: "feather" },
  ]

  return (
    <View className="flex-1 bg-background">
      <LinearGradient
        colors={['rgba(99, 102, 241, 0.15)', 'transparent']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 300 }}
      />

      <View className="pt-16 pb-10 px-6">
        <View className="flex-row items-center gap-4">
          <View className="w-16 h-16 rounded-[24px] overflow-hidden border-2 border-primary/20 bg-card">
            {user?.photoURL ? (
              <Image source={{ uri: user.photoURL }} className="w-full h-full" />
            ) : (
              <View className="w-full h-full items-center justify-center bg-primary/10">
                <Text className="text-primary text-2xl font-black">
                  {user?.displayName?.charAt(0) || "U"}
                </Text>
              </View>
            )}
          </View>
          <View className="flex-1">
            <View className="flex-row items-baseline gap-2">
              <Text className="text-lg font-bold text-text truncate max-w-[120px]" numberOfLines={1}>
                {user?.displayName || "Athlete"}
              </Text>
              <View className="bg-primary/20 px-1.5 py-0.5 rounded-md">
                <Text className="text-primary text-[8px] font-black uppercase">PRO</Text>
              </View>
            </View>
            <Text className="text-xs text-placeholder font-medium" numberOfLines={1}>
              {user?.email || "Locked in"}
            </Text>
          </View>
        </View>
      </View>

      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
        <View className="px-3">
          <Text className="text-[10px] font-black text-placeholder uppercase tracking-[3px] ml-4 mb-4">
            Navigation
          </Text>
          {menuItems.map((item, index) => {
            const active = isActive(item.route)
            return (
              <Pressable
                key={index}
                onPress={() => {
                  if (item.pending) return
                  props.navigation.closeDrawer()
                  if (item.label === "Habits") {
                    // Force nested navigation for Habits to avoid trigger issues
                    props.navigation.navigate("(tabs)", {
                      screen: "home",
                      params: { screen: "habits" }
                    })
                  } else {
                    router.push(item.route as any)
                  }
                }}
                className={`flex-row items-center px-4 py-3.5 mb-1 rounded-xl active:bg-card/80 ${active ? "bg-primary/10" : "bg-transparent"
                  }`}
              >
                <View className={`w-10 h-10 rounded-xl items-center justify-center mr-4 ${active ? "bg-primary/20" : "bg-white/5"
                  }`}>
                  {item.type === "feather" && <Feather name={item.icon as any} size={20} color={active ? colors.primary : colors.text} />}
                  {item.type === "font-awesome-5" && <FontAwesome5 name={item.icon} size={18} color={active ? colors.primary : colors.text} />}
                  {item.type === "ionicon" && <Ionicons name={item.icon as any} size={22} color={active ? colors.primary : colors.text} />}
                </View>

                <View className="flex-1 flex-row items-center justify-between">
                  <Text className={`text-base font-bold ${active ? "text-primary" : "text-text"}`}>
                    {item.label}
                  </Text>
                  {item.pending && (
                    <View className="bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                      <Text className="text-[8px] font-black text-white/30 uppercase">SOON</Text>
                    </View>
                  )}
                </View>
              </Pressable>
            )
          })}
        </View>
      </DrawerContentScrollView>

      <View className="p-6 border-t border-white/5">
        <Pressable
          onPress={() => {
            props.navigation.closeDrawer()
            router.navigate("/profile")
          }}
          className="flex-row items-center gap-3 active:opacity-50"
        >
          <View className="w-8 h-8 rounded-lg bg-white/5 items-center justify-center">
            <Feather name="settings" size={16} color="rgba(255,255,255,0.4)" />
          </View>
          <Text className="text-sm font-bold text-placeholder">Advanced Settings</Text>
        </Pressable>
      </View>
    </View>
  )
}

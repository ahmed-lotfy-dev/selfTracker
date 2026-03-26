import React from "react"
import { View, Text, Pressable, Image } from "react-native"
import { DrawerContentComponentProps, DrawerContentScrollView } from "@react-navigation/drawer"
import { Feather, FontAwesome5, Ionicons } from "@expo/vector-icons"
import { useRouter, usePathname } from "expo-router"
import { useThemeColors } from "@/src/constants/Colors"
import { LinearGradient } from "expo-linear-gradient"
import { useAuthStore } from "@/src/features/auth/useAuthStore"

interface MenuItem {
  label: string
  icon: string
  route: string
  type: 'feather' | 'font-awesome-5' | 'ionicon'
  pending?: boolean
}

export default function CustomDrawerContent(props: DrawerContentComponentProps) {
  const colors = useThemeColors()
  const router = useRouter()
  const pathname = usePathname().replace(/\/$/, "")
  const { user } = useAuthStore()

  const isActive = (route: string) => {
    const normalizedRoute = route.replace(/\/$/, "")
    if (normalizedRoute === "/home" && (pathname === "/home" || pathname === "")) return true
    if (normalizedRoute === "/habits" && pathname === "/home/habits_stack") return true
    return pathname.startsWith(normalizedRoute)
  }

  const navigationItems: MenuItem[] = [
    { label: "Home", icon: "home", route: "/home", type: "feather" },
    { label: "Nutrition", icon: "nutrition", route: "/nutrition", type: "ionicon" },
    { label: "Habits", icon: "flame", route: "/habits", type: "ionicon" },
  ]

  const trackingItems: MenuItem[] = [
    { label: "Weight", icon: "weight", route: "/home/weights", type: "font-awesome-5" },
    { label: "Workouts", icon: "dumbbell", route: "/home/workouts", type: "font-awesome-5" },
    { label: "Tasks", icon: "check-square", route: "/home/tasks", type: "feather" },
  ]

  const systemItems: MenuItem[] = [
    { label: "Settings", icon: "settings", route: "/profile", type: "ionicon" },
  ]

  const comingSoonItems: MenuItem[] = [
    { label: "Finances", icon: "dollar-sign", route: "/finances", type: "feather", pending: true },
    { label: "Focus Timer", icon: "clock", route: "/focus", type: "feather", pending: true },
  ]

  const renderSection = (title: string, items: MenuItem[], showMargin = true) => (
    <View className={showMargin ? "mt-6" : ""}>
      <Text className="text-[10px] font-black text-placeholder uppercase tracking-[3px] ml-4 mb-3">
        {title}
      </Text>
      {items.map((item, index) => {
        const active = isActive(item.route)
        return (
          <Pressable
            key={index}
            onPress={() => {
              if (item?.pending) return
              props.navigation.closeDrawer()
              router.push(item.route as any)
            }}
            className={`flex-row items-center px-4 py-2 mb-0.5 rounded-xl active:bg-card/80 ${active ? "bg-primary/10" : "bg-transparent"}`}
          >
            <View className={`w-10 h-10 rounded-xl items-center justify-center mr-4 ${active ? "bg-primary/20" : "bg-white/5"}`}>
              {item.type === "feather" && <Feather name={item.icon as any} size={20} color={active ? colors.primary : colors.text} />}
              {item.type === "font-awesome-5" && <FontAwesome5 name={item.icon} size={18} color={active ? colors.primary : colors.text} />}
              {item.type === "ionicon" && <Ionicons name={item.icon as any} size={22} color={active ? colors.primary : colors.text} />}
            </View>
            <View className="flex-1 flex-row items-center justify-between">
              <Text className={`text-base font-bold ${active ? "text-primary" : "text-text"}`}>
                {item.label}
              </Text>
              {item?.pending && (
                <View className="bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                  <Text className="text-[8px] font-black text-white/30 uppercase">SOON</Text>
                </View>
              )}
            </View>
          </Pressable>
        )
      })}
    </View>
  )

  return (
    <View className="flex-1 bg-background">
      <LinearGradient
        colors={['rgba(99, 102, 241, 0.15)', 'transparent']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 200}}
      />

      <View className="pt-8 pb-4 px-6">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <View className="w-12 h-12 rounded-[18px] overflow-hidden border-2 border-primary/20 bg-card items-center justify-center">
              <Image 
                source={require("@/assets/images/logo.png")} 
                className="w-full h-full" 
                resizeMode="contain"
              />
            </View>
            <View className="flex-1">
              <View className="flex-row items-baseline gap-2">
                <Text className="text-lg font-bold text-text truncate max-w-[120px]" numberOfLines={1}>
                  {user?.displayName || "Self Tracker"}
                </Text>
              </View>
              <Text className="text-xs text-placeholder font-medium" numberOfLines={1}>
                {user?.email || "Locked in"}
              </Text>
            </View>
          </View>
          
          <Pressable 
            onPress={() => props.navigation.closeDrawer()}
            className="w-8 h-8 items-center justify-center rounded-full bg-white/5 active:bg-white/10"
            style={{ marginRight: 4 }}
          >
            <Ionicons name="close" size={20} color={colors.text} />
          </Pressable>
        </View>
      </View>

      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
        <View className="px-3 pb-10">
          {renderSection("Navigation", navigationItems, false)}
          {renderSection("Tracking", trackingItems)}
          {renderSection("Experimental", comingSoonItems)}
          {renderSection("System", systemItems)}
        </View>
      </DrawerContentScrollView>
    </View>
  )
}

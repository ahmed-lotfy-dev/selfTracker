import { View, Text, Pressable, Image, ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import React from "react"
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer"
import { useRouter, usePathname } from "expo-router"
import { useAuth } from "@/src/features/auth/useAuthStore"
import { Ionicons, MaterialIcons, FontAwesome5, Feather } from "@expo/vector-icons"
import { useThemeColors } from "@/src/constants/Colors"

export default function CustomDrawerContent(props: any) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const colors = useThemeColors()

  const menuItems = [
    { label: "Home", icon: "home", route: "/home", type: "feather" },
    { label: "Weights", icon: "weight", route: "/weights", type: "font-awesome-5" },
    { label: "Workouts", icon: "dumbbell", route: "/workouts", type: "font-awesome-5" },
    { label: "Nutrition", icon: "nutrition", route: "/nutrition", type: "ionicon" },
    { label: "Tasks", icon: "check-square", route: "/tasks", type: "feather" },
    { label: "Habits", icon: "repeat", route: "/habits", type: "feather" },
    { label: "Finances", icon: "dollar-sign", route: "/finances", type: "feather", pending: true },
    { label: "Focus Timer", icon: "clock", route: "/focus", type: "feather", pending: true },
    { label: "Profile", icon: "user", route: "/profile", type: "feather" },
  ]

  return (
    <View className="flex-1 bg-background">
      <View className="flex-1 bg-background pt-12 pb-6">
        <View className="flex-1">
          {/* User Header */}
          <View className="px-6 py-8 border-b border-border mb-2">
            <View className="flex-row items-center gap-4">
              <View className="h-14 w-14 rounded-full bg-primary/10 items-center justify-center overflow-hidden border border-primary/20">
                {user?.image ? (
                  <Image source={{ uri: user.image }} className="h-full w-full" />
                ) : (
                  <Text className="text-xl font-bold text-primary">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </Text>
                )}
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-text truncate" numberOfLines={1}>
                  {user?.name || "User"}
                </Text>
                <Text className="text-sm text-placeholder truncate" numberOfLines={1}>
                  {user?.email}
                </Text>
              </View>
            </View>
          </View>

          <ScrollView className="flex-1 px-3" showsVerticalScrollIndicator={false}>
            <Text className="px-3 py-2 text-xs font-bold text-placeholder uppercase tracking-widest mb-1">
              Menu
            </Text>

            {menuItems.map((item, index) => {
              const isActive = item.pending ? false : (pathname?.includes(item.route) ?? false)

              const IconComponent =
                item.type === 'font-awesome-5' ? FontAwesome5 :
                  item.type === 'ionicon' ? Ionicons :
                    Feather;

              return (
                <Pressable
                  key={index}
                  onPress={() => {
                    if (item.pending) {
                      return;
                    }
                    router.push(item.route as any)
                  }}
                  className={`flex-row items-center px-4 py-3.5 mb-1 rounded-xl active:bg-card/80 ${isActive ? "bg-primary/10" : "bg-transparent"
                    }`}
                >
                  <View className="w-8 items-center">
                    <IconComponent
                      name={item.icon as any}
                      size={20}
                      color={isActive ? colors.primary : colors.text}
                      style={{ opacity: item.pending ? 0.5 : 1 }}
                    />
                  </View>
                  <Text
                    className={`ml-3 text-[15px] font-medium ${isActive ? "text-primary" : "text-text"
                      } ${item.pending ? "text-placeholder" : ""}`}
                  >
                    {item.label}
                  </Text>

                  {item.pending && (
                    <View className="ml-auto bg-card border border-border px-2 py-0.5 rounded text-[10px]">
                      <Text className="text-[10px] text-placeholder font-medium">SOON</Text>
                    </View>
                  )}
                </Pressable>
              )
            })}
          </ScrollView>

          {/* Footer - Logout */}
          <View className="p-4 border-t border-border">
            <Pressable
              onPress={logout}
              className="flex-row items-center justify-center bg-card border border-border p-4 rounded-2xl active:opacity-80"
            >
              <MaterialIcons name="logout" size={20} color={colors.error} />
              <Text className="ml-2 font-semibold" style={{ color: colors.error }}>Sign Out</Text>
            </Pressable>
            <Text className="text-center text-[10px] text-placeholder mt-4">
              v1.0.0 • SelfTracker
            </Text>
          </View>
        </View>
      </View>
    </View>
  )
}

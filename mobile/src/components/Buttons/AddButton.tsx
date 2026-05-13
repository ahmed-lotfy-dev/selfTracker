import React from "react"
import { View, StyleSheet, Pressable } from "react-native"
import Entypo from "@expo/vector-icons/Entypo"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { Route, useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated"


interface AddButtonProps {
  path: string
  icon?: string
  iconFamily?: "entypo" | "ionicons"
}

export default function AddButton({
  path,
  icon = "plus",
  iconFamily = "entypo",
}: AddButtonProps) {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const scale = useSharedValue(1)
  const IconComponent = iconFamily === "ionicons" ? Ionicons : Entypo

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = () => {
    scale.value = withSpring(0.88, { damping: 14, stiffness: 200 })
  }

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 14, stiffness: 200 })
  }

  const handlePress = () => {
    router.push(`${path}/add` as Route)
  }

  return (
    <Animated.View style={[styles.fab, { bottom: insets.bottom + 16 }, animatedStyle]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.pressable}
      >
        <LinearGradient
          colors={["#34d399", "#10b981", "#059669"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.icon}>
          <IconComponent name={icon as any} size={26} color="white" />
        </View>
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 10,
  },
  pressable: {
    flex: 1,
    borderRadius: 29,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.25)",
  },
  icon: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
})

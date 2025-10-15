import React from "react"
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
} from "react-native"
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
} from "react-native-reanimated"
import Feather from "@expo/vector-icons/Feather"
import Ionicons from "@expo/vector-icons/Ionicons"
import AntDesign from "@expo/vector-icons/AntDesign"
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"
import FontAwesome5 from "@expo/vector-icons/FontAwesome5"
import Entypo from "@expo/vector-icons/Entypo"
import { BottomTabBarProps } from "@react-navigation/bottom-tabs"
import { COLORS } from "@/src/constants/Colors"

const { width } = Dimensions.get("window")
const TAB_WIDTH = width / 6

const icons: Record<string, any> = {
  index: (color: string) => <Feather name="home" size={25} color={color} />,
  weights: (color: string) => (
    <Ionicons name="scale-outline" size={25} color={color} />
  ),
  workouts: (color: string) => (
    <MaterialCommunityIcons name="dumbbell" size={25} color={color} />
  ),
  tasks: (color: string) => (
    <FontAwesome5 name="tasks" size={20} color={color} />
  ),
  habits: (color: string) => <Entypo name="trophy" size={25} color={color} />,
  profile: (color: string) => <AntDesign name="user" size={25} color={color} />,
}

export const AnimatedTabBar = ({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) => {
  const activeIndex = useSharedValue(state.index)

  React.useEffect(() => {
    activeIndex.value = withSpring(state.index, { damping: 15, stiffness: 150 })
  }, [state.index])

  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key]
        const label =
          typeof options.tabBarLabel === "string"
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name

        const isFocused = state.index === index

        const animatedScale = useSharedValue(isFocused ? 1.2 : 1)

        React.useEffect(() => {
          animatedScale.value = withSpring(isFocused ? 1.2 : 1, {
            damping: 12,
            stiffness: 180,
          })
        }, [isFocused])

        const iconStyle = useAnimatedStyle(() => ({
          transform: [{ scale: animatedScale.value }],
        }))

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            onPress={() => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              })
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name)
              }
            }}
            style={styles.tabButton}
          >
            <Animated.View style={[iconStyle]}>
              {icons[route.name]?.(isFocused ? COLORS.secondary : COLORS.gray)}
            </Animated.View>
            <Text
              style={[
                styles.label,
                { color: isFocused ? COLORS.secondary : COLORS.gray },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    height: 72,
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 10,
    borderTopWidth: 0.6,
    borderColor: COLORS.border,
    justifyContent: "space-around",
    alignItems: "center",
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: -2 },
  },
  tabButton: {
    width: TAB_WIDTH,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: "500",
  },
})

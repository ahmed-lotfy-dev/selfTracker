import React, { useRef, useState } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  ViewToken,
  Platform,
} from "react-native"
import { useRouter, Stack } from "expo-router"
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  interpolateColor,
  FadeInDown,
} from "react-native-reanimated"
import { useOnboardingStore } from "@/src/features/onboarding/useOnboardingStore"
import { useThemeColors } from "@/src/constants/Colors"
import { StatusBar } from "expo-status-bar"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useColorScheme } from "react-native"

// Onboarding steps moved to onboardingData.ts

import { onboardingSteps } from "@/src/components/features/onboarding/onboardingData"
import OnboardingItem from "@/src/components/features/onboarding/OnboardingItem"
import OnboardingPaginator from "@/src/components/features/onboarding/OnboardingPaginator"

const { width } = Dimensions.get("window")

export default function OnboardingScreen() {
  const router = useRouter()
  const listRef = useRef<Animated.FlatList<any>>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const theme = useColorScheme() ?? "light"
  const scrollX = useSharedValue(0)

  // Gradient Colors based on Theme
  const gradientColors =
    theme === "light"
      ? (["#FFFFFF", "#F0F4F8", "#E6F0FF"] as const)
      : (["#0F172A", "#1E293B", "#000000"] as const)

  // Handlers
  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x
    },
  })

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0] && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index)
      }
    }
  ).current

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current

  const finishOnboarding = async () => {
    useOnboardingStore.getState().setIsOnboarding(false)
    router.replace("/sign-in")
  }

  const handleNext = () => {
    if (currentIndex < onboardingSteps.length - 1) {
      listRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      })
    } else {
      finishOnboarding()
    }
  }

  return (
    <LinearGradient
      colors={gradientColors}
      className="flex-1"
      key={theme}
    >
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <Stack.Screen options={{ headerShown: false }} />

      <View className="absolute z-10 top-14 right-8 ios:top-14 android:top-10">
        <TouchableOpacity onPress={finishOnboarding} hitSlop={10}>
          <Text
            className="text-base font-semibold opacity-70 text-text"
          >
            Skip
          </Text>
        </TouchableOpacity>
      </View>

      <Animated.FlatList
        ref={listRef}
        data={onboardingSteps}
        renderItem={({ item, index }) => <OnboardingItem item={item} index={index} scrollX={scrollX} />}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewConfig}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />

      <View className="h-32 px-8 flex-row items-center justify-between pb-5">
        <OnboardingPaginator scrollX={scrollX} />

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleNext}
          className="py-4 px-6 rounded-full justify-center items-center shadow-lg bg-secondary min-w-[60px] h-[60px]"
        >
          {currentIndex === onboardingSteps.length - 1 ? (
            <Animated.View entering={FadeInDown.springify()} key="start">
              <Text className="text-white text-lg font-bold">Get Started</Text>
            </Animated.View>
          ) : (
            <Animated.View entering={FadeInDown.springify()} key="next">
              <Ionicons name="arrow-forward" size={24} color="#FFF" />
            </Animated.View>
          )}
        </TouchableOpacity>
      </View>
    </LinearGradient>
  )
}

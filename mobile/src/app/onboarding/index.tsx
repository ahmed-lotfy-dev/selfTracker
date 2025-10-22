import React, { useState, useRef } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  Animated,
  ListRenderItem,
  Platform,
} from "react-native"
import { useRouter, Stack } from "expo-router"
import { useOnboardingStore } from "@/src/store/useOnboardingStore"
import { useThemeColors } from "@/src/constants/Colors"

const { width } = Dimensions.get("window")

interface OnboardingStep {
  id: string
  image: any
  title: string
  description: string
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: "1",
    image: require("@/assets/images/react-logo.png"),
    title: "Track Your Progress",
    description:
      "Monitor your fitness, habits, and goals with ease. See your journey unfold.",
  },
  {
    id: "2",
    image: require("@/assets/images/react-logo.png"),
    title: "Customize Your Journey",
    description:
      "Tailor your tracking experience to fit your unique needs and preferences.",
  },
  {
    id: "3",
    image: require("@/assets/images/react-logo.png"), // fixed invalid path
    title: "Achieve Your Goals",
    description:
      "Stay motivated and reach your personal best with insightful data and reminders.",
  },
]

export default function OnboardingScreen() {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollX = useRef(new Animated.Value(0)).current
  const slidesRef = useRef<FlatList<OnboardingStep>>(null)
  const colors = useThemeColors()

  const viewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<any> }) => {
      if (viewableItems.length > 0) setCurrentIndex(viewableItems[0].index)
    }
  ).current

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current

  const scrollToNext = () => {
    if (currentIndex < onboardingSteps.length - 1) {
      if (slidesRef.current) {
        slidesRef.current.scrollToIndex({
          index: currentIndex + 1,
          animated: true,
        })
      }
    } else {
      onFinish()
    }
  }

  const onFinish = () => {
    useOnboardingStore.getState().setIsOnboarding(false)
    router.push("/sign-in")
  }

  const skipToEnd = () => {
    useOnboardingStore.getState().setIsOnboarding(false)
    router.push("/sign-in")
  }

  const renderItem: ListRenderItem<OnboardingStep> = ({ item }) => (
    <View
      style={{
        width,
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
      }}
    >
      <Image
        source={item.image}
        style={{
          width: width * 0.6,
          height: width * 0.6,
          marginBottom: 32,
          resizeMode: "contain",
        }}
      />
      <Text
        className="text-2xl font-bold text-center mb-3"
        style={{ color: colors.secondary }}
      >
        {item.title}
      </Text>
      <Text
        className="text-base text-center leading-6"
        style={{ color: colors.text }}
      >
        {item.description}
      </Text>
    </View>
  )

  const Dot = ({ index }: { index: number }) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width]
    const dotWidth = scrollX.interpolate({
      inputRange,
      outputRange: [8, 20, 8],
      extrapolate: "clamp",
    })
    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.3, 1, 0.3],
      extrapolate: "clamp",
    })
    return (
      <Animated.View
        style={{
          width: dotWidth,
          opacity,
          height: 8,
          borderRadius: 4,
          backgroundColor: colors.secondary,
          marginHorizontal: 4,
        }}
      />
    )
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />

      <FlatList
        data={onboardingSteps}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        scrollEventThrottle={32}
        ref={slidesRef}
      />

      {/* Bottom Section */}
      <View
        className="px-6 pb-8 pt-4 border-t"
        style={{
          borderColor: colors.border,
          backgroundColor: colors.primary,
        }}
      >
        <View
          className="flex-row justify-center mb-4"
        >
          {onboardingSteps.map((_, i) => (
            <Dot key={i} index={i} />
          ))}
        </View>

        <View
          className="flex-row justify-between items-center"
        >
          <TouchableOpacity onPress={onFinish} activeOpacity={0.8}>
            <Text
              className="text-base font-semibold"
              style={{
                color: colors.text,
              }}
            >
              Skip
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={scrollToNext}
            activeOpacity={0.8}
            className="py-3 px-8 rounded-xl"
            style={{
              backgroundColor: colors.secondary,
              shadowColor: colors.secondary,
              shadowOpacity: 0.4,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 3 },
            }}
          >
            <Text
              className="text-lg font-bold"
              style={{
                color: colors.background,
              }}
            >
              Next
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

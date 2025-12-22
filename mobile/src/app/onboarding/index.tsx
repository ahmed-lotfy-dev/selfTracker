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
    image: require("@/assets/images/onboarding/home-page.png"),
    title: "Your Personal\nDashboard",
    description:
      "Get a bird's-eye view of your fitness journey. Track workouts, monitor weight trends, and manage daily tasks all in one beautiful place.",
  },
  {
    id: "2",
    image: require("@/assets/images/onboarding/weight-logs.png"),
    title: "Track Every\nMilestone",
    description:
      "Visualize your progress with intuitive charts. Log your weight daily and watch your transformation unfold over time.",
  },
  {
    id: "3",
    image: require("@/assets/images/onboarding/workout-logs.png"),
    title: "Log Your\nWorkouts",
    description:
      "Keep a detailed history of every session. Analyze your performance and stay consistent with easy-to-read monthly logs.",
  },
  {
    id: "4",
    image: require("@/assets/images/onboarding/workouts-calendarview.png"),
    title: "Consistency\nis Key",
    description:
      "View your workout streaks on a dedicated calendar. Seeing your active days motivates you to never break the chain.",
  },
  {
    id: "5",
    image: require("@/assets/images/onboarding/tasks.png"),
    title: "Achieve\nYour Goals",
    description:
      "Break down big goals into manageable daily tasks. Stay organized and focused on what truly matters for your growth.",
  },
]

export default function OnboardingScreen() {
  const router = useRouter()
  const listRef = useRef<Animated.FlatList<OnboardingStep>>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const colors = useThemeColors()
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

  // --- Components ---

  const Paginator = () => {
    return (
      <View className="flex-row h-16 items-center">
        {onboardingSteps.map((_, index) => {
          const animatedDotStyle = useAnimatedStyle(() => {
            const widthAnim = interpolate(
              scrollX.value,
              [
                (index - 1) * width,
                index * width,
                (index + 1) * width,
              ],
              [8, 24, 8],
              Extrapolation.CLAMP
            )

            const opacity = interpolate(
              scrollX.value,
              [
                (index - 1) * width,
                index * width,
                (index + 1) * width,
              ],
              [0.4, 1, 0.4],
              Extrapolation.CLAMP
            )

            const color = interpolateColor(
              scrollX.value,
              [
                (index - 1) * width,
                index * width,
                (index + 1) * width,
              ],
              [colors.text, colors.secondary, colors.text]
            )

            return {
              width: widthAnim,
              opacity,
              backgroundColor: color,
            }
          })

          return (
            <Animated.View
              key={index.toString()}
              className="h-2 rounded-full mx-1"
              style={animatedDotStyle}
            />
          )
        })}
      </View>
    )
  }

  const RenderItem = ({ item, index }: { item: OnboardingStep; index: number }) => {
    const animatedImageStyle = useAnimatedStyle(() => {
      const inputRange = [
        (index - 1) * width,
        index * width,
        (index + 1) * width,
      ]

      const scale = interpolate(
        scrollX.value,
        inputRange,
        [0.8, 1, 0.8],
        Extrapolation.CLAMP
      )

      return {
        transform: [
          { scale },
        ],
      }
    })

    const animatedTextStyle = useAnimatedStyle(() => {
      const inputRange = [
        (index - 0.5) * width,
        index * width,
        (index + 0.5) * width,
      ]
      const opacity = interpolate(
        scrollX.value,
        inputRange,
        [0, 1, 0],
        Extrapolation.CLAMP
      )

      const translateY = interpolate(
        scrollX.value,
        inputRange,
        [50, 0, 50],
        Extrapolation.CLAMP
      )
      return {
        opacity,
        transform: [{ translateY }]
      }
    })


    return (
      <View className="flex-1" style={{ width }}>
        <View className="flex-[0.6] justify-center items-center">
          <Animated.View
            className="justify-center items-center"
            style={[{ width: width * 0.9, height: width * 0.9 }, animatedImageStyle]}
          >
            <Image
              source={item.image}
              className="w-full h-full"
              resizeMode="contain"
            />
          </Animated.View>
        </View>

        <View className="flex-[0.4] px-8 justify-start pt-8">
          <Animated.View style={animatedTextStyle}>
            <Text
              className="text-3xl font-extrabold text-left leading-10 mb-4 text-primary"
            >
              {item.title}
            </Text>
            <Text
              className="text-lg font-medium text-left leading-6 text-placeholder"
            >
              {item.description}
            </Text>
          </Animated.View>
        </View>
      </View>
    )
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
        renderItem={({ item, index }) => <RenderItem item={item} index={index} />}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewConfig}
      />

      <View className="h-32 px-8 flex-row items-center justify-between pb-5">
        <Paginator />

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

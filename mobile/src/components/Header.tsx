import React from "react"
import { View, Text } from "react-native"
import BackButton from "./Buttons/BackButton"
import { usePathname, Href } from "expo-router"

interface HeaderProps {
  title: string
  className?: string
  backTo?: Href
  leftAction?: React.ReactNode
  rightAction?: React.ReactNode
}

export default function Header({ title, className, backTo, leftAction, rightAction }: HeaderProps) {
  const pathname = usePathname()
  const noBackButtonPaths = [
    "/",
    "/index",
    "/weights",
    "/tasks",
    "/workouts",
    "/profile",
    "/home",
    "/habits",
    "/habits/add",
  ]
  const shouldShowBackButton = !noBackButtonPaths.includes(pathname)
  const isLargeTitle = !shouldShowBackButton


  return (
    <View
      className={`w-full ${className} ${shouldShowBackButton || backTo || leftAction || rightAction ? "flex-row items-center mb-2" : "mb-3"} ml-1 pt-3`}
    >
      {/* Left Section */}
      {(shouldShowBackButton || backTo) && (
        <BackButton backTo={backTo} className="mr-3" />
      )}
      {leftAction && (
        <View className="mr-3">{leftAction}</View>
      )}

      {/* Middle Section (Title) */}
      {isLargeTitle ? (
        <Text className="text-3xl font-extrabold text-text tracking-tight flex-1" numberOfLines={1}>{title}</Text>
      ) : (
        <Text className="text-xl font-bold text-text flex-1" numberOfLines={1}>{title}</Text>
      )}

      {/* Right Section */}
      {rightAction && (
        <View className="ml-2">
          {rightAction}
        </View>
      )}
    </View>
  )
}

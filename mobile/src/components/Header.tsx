import React from "react"
import { View, Text } from "react-native"
import BackButton from "./Buttons/BackButton"
import { usePathname, Href } from "expo-router"

interface HeaderProps {
  title: string
  className?: string
  backTo?: Href
}

export default function Header({ title, className, backTo }: HeaderProps) {
  const pathname = usePathname()
  const noBackButtonPaths = [
    "/",
    "/index",
    "/weights",
    "/tasks",
    "/workouts",
    "/profile",
  ]
  const shouldShowBackButton = !noBackButtonPaths.includes(pathname)

  // Use the provided backTo prop if available, otherwise calculate, otherwise default to /

  return (
    <View
      className={`w-full flex-row justify-center items-center relative  mb-5 ${className}`}
    >
      {shouldShowBackButton && (
        <BackButton backTo={backTo} className="absolute top-0 left-4" />
      )}
      <Text className="text-2xl font-bold border border-b-2 px-4 py-2 rounded-md">{title}</Text>
    </View>
  )
}

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

  return (
    <View
      className={`w-full ${className} ${shouldShowBackButton ? "flex-row items-center" : "mb-3"}`}
    >
      {shouldShowBackButton ? (
        <>
          <BackButton backTo={backTo} className="mr-3" />
          <Text className="text-xl font-bold text-text flex-1" numberOfLines={1}>{title}</Text>
        </>
      ) : (
        <Text className="text-3xl font-extrabold text-text tracking-tight">{title}</Text>
      )}
    </View>
  )
}

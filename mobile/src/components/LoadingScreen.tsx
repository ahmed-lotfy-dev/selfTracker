import React from "react"
import { View, Image, StyleSheet } from "react-native"
import { useThemeColors } from "../constants/Colors"

export function LoadingScreen() {
  const colors = useThemeColors()

  return (
    <View className="flex-1 justify-center items-center bg-background">
      <Image
        source={require("@/assets/images/splash-screen.png")}
        style={{ width: "100%", height: "100%", resizeMode: "contain" }}
        className="flex-1"
      />
    </View>
  )
}

const styles = StyleSheet.create({})

import { StyleSheet, Text, View } from "react-native"
import React from "react"
import { MaterialIcons } from "@expo/vector-icons"

type DeltaProps = { delta: number }

export const Delta = ({ delta }: DeltaProps) => {
  const isProgressGood = delta !== null ? delta <= 0 : false
  const deltaText =
    delta !== null
      ? `${delta > 0 ? "+" : ""}${Math.abs(delta).toFixed(1)} kg`
      : "N/A"
  return (
    <View>
      {delta !== null && (
        <View className="flex-row items-center justify-center mt-2">
          <MaterialIcons
            name={isProgressGood ? "trending-up" : "trending-down"}
            size={24}
            color={isProgressGood ? "#10b981" : "#ef4444"}
          />
          <Text
            className={`ml-2 font-semibold ${
              isProgressGood ? "text-green-500" : "text-red-500"
            }`}
          >
            {deltaText}
          </Text>
        </View>
      )}{" "}
    </View>
  )
}

export default Delta

import React from "react"
import {
  View,
  ActivityIndicator as RNActivityIndicator,
  ActivityIndicatorProps as RNActivityIndicatorProps,
  StyleProp,
  ViewStyle,
} from "react-native"
import { COLORS } from "@/src/constants/Colors"

type Props = {
  size?: RNActivityIndicatorProps["size"] // 'small' | 'large' | number (platform dependent)
  color?: string // optional override; default uses theme
  containerStyle?: StyleProp<ViewStyle>
  accessibilityLabel?: string
  testID?: string
  className?: string
}

export default function ActivitySpinner({
  size = "small",
  color,
  containerStyle,
  accessibilityLabel = "Loading",
  testID,
  className,
}: Props) {
  const spinnerColor = color ?? COLORS.primary

  return (
    <View
      style={containerStyle}
      accessibilityRole="progressbar"
      className={className}
      accessible
    >
      <RNActivityIndicator
        size={size}
        color={spinnerColor}
        accessibilityLabel={accessibilityLabel}
        testID={testID}
      />
    </View>
  )
}

import React from "react"
import { Text as RNText, TextProps } from "react-native"

const Text: React.FC<TextProps> = (props) => {
  return <RNText {...props} />
}

export default Text

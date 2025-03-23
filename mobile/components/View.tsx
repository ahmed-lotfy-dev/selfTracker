import React from "react"
import { View, ViewProps } from "react-native"

const CustomView: React.FC<ViewProps> = (props) => {
  return <View {...props} />
}

export default CustomView
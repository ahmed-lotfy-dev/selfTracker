import { View } from "react-native"

export default function ScreenContainer({
  children,
}: {
  children: React.ReactNode
}) {
  return <View className="flex-1 p-4 bg-white">{children}</View>
}

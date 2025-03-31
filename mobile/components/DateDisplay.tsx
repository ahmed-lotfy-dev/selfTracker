import { Text } from "react-native"

export default function DateDisplay({ date }: { date: string }) {
  return (
    <Text className="text-lg">
      {new Date(date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }) || "No date available"}
    </Text>
  )
}

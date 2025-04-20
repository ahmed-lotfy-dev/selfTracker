import { Text } from "react-native"

export default function DateDisplay({ date }: { date: string }) {
  const localDate = new Date(date)

  const formattedDate = localDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return <Text className="text-lg">{formattedDate || "No date available"}</Text>
}

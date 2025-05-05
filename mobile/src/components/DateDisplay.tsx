import React from "react"
import { Text } from "react-native"
import { format, differenceInDays } from "date-fns"

export default function DateDisplay({ date }: { date: string }) {
  const localDate = new Date(date)

  const daysAgo = differenceInDays(new Date(), localDate)
  const formattedDate =
    daysAgo <= 7
      ? `${daysAgo} day${daysAgo === 1 ? "" : "s"} ago`
      : format(localDate, "d MMMM yyyy")

  return <Text className="text-lg">{formattedDate || "No date available"}</Text>
}

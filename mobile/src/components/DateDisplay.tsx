import React from "react"
import { Text } from "react-native"
import { format, differenceInDays } from "date-fns"

export default function DateDisplay({
  date,
  isCalendar,
}: {
  date: string
  isCalendar?: boolean
}) {
  const localDate = new Date(date)

  const daysAgo = differenceInDays(new Date(), localDate)
  const formattedDate = isCalendar
    ? format(localDate, "d MMMM yyyy")
    : daysAgo < 1
    ? "Today"
    : daysAgo <= 7
    ? `${daysAgo} day${daysAgo === 1 ? "" : "s"} ago`
    : format(localDate, "d MMMM yyyy")

  return <Text className="text-lg">{formattedDate || "No date available"}</Text>
}

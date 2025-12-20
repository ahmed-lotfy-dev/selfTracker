import React from "react"
import { Text } from "react-native"
import { format, differenceInDays } from "date-fns"
import { safeParseDate } from "@/src/lib/utils/dateUtils"

export default function DateDisplay({
  date,
  isCalendar,
}: {
  date: any
  isCalendar?: boolean
}) {
  const localDate = safeParseDate(date)

  const daysAgo = differenceInDays(new Date(), localDate)
  const formattedDate = isCalendar
    ? format(localDate, "d MMMM yyyy")
    : daysAgo < 1
      ? "Today"
      : daysAgo <= 7
        ? `${daysAgo} day${daysAgo === 1 ? "" : "s"} ago`
        : format(localDate, "d MMMM yyyy")

  return <Text className="text-lg font-bold text-text">{formattedDate || "No date available"}</Text>
}

import React from "react"
import { Text } from "react-native"
import { formatLocal } from "@/src/lib/utils/dateUtils"

export default function DateDisplay({
  date,
  isCalendar,
}: {
  date: any
  isCalendar?: boolean
}) {
  const formattedDate = isCalendar
    ? formatLocal(date, "d MMMM yyyy")
    : formatLocal(date)

  return <Text className="text-lg font-bold text-text">{formattedDate || "No date available"}</Text>
}

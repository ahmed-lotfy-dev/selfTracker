import { View, StyleSheet } from "react-native"
import DateTimePicker, {
  useDefaultClassNames,
} from "react-native-ui-datepicker"
import { COLORS, SPACING } from "@/src/constants/Colors"
import { format } from "date-fns"
import React from "react"

type DatePickerProps = {
  date: string
  setDate: React.Dispatch<React.SetStateAction<string>>
  showDate: boolean
  setShowDate: React.Dispatch<React.SetStateAction<boolean>>
}

export default function DatePicker({
  date,
  setDate,
  showDate,
  setShowDate,
}: DatePickerProps) {
  const defaultClassNames = useDefaultClassNames()

  return (
    <View className="border-1 border-primary/70 rounded-lg mb-4">
      <DateTimePicker
        mode="single"
        date={date}
        onChange={({ date }: any) => {
          if (date) {
            const formattedDate = format(date, "yyyy-MM-dd")
            setDate(date.toISOString())
            setShowDate(false)
          }
        }}
        classNames={{
          ...defaultClassNames,
          button_prev: "bg-blue-900/80 rounded-full p-2",
          button_next: "bg-blue-900/80 rounded-full p-2",
          today: "border-blue-950",
          selected: "bg-primary",
          selected_label: "text-white",
          day: `${defaultClassNames.day} hover:bg-primary/70 hover:text-white hover:font-secondary`,
          disabled: "opacity-50",
        }}
      />
    </View>
  )
}

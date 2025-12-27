import { View, StyleSheet } from "react-native"
import DateTimePicker, {
  useDefaultClassNames,
} from "react-native-ui-datepicker"
import { COLORS, SPACING, useThemeColors } from "@/src/constants/Colors"
import { format } from "date-fns"
import React from "react"

type DatePickerProps = {
  date: Date
  onChange: (date: Date) => void
  visible: boolean
  onClose: () => void
}

export default function DatePicker({
  date,
  onChange,
  visible,
  onClose,
}: DatePickerProps) {
  const defaultClassNames = useDefaultClassNames()
  const colors = useThemeColors()

  if (!visible) return null

  return (
    <View className="border border-primary/70 rounded-lg mb-4 bg-card">
      <DateTimePicker
        mode="single"
        date={date}
        onChange={({ date: newDate }: any) => {
          if (newDate) {
            onChange(new Date(newDate))
            onClose()
          }
        }}

        classNames={{
          ...defaultClassNames,
          button_prev: "bg-secondary/60 rounded-full w-8 h-8 mt-2 items-center justify-center",
          button_next: "bg-secondary/60 rounded-full w-8 h-8 mt-2 items-center justify-center",
          today: "border border-primary rounded-full",
          selected: "bg-primary rounded-full",
          day: "active:bg-primary/20",
          disabled: "opacity-30",
        }}
        styles={{
          header: { backgroundColor: 'transparent' },
          weekday_label: { color: colors.placeholder, fontWeight: '500' },
          day_label: { color: colors.text, fontSize: 14, fontWeight: '500' },
          month_selector_label: { color: colors.text, fontSize: 18, fontWeight: 'bold' },
          year_selector_label: { color: colors.text, fontSize: 18, fontWeight: 'bold' },
          selected_label: { color: '#FFFFFF', fontWeight: 'bold' },
        }}
      />
    </View>
  )
}

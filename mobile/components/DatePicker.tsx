import { View, StyleSheet } from "react-native"
import DateTimePicker, {
  DateType,
  useDefaultClassNames,
} from "react-native-ui-datepicker"
import { COLORS, SPACING } from "@/constants/Colors"

type DatePickerProps = {
  date: DateType
  setDate: React.Dispatch<React.SetStateAction<DateType>>
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
    <View className="border-1 border-green-700 rounded-lg mb-4">
      <DateTimePicker
        mode="single"
        date={date}
        onChange={({ date }) => {
          setDate(date || new Date())
          setShowDate(false)
        }}
        classNames={{
          ...defaultClassNames,
          today: "border-green-500",
          selected: "bg-green-800 border-green-500",
          selected_label: "text-white",
          day: `${defaultClassNames.day} hover:bg-green-500`,
          disabled: "opacity-50",
        }}
      />
    </View>
  )
}

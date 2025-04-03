import { View, Text, FlatList } from "react-native"

interface TableProps {
  data: Record<string, unknown>[]
}

export default function Table({ data }: TableProps) {
  if (!data || data.length === 0) {
    return <Text>No data available</Text>
  }

  const headers = Object.keys(data[0]).slice(3)

  return (
    <View style={{ borderWidth: 1, borderColor: "grey" }}>
      {/* Header Row */}
      <View className="flex-row  p-2 w-full gap-3   m-auto bg-green-900/90 color-white">
        {headers.map((header) => (
          <Text className="flex-1 p-2 text-white text-center capitalize" key={header}>
            {header}
          </Text>
        ))}
      </View>

      {/* Data Rows */}
      {data.map((rowItem, rowIndex) => (
        <View
          key={rowIndex}
          style={{
            flexDirection: "row",
            borderBottomWidth: rowIndex < data.length - 1 ? 1 : 0,
            borderColor: "lightgrey",
          }}
        >
          <FlatList
            data={headers}
            renderItem={({ item }) => (
              <Text
                key={`${rowIndex}-${item}`}
                style={{ flex: 1, padding: 5, textAlign: "center" }}
              >
                {/* Convert value to string for display */}
                {String(rowItem[item] ?? "Empty")}
              </Text>
            )}
            keyExtractor={(item) => `${rowIndex}-${item}`}
            horizontal={true}
          />

        </View>
      ))}
    </View>
  )
}

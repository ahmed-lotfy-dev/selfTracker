import { FlatList, ActivityIndicator } from "react-native"

interface LogListProps {
  items: any[]
  renderItem: ({ item }: { item: any }) => JSX.Element
}

export default function ListItems({ items, renderItem }: LogListProps) {
  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
    />
  )
}

import { FlatList, ActivityIndicator } from "react-native"

interface LogListProps {
  logs: any[]
  renderItem: ({ item }: { item: any }) => JSX.Element
  fetchNextPage: () => void
  hasNextPage: boolean

  isFetchingNextPage: boolean
}

export default function LogList({
  logs,
  renderItem,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}: LogListProps) {
  return (
    <FlatList
      data={logs}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      }}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        isFetchingNextPage ? (
          <ActivityIndicator size="small" className="my-4" />
        ) : null
      }
    />
  )
}

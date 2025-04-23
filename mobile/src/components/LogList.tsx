import { FlatList, ActivityIndicator, RefreshControl } from "react-native"

interface LogListProps {
  logs: any[]
  renderItem: ({ item }: { item: any }) => JSX.Element
  fetchNextPage: () => void
  hasNextPage: boolean
  isFetchingNextPage: boolean
  refetch: () => void
  isRefetching: boolean
}

export default function LogList({
  logs,
  renderItem,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  refetch,
  isRefetching,
}: LogListProps) {
  return (
    <FlatList
      data={logs}
      renderItem={renderItem}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor="#000"
        />
      }
      showsVerticalScrollIndicator={false}
      keyExtractor={(item) => item.id.toString()}
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

import { View, Text, ScrollView, Alert } from "react-native"
import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import React, { useMemo } from "react"
import BackButton from "@/src/components/Buttons/BackButton"
import { useThemeColors } from "@/src/constants/Colors"
import { useWeightStore } from "@/src/stores/useWeightStore"
import Button from "@/src/components/ui/Button"
import { Feather, FontAwesome5 } from "@expo/vector-icons"
import { format } from "date-fns"

export default function WeightLog() {
  const router = useRouter()
  const { id } = useLocalSearchParams()
  const colors = useThemeColors()

  const weightLogs = useWeightStore(s => s.weightLogs)
  const deleteWeightLog = useWeightStore(s => s.deleteWeightLog)

  const log = useMemo(() =>
    weightLogs.find(l => l.id === id),
    [weightLogs, id]
  )

  const handleDelete = () => {
    Alert.alert(
      "Delete Entry",
      "Are you sure you want to delete this weight entry?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            if (typeof id === 'string') {
              deleteWeightLog(id)
              router.back()
            }
          }
        }
      ]
    )
  }

  if (!log) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Stack.Screen options={{ headerShown: true, title: "Weight Details" }} />
        <Text className="text-placeholder">Entry not found.</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Weight Details",
          headerLeft: () => <BackButton />,
          headerRight: () => (
            <Feather
              name="edit-2"
              size={20}
              color={colors.primary}
              onPress={() => router.push(`/weights/edit?id=${id}`)}
            />
          )
        }}
      />

      <ScrollView className="flex-1 p-5">

        {/* Hero Card */}
        <View className="bg-card rounded-3xl p-8 border border-border mb-6 items-center">
          <Text className="text-sm text-placeholder font-medium mb-1">Recorded Weight</Text>
          <View className="flex-row items-baseline gap-1">
            <Text className="text-5xl font-bold text-text">{log.weight}</Text>
            <Text className="text-xl text-placeholder">kg</Text>
          </View>
          <View className="mt-4 px-3 py-1 bg-muted/30 rounded-full">
            <Text className="text-sm text-text font-medium">
              {format(new Date(log.createdAt), "MMMM do, yyyy")}
            </Text>
          </View>
        </View>

        {/* Notes Card */}
        {log.notes ? (
          <View className="bg-card rounded-3xl p-6 border border-border mb-6">
            <Text className="text-sm text-placeholder font-bold uppercase mb-3 tracking-wider">Notes</Text>
            <Text className="text-base text-text leading-6">{log.notes}</Text>
          </View>
        ) : (
          <View className="bg-card rounded-3xl p-6 border border-border mb-6 border-dashed opacity-70">
            <Text className="text-center text-placeholder italic">No notes added.</Text>
          </View>
        )}
      </ScrollView>

      <View className="p-5 pb-8 border-t border-border bg-background">
        <Button
          onPress={handleDelete}
          variant="outline"
          className="border-red-500/50"
          textClassName="text-red-500"
        >
          Delete Entry
        </Button>
      </View>
    </View>
  )
}

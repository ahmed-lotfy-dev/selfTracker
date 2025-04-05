import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Alert, Platform } from "react-native"
import { showAlert } from "@/utils/lib"

type UseDeleteOptions = {
  mutationFn: () => Promise<any>
  confirmTitle?: string
  confirmMessage?: string
  onSuccessInvalidate?: { queryKey: any }[]
  onErrorMessage?: string
}

export function useDelete({
  mutationFn,
  confirmTitle = "Delete",
  confirmMessage = "Are you sure you want to delete this item?",
  onSuccessInvalidate = [],
  onErrorMessage = "Failed to delete.",
}: UseDeleteOptions) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn,
    onSuccess: () => {
      onSuccessInvalidate.forEach((invalidate) =>
        queryClient.invalidateQueries(invalidate)
      )
    },
    onError: () => {
      showAlert("Error", onErrorMessage)
    },
  })

  const triggerDelete = () => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm(confirmMessage)
      if (confirmed) mutation.mutate()
    } else {
      showAlert(confirmTitle, confirmMessage, [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: () => mutation.mutate() },
      ])
    }
  }

  return {
    deleteMutation: mutation,
    triggerDelete,
  }
}

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Platform } from "react-native"
import { showAlert } from "@/src/lib/lib"

type UseDeleteOptions = {
  mutationFn: () => Promise<any>
  confirmTitle?: string
  confirmMessage?: string
  onSuccessInvalidate?: { queryKey: any }[]
  onSuccessCallback?: () => void
  onErrorMessage?: string
}

export function useDelete({
  mutationFn,
  confirmTitle = "Delete",
  confirmMessage = "Are you sure you want to delete this item?",
  onSuccessInvalidate = [],
  onSuccessCallback,
  onErrorMessage = "Failed to delete.",
}: UseDeleteOptions) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn,
    onSuccess: () => {
      onSuccessInvalidate.forEach((invalidate) =>
        queryClient.invalidateQueries(invalidate)
      )
      onSuccessCallback?.()
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
        {
          text: "Delete",
          style: "destructive",
          onPress: () => mutation.mutate(),
        },
      ])
    }
  }

  return {
    deleteMutation: mutation,
    triggerDelete,
  }
}

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAlertStore } from "@/src/store/useAlertStore"
import { useToastStore } from "@/src/store/useToastStore"

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
  const showAlert = useAlertStore((state) => state.showAlert)
  const showToast = useToastStore((state) => state.showToast)

  const mutation = useMutation({
    mutationFn,
    onSuccess: () => {
      onSuccessInvalidate.forEach((invalidate) =>
        queryClient.invalidateQueries(invalidate)
      )
      showToast("Deleted successfully", "success")
      onSuccessCallback?.()
    },
    onError: () => {
      showToast(onErrorMessage, "error")
    },
  })

  const triggerDelete = () => {
    showAlert(
      confirmTitle,
      confirmMessage,
      () => mutation.mutate(), // onConfirm
      undefined,               // onCancel
      "Delete",                // confirmText
      "Cancel"                 // cancelText
    )
  }

  return {
    deleteMutation: mutation,
    triggerDelete,
  }
}

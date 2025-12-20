import { create } from 'zustand'

interface AlertState {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel?: () => void
  showAlert: (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    confirmText?: string,
    cancelText?: string
  ) => void
  hideAlert: () => void
}

export const useAlertStore = create<AlertState>((set) => ({
  isOpen: false,
  title: '',
  message: '',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  onConfirm: () => { },
  onCancel: () => { },
  showAlert: (title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel') =>
    set({
      isOpen: true,
      title,
      message,
      onConfirm,
      onCancel,
      confirmText,
      cancelText,
    }),
  hideAlert: () => set({ isOpen: false }),
}))

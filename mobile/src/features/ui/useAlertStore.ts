import { create } from 'zustand'

interface AlertState {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type: 'default' | 'error' | 'success' // Added type
  onConfirm: () => void
  onCancel?: () => void
  showAlert: (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    confirmText?: string,
    cancelText?: string,
    type?: 'default' | 'error' | 'success' // Added type arg
  ) => void
  hideAlert: () => void
}

export const useAlertStore = create<AlertState>((set) => ({
  isOpen: false,
  title: '',
  message: '',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  type: 'default',
  onConfirm: () => { },
  onCancel: () => { },
  showAlert: (title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', type = 'default') =>
    set({
      isOpen: true,
      title,
      message,
      onConfirm,
      onCancel,
      confirmText,
      cancelText,
      type,
    }),
  hideAlert: () => set({ isOpen: false }),
}))

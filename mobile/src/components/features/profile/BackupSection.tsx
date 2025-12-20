import React from "react"
import { View } from "react-native"
import { useQueryClient } from "@tanstack/react-query"
import { useAlertStore } from "@/src/store/useAlertStore"
import { useThemeColors } from "@/src/constants/Colors"
import { createBackup, restoreBackup } from "@/src/services/backup"
import SettingsButton from "@/src/components/ui/SettingsButton"

export default function BackupSection() {
  const { showAlert } = useAlertStore()
  const queryClient = useQueryClient()
  const colors = useThemeColors()

  const handleBackup = async () => {
    const result = await createBackup()
    if (result.success) {
      showAlert(
        "Backup Created",
        `Successfully backed up ${result.totalRecords || 0} records. Save the file to restore your data later.`,
        () => { },
        undefined,
        "Got it",
        undefined
      )
    } else {
      showAlert("Backup Failed", result.error || "Failed to create backup", () => { }, undefined, "OK", undefined)
    }
  }

  const handleRestore = () => {
    showAlert(
      "Restore Data?",
      "This will import data from a backup file. Existing data will not be overwritten. You can use this to transfer data to a new account.",
      async () => {
        const result = await restoreBackup()
        if (result.success) {
          queryClient.invalidateQueries()
          showAlert(
            "Restore Complete",
            `Successfully restored ${result.restored} records.`,
            () => { },
            undefined,
            "Got it",
            undefined
          )
        } else if (result.error !== "No file selected") {
          showAlert("Restore Failed", result.error || "Failed to restore backup", () => { }, undefined, "OK", undefined)
        }
      },
      () => { },
      "Choose File",
      "Cancel"
    )
  }

  return (
    <View>
      <SettingsButton
        icon="download"
        iconColor={colors.secondary}
        title="Backup Data"
        subtitle="Export all data to a file"
        onPress={handleBackup}
      />
      <SettingsButton
        icon="upload"
        iconColor={colors.primary}
        title="Restore Data"
        subtitle="Import data from backup file"
        onPress={handleRestore}
      />
    </View>
  )
}

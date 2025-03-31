// src/constants.ts
export const COLORS = {
  primary: "#22c55e", // Green theme
  secondary: "#16a34a", // Darker green
  background: "#1e293b", // Dark gray-blue
  text: "#f1f5f9", // Light text
  border: "#4ade80", // Light green border
  error: "#ef4444", // Red for errors
  placeholder: "#94a3b8", // Light gray text for input placeholders
}

export const SPACING = {
  small: 8,
  medium: 16,
  large: 24,
}

export const FONTS = {
  regular: { fontSize: 16, color: COLORS.text },
  bold: { fontSize: 18, fontWeight: "bold", color: COLORS.text },
}

export const BUTTONS = {
  primary: {
    backgroundColor: COLORS.primary,
    padding: SPACING.medium,
    borderRadius: 8,
    alignItems: "center",
  },
  disabled: {
    backgroundColor: COLORS.placeholder,
  },
  text: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
}

export const INPUTS = {
  container: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.small,
    color: COLORS.text,
    backgroundColor: "transparent",
  },
}

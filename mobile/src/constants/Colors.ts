// src/constants.ts
export const COLORS = {
  primary: "#2C3E50", // Charcoal Blue - professional primary
  secondary: "#1ABC9C", // Turquoise - professional accent
  background: "#1A1A1A", // Very Dark Gray - professional dark mode foundation
  text: "#ECF0F1", // Light Gray - readable on dark backgrounds
  gray: "#7F8C8D", // Asbestos - neutral for inactive states
  border: "#34495E", // Wet Asphalt - subtle border
  error: "#E74C3C", // Alizarin - standard red for error states
  success: "#2ECC71", // Emerald - healthy green → confirmations, streaks
  placeholder: "#BDC3C7", // Silver - muted gray for input hints
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
    color: COLORS.text, // Use the new text color
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

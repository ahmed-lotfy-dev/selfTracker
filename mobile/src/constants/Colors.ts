import { useColorScheme } from "react-native";

const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

export const COLORS = { // Keep original COLORS for backward compatibility
  primary: "#2C3E50", // Charcoal Blue - professional primary
  secondary: "#1ABC9C", // Turquoise - professional accent
  background: "#1A1A1A", // Very Dark Gray - professional dark mode foundation
  text: "#ECF0F1", // Light Gray - readable on dark backgrounds
  gray: "#7F8C8D", // Asbestos - neutral for inactive states
  border: "#34495E", // Wet Asphalt - subtle border
  error: "#E74C3C", // Alizarin - standard red for error states
  success: "#2ECC71", // Emerald - healthy green → confirmations, streaks
  placeholder: "#BDC3C7", // Silver - muted gray for input hints
  darkGreen: "#0A6847", // A dark green color
  inputText: "#34495E", // Darker gray for input text, readable on light backgrounds
}

export const Colors = { // New Colors object for dynamic theming
  light: {
    text: '#000',
    background: '#ffffff',
    foreground: '#000000',
    primary: '#3b82f6',
    card: '#ffffff',
    border: '#e5e7eb',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    secondary: "#1ABC9C", // Turquoise - professional accent
    gray: "#7F8C8D", // Asbestos - neutral for inactive states
    error: "#E74C3C", // Alizarin - standard red for error states
    success: "#2ECC71", // Emerald - healthy green → confirmations, streaks
    placeholder: "#BDC3C7", // Silver - muted gray for input hints
    darkGreen: "#0A6847", // A dark green color
    inputText: "#6B7280", // Medium Gray for input text, readable on both light and dark backgrounds
  },
  dark: {
    text: '#fff',
    background: '#000000',
    foreground: '#ffffff',
    primary: '#3b82f6',
    card: '#1f2937',
    border: '#374151',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    secondary: "#1ABC9C", // Turquoise - professional accent
    gray: "#7F8C8D", // Asbestos - neutral for inactive states
    error: "#E74C3C", // Alizarin - standard red for error states
    success: "#2ECC71", // Emerald - healthy green → confirmations, streaks
    placeholder: "#BDC3C7", // Silver - muted gray for input hints
    darkGreen: "#0A6847", // A dark green color
    inputText: "#6B7280", // Medium Gray for input text, readable on both light and dark backgrounds
  },
};

export function useThemeColors() {
  const theme = useColorScheme() ?? 'light';
  return Colors[theme];
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

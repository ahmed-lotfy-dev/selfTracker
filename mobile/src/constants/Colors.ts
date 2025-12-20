import { useCSSVariable } from "uniwind";

// Export a hook that mimics the old behavior but pulls from CSS variables
// This allows strict adherence to global.css as source of truth
export function useThemeColors() {
  // Force string cast or fallback to ensure TS is happy for Chart components
  const primary = useCSSVariable('--color-primary') as string ?? '#10B981';
  const secondary = useCSSVariable('--color-secondary') as string ?? '#34D399';
  const background = useCSSVariable('--color-background') as string ?? '#F0FDF4';
  const card = useCSSVariable('--color-card') as string ?? '#FFFFFF';
  const text = useCSSVariable('--color-text') as string ?? '#064E3B';
  const border = useCSSVariable('--color-border') as string ?? '#D1FAE5';
  const error = useCSSVariable('--color-error') as string ?? '#EF4444';
  const success = useCSSVariable('--color-success') as string ?? '#10B981';
  const placeholder = useCSSVariable('--color-placeholder') as string ?? '#6EE7B7';
  const tint = useCSSVariable('--color-tint') as string ?? '#10B981';
  const icon = useCSSVariable('--color-icon') as string ?? '#10B981';

  // Semantic Stats Colors
  const statPrimary = useCSSVariable('--color-stat-primary') as string ?? '#10B981';
  const statSecondary = useCSSVariable('--color-stat-secondary') as string ?? '#34D399';
  const statTertiary = useCSSVariable('--color-stat-tertiary') as string ?? '#4ade80';
  const statQuaternary = useCSSVariable('--color-stat-quaternary') as string ?? '#818CF8';

  // Social Colors
  const socialGoogle = useCSSVariable('--color-social-google') as string ?? '#4285F4';
  const socialGithub = useCSSVariable('--color-social-github') as string ?? '#18181B';

  return {
    primary,
    secondary,
    background,
    card,
    text,
    border,
    error,
    success,
    placeholder,
    tint,
    icon,
    statPrimary,
    statSecondary,
    statTertiary,
    statQuaternary,
    socialGoogle,
    socialGithub,
  };
}

// Keep legacy constant for non-hook usage if absolutely needed (fallback to light theme defaults)
// But prefer the hook above for dynamic themes
export const COLORS = {
  primary: "#10B981",
  secondary: "#34D399",
  background: "#F0FDF4",
  text: "#064E3B",
  gray: "#6B7280",
  border: "#D1FAE5",
  error: "#EF4444",
  success: "#10B981",
  placeholder: "#6EE7B7",
  darkGreen: "#064E3B",
  inputText: "#064E3B",
}

export const Colors = {
  light: COLORS,
  dark: {
    ...COLORS,
    primary: "#10B981",
    background: "#020617",
    text: "#F8FAFC",
    card: "#0f172a",
    border: "#1e293b",
  }
};

export const SPACING = {
  small: 8,
  medium: 16,
  large: 24,
  xl: 32,
}

import { useCSSVariable } from "uniwind";

export function useThemeColors() {
  const primary = useCSSVariable('--color-primary') as string ?? '#10B981';
  const secondary = useCSSVariable('--color-secondary') as string ?? '#34D399';
  const background = useCSSVariable('--color-background') as string ?? '#F9FAFB';
  const surface = useCSSVariable('--color-surface') as string ?? '#FFFFFF';
  const card = useCSSVariable('--color-card') as string ?? '#FFFFFF';
  const text = useCSSVariable('--color-text') as string ?? '#111827';
  const textSecondary = useCSSVariable('--color-text-secondary') as string ?? '#4B5563';
  const textMuted = useCSSVariable('--color-text-muted') as string ?? '#9CA3AF';
  const border = useCSSVariable('--color-border') as string ?? '#E5E7EB';
  const error = useCSSVariable('--color-error') as string ?? '#EF4444';
  const warning = useCSSVariable('--color-warning') as string ?? '#F59E0B';
  const success = useCSSVariable('--color-success') as string ?? '#10B981';
  const info = useCSSVariable('--color-info') as string ?? '#3B82F6';
  const placeholder = useCSSVariable('--color-placeholder') as string ?? '#9CA3AF';
  const tint = useCSSVariable('--color-tint') as string ?? '#10B981';
  const icon = useCSSVariable('--color-icon') as string ?? '#6B7280';

  const statPrimary = useCSSVariable('--color-stat-primary') as string ?? '#10B981';
  const statSecondary = useCSSVariable('--color-stat-secondary') as string ?? '#0EA5E9';
  const statTertiary = useCSSVariable('--color-stat-tertiary') as string ?? '#F59E0B';
  const statQuaternary = useCSSVariable('--color-stat-quaternary') as string ?? '#6366F1';

  const socialGoogle = useCSSVariable('--color-social-google') as string ?? '#4285F4';
  const socialGithub = useCSSVariable('--color-social-github') as string ?? '#18181B';

  return {
    primary,
    secondary,
    background,
    surface,
    card,
    text,
    textSecondary,
    textMuted,
    border,
    error,
    warning,
    success,
    info,
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

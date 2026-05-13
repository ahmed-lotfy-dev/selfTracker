import { ReactNode } from 'react';
import { TextInputProps } from 'react-native';

export interface PremiumCardProps {
  children: ReactNode;
  gradientColors?: readonly [string, string, ...string[]];
  containerStyle?: string;
  onPress?: () => void;
  onLongPress?: () => void;
}

export interface ButtonProps {
  onPress: () => void;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'error' | 'success';
  size?: 'sm' | 'default' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  textClassName?: string;
  fullWidth?: boolean;
  icon?: ReactNode;
  title?: string;
}

export interface CardProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
  onPress?: () => void;
}

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export interface LoadingProps {
  size?: 'small' | 'large' | number;
  color?: string;
  className?: string;
  fullscreen?: boolean;
}

export interface OTPInputProps {
  length: number;
  onComplete: (otp: string) => void;
  error?: string;
}

export interface OTPInputRef {
  clear: () => void;
  focus: () => void;
}

export interface Option {
  id: string;
  label: string;
  icon?: string;
  value?: any;
}

export interface ProfileOptionProps {
  option: Option;
  onPress: () => void;
  isLast?: boolean;
}

export interface RowProps {
  label: string;
  icon?: any; // Feather icon name
  children?: ReactNode;
  isLast?: boolean;
  className?: string;
}

export interface SectionProps {
  title?: string;
  children: ReactNode;
  className?: string;
  error?: string;
}

export interface SelectProps {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onValueChange: (value: string) => void;
  error?: string;
}

export interface SettingsButtonProps {
  title: string;
  icon: any;
  onPress: () => void;
  value?: string;
  isLast?: boolean;
}

import React from "react"
import { View } from "react-native"
import { cn } from '@/src/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  noPadding?: boolean
}

export default function Card({ children, className, noPadding = false }: CardProps) {
  return (
    <View className={cn(
      "bg-card rounded-2xl border border-border shadow-sm overflow-hidden",
      !noPadding && "p-4",
      className
    )}>
      {children}
    </View>
  )
}

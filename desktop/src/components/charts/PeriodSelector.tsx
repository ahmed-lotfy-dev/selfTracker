import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type Period = 1 | 2 | 3 | 6 | 12

interface PeriodSelectorProps {
  currentPeriod: Period
  onSelect: (period: Period) => void
  disabled?: boolean
}

const PERIODS: { label: string; value: Period }[] = [
  { label: "1M", value: 1 },
  { label: "3M", value: 3 },
  { label: "6M", value: 6 },
  { label: "1Y", value: 12 },
]

export function PeriodSelector({ currentPeriod, onSelect, disabled }: PeriodSelectorProps) {
  return (
    <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg w-fit">
      {PERIODS.map(({ label, value }) => (
        <Button
          key={value}
          variant="ghost"
          size="sm"
          onClick={() => onSelect(value)}
          disabled={disabled}
          className={cn(
            "h-7 px-3 text-xs font-medium hover:bg-background transition-all",
            currentPeriod === value && "bg-background shadow-sm text-foreground hover:bg-background"
          )}
        >
          {label}
        </Button>
      ))}
    </div>
  )
}

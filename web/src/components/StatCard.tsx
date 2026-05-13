import type { ReactNode } from 'react'

interface Props {
  label: string
  value: string | number
  sub?: string
  icon: ReactNode
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'cyan' | 'red'
}

const colors: Record<string, string> = {
  blue: 'text-brand-blue bg-brand-blue/10 border-brand-blue/20',
  green: 'text-brand-green bg-brand-green/10 border-brand-green/20',
  purple: 'text-brand-purple bg-brand-purple/10 border-brand-purple/20',
  orange: 'text-brand-orange bg-brand-orange/10 border-brand-orange/20',
  cyan: 'text-brand-cyan bg-brand-cyan/10 border-brand-cyan/20',
  red: 'text-brand-red bg-brand-red/10 border-brand-red/20',
}

export default function StatCard({ label, value, sub, icon, color = 'blue' }: Props) {
  return (
    <div className="stat-card flex items-start justify-between">
      <div>
        <p className="text-[12px] text-gray-500 font-medium uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-white mt-1">{value}</p>
        {sub && <p className="text-[12px] text-gray-500 mt-1">{sub}</p>}
      </div>
      <div className={`p-2.5 rounded-xl border ${colors[color]}`}>{icon}</div>
    </div>
  )
}

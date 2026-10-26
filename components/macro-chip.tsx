import { formatAmount, formatChip, formatKcal } from "@/lib/format"
import type { MacroSet } from "@/lib/types"

export function MacroChip({ macros, className = "" }: { macros: MacroSet; className?: string }) {
  return (
    <span aria-label={formatChip(macros)} className={`block text-[10px] font-semibold leading-snug ${className}`}>
      <span className="whitespace-nowrap text-[#0c6e86]">P {formatAmount(macros.protein)}</span>
      <span className="text-neutral-300"> · </span>
      <span className="whitespace-nowrap text-[#9a6700]">C {formatAmount(macros.carbs)}</span>
      <span className="text-neutral-300"> · </span>
      <span className="whitespace-nowrap text-[#9a3412]">F {formatAmount(macros.fat)}</span>
      <span className="text-neutral-300"> · </span>
      <span className="whitespace-nowrap text-ink">{formatKcal(macros.kcal)} kcal</span>
    </span>
  )
}

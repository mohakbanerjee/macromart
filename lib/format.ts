import type { MacroSet } from "./types"

export function formatAmount(grams: number): string {
  if (!Number.isFinite(grams)) return "0g"
  const rounded = Math.round(grams * 10) / 10
  const body = Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(1)
  return `${body}g`
}

export function formatKcal(kcal: number): string {
  if (!Number.isFinite(kcal)) return "0"
  return String(Math.round(kcal))
}

export function formatChip(macros: MacroSet): string {
  return `P ${formatAmount(macros.protein)} · C ${formatAmount(macros.carbs)} · F ${formatAmount(macros.fat)} · ${formatKcal(macros.kcal)} kcal`
}

export function formatAED(amount: number): string {
  if (!Number.isFinite(amount)) return "AED 0.00"
  return `AED ${amount.toFixed(2)}`
}

export function formatPercent(share: number): string {
  if (!Number.isFinite(share)) return "0%"
  return `${Math.round(share * 100)}%`
}

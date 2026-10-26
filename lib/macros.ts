import type { Basis, MacroSet, SectionSlug, SortKey } from "./types"

/**
 * Label calories follow Atwater factors: 4 kcal per gram of protein,
 * 4 kcal per gram of carbohydrate, and 9 kcal per gram of fat.
 */
export const KCAL_PER_GRAM = {
  protein: 4,
  carbs: 4,
  fat: 9,
} as const

export const HIGH_PROTEIN_MIN_GRAMS = 10
export const HIGH_PROTEIN_MIN_SHARE = 0.2
export const HIGH_CARB_MIN_SHARE = 0.55
export const HIGH_FAT_MIN_SHARE = 0.5

export const GAP_ITEM_LIMIT = 3
export const GAP_MAX_SERVINGS = 3

export type GapCandidate = {
  id: string
  protein: number
  kcal: number
  priceAED: number
  proteinPerAed: number
}

export type GapSuggestion<T> = T & { qty: number }

export type Sortable = {
  id: string
  priceAED: number
  proteinPerAed: number
  perServing: MacroSet
  per100g: MacroSet
}

function shareAtLeast(grams: number, kcalPerGram: number, kcal: number, threshold: number): boolean {
  if (!(kcal > 0) || !Number.isFinite(grams) || !Number.isFinite(kcal)) return false
  const left = Math.round(grams * kcalPerGram * 1000)
  const right = Math.round(threshold * kcal * 1000)
  return left >= right
}

export function macroCalorieShares(macros: MacroSet): { protein: number; carbs: number; fat: number } {
  if (!(macros.kcal > 0)) return { protein: 0, carbs: 0, fat: 0 }
  return {
    protein: (macros.protein * KCAL_PER_GRAM.protein) / macros.kcal,
    carbs: (macros.carbs * KCAL_PER_GRAM.carbs) / macros.kcal,
    fat: (macros.fat * KCAL_PER_GRAM.fat) / macros.kcal,
  }
}

/** Protein is at least 10 g per serving and protein calories are at least 20% of kcal. */
export function isHighProtein(macros: MacroSet): boolean {
  if (!(macros.protein >= HIGH_PROTEIN_MIN_GRAMS)) return false
  return shareAtLeast(macros.protein, KCAL_PER_GRAM.protein, macros.kcal, HIGH_PROTEIN_MIN_SHARE)
}

/** Carbohydrate calories are at least 55% of kcal. */
export function isHighCarb(macros: MacroSet): boolean {
  return shareAtLeast(macros.carbs, KCAL_PER_GRAM.carbs, macros.kcal, HIGH_CARB_MIN_SHARE)
}

/** Fat calories are at least 50% of kcal. */
export function isHighFat(macros: MacroSet): boolean {
  return shareAtLeast(macros.fat, KCAL_PER_GRAM.fat, macros.kcal, HIGH_FAT_MIN_SHARE)
}

export function shelvesFor(macros: MacroSet): SectionSlug[] {
  const shelves: SectionSlug[] = []
  if (isHighProtein(macros)) shelves.push("high-protein")
  if (isHighCarb(macros)) shelves.push("high-carb")
  if (isHighFat(macros)) shelves.push("high-fat")
  return shelves
}

export function proteinPerAed(proteinGrams: number, priceAED: number): number {
  if (!(priceAED > 0) || !Number.isFinite(proteinGrams)) return 0
  return proteinGrams / priceAED
}

export function proteinPer100Kcal(macros: MacroSet): number {
  if (!(macros.kcal > 0) || !Number.isFinite(macros.protein)) return 0
  return (macros.protein / macros.kcal) * 100
}

export function defaultSort(section: SectionSlug): SortKey {
  return section === "high-protein" ? "proteinPerAed" : "price"
}

function macrosForBasis(item: Sortable, basis: Basis): MacroSet {
  return basis === "per100g" ? item.per100g : item.perServing
}

function metric(item: Sortable, key: SortKey, basis: Basis): number {
  if (key === "price") return item.priceAED
  if (key === "proteinPerAed") return item.proteinPerAed
  const macros = macrosForBasis(item, basis)
  if (key === "kcal") return macros.kcal
  return proteinPer100Kcal(macros)
}

export function sortProducts<T extends Sortable>(items: readonly T[], key: SortKey, basis: Basis): T[] {
  return [...items].sort((a, b) => {
    const higherBetter = key === "proteinPerAed" || key === "proteinPer100Kcal"
    const diff = higherBetter ? metric(b, key, basis) - metric(a, key, basis) : metric(a, key, basis) - metric(b, key, basis)
    if (Math.abs(diff) > 1e-9) return diff
    return a.id.localeCompare(b.id)
  })
}

function compareGap(a: GapCandidate, b: GapCandidate): number {
  const value = b.proteinPerAed - a.proteinPerAed
  if (Math.abs(value) > 1e-9) return value
  const price = a.priceAED - b.priceAED
  if (Math.abs(price) > 1e-9) return price
  return a.id.localeCompare(b.id)
}

/**
 * Pick up to three foods with the most protein per AED.
 * Each food can be suggested up to three servings.
 * Servings are added only while they stay inside the remaining calories,
 * and the list stops once the protein gap is covered.
 */
export function suggestGapFillers<T extends GapCandidate>(
  items: readonly T[],
  remainingProtein: number,
  remainingKcal: number,
  limit = GAP_ITEM_LIMIT,
  maxServings = GAP_MAX_SERVINGS,
): GapSuggestion<T>[] {
  if (!(remainingProtein > 0) || !(remainingKcal > 0) || limit < 1 || maxServings < 1) return []

  const ranked = [...items].sort(compareGap)
  const qtyById = new Map<string, number>()
  const chosen: T[] = []
  let proteinLeft = remainingProtein
  let kcalLeft = remainingKcal

  while (proteinLeft > 1e-9) {
    const next = ranked.find((item) => {
      const used = qtyById.get(item.id) ?? 0
      if (used === 0 && chosen.length >= limit) return false
      return (
        used < maxServings &&
        item.protein > 0 &&
        Number.isFinite(item.kcal) &&
        item.kcal >= 0 &&
        item.kcal <= kcalLeft + 1e-9
      )
    })
    if (!next) break
    const used = qtyById.get(next.id) ?? 0
    if (used === 0) chosen.push(next)
    qtyById.set(next.id, used + 1)
    proteinLeft -= next.protein
    kcalLeft -= next.kcal
  }

  return chosen.map((item) => ({ ...item, qty: qtyById.get(item.id) ?? 1 }))
}

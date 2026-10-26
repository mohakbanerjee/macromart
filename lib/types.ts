export type MacroSet = {
  kcal: number
  protein: number
  carbs: number
  fat: number
}

export type CategorySlug =
  | "dairy"
  | "meat"
  | "bakery"
  | "pantry"
  | "produce"
  | "breakfast"
  | "snacks"

export type SectionSlug = "high-protein" | "high-carb" | "high-fat"

export type Basis = "serving" | "per100g"

export type SortKey = "proteinPerAed" | "proteinPer100Kcal" | "price" | "kcal"

export type Product = {
  id: string
  name: string
  brand: string
  size: string
  priceAED: number
  category: CategorySlug
  emoji: string
  servingSize: string
  servingGrams: number
  netWeightG: number
  perServing: MacroSet
  per100g: MacroSet
}

export type Goals = {
  protein: number
  carbs: number
  fat: number
  kcal: number
}

export type CartLine = {
  id: string
  qty: number
}

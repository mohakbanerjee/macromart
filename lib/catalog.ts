import productsJson from "../data/products.json"
import { isHighCarb, isHighFat, isHighProtein, proteinPerAed, shelvesFor } from "./macros"
import type { Basis, CategorySlug, MacroSet, Product, SectionSlug } from "./types"

export const products = productsJson as Product[]

export const productById = new Map(products.map((product) => [product.id, product]))

export const DEMO_NOTICE =
  "Demo data for a prototype. Prices and nutrition are realistic examples, not the live noon catalog."

export const CATEGORIES: { slug: CategorySlug; name: string; emoji: string }[] = [
  { slug: "dairy", name: "Dairy & Eggs", emoji: "🥛" },
  { slug: "meat", name: "Meat & Seafood", emoji: "🍗" },
  { slug: "produce", name: "Fruit & Veg", emoji: "🥑" },
  { slug: "bakery", name: "Bakery", emoji: "🍞" },
  { slug: "pantry", name: "Pantry", emoji: "🍚" },
  { slug: "breakfast", name: "Breakfast", emoji: "🥣" },
  { slug: "snacks", name: "Snacks", emoji: "🥜" },
]

export const SECTIONS: Record<SectionSlug, { title: string; summary: string; rule: string }> = {
  "high-protein": {
    title: "High Protein",
    summary: "At least 10g protein and 20% of calories.",
    rule: "Protein is at least 10 g per serving, and calories from protein are at least 20 percent of the total.",
  },
  "high-carb": {
    title: "High Carb",
    summary: "At least 55% of calories from carbs.",
    rule: "Calories from carbohydrate are at least 55 percent of the total.",
  },
  "high-fat": {
    title: "High Fat",
    summary: "At least 50% of calories from fat.",
    rule: "Calories from fat are at least 50 percent of the total.",
  },
}

export function getProduct(id: string): Product | undefined {
  return productById.get(id)
}

export function servingsPerPack(product: Product): number {
  if (!(product.servingGrams > 0)) return 0
  return product.netWeightG / product.servingGrams
}

export function pricePerServing(product: Product): number {
  const servings = servingsPerPack(product)
  if (!(servings > 0)) return product.priceAED
  return product.priceAED / servings
}

/** Protein in the whole pack divided by the shelf price. */
export function proteinPerAedForProduct(product: Product): number {
  const totalProtein = product.perServing.protein * servingsPerPack(product)
  return proteinPerAed(totalProtein, product.priceAED)
}

export function macrosFor(product: Product, basis: Basis): MacroSet {
  return basis === "per100g" ? product.per100g : product.perServing
}

export function matchesSection(product: Product, section: SectionSlug): boolean {
  const serving = product.perServing
  if (section === "high-protein") return isHighProtein(serving)
  if (section === "high-carb") return isHighCarb(serving)
  return isHighFat(serving)
}

export function productsInSection(section: SectionSlug): Product[] {
  return products.filter((product) => matchesSection(product, section))
}

export function productsInCategory(category: CategorySlug): Product[] {
  return products.filter((product) => product.category === category)
}

export function shelfTags(product: Product): SectionSlug[] {
  return shelvesFor(product.perServing)
}

export function withValue<T extends Product>(product: T): T & { proteinPerAed: number } {
  return { ...product, proteinPerAed: proteinPerAedForProduct(product) }
}

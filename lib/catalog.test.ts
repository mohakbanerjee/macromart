import { describe, expect, it } from "vitest"
import { CATEGORIES, products, productsInSection, proteinPerAedForProduct, shelfTags } from "./catalog"
import { isHighCarb, isHighProtein, sortProducts, suggestGapFillers } from "./macros"

describe("demo catalog", () => {
  it("holds 40 grocery items with the fields the shop needs", () => {
    expect(products).toHaveLength(40)
    const ids = new Set<string>()
    for (const product of products) {
      expect(ids.has(product.id)).toBe(false)
      ids.add(product.id)
      expect(product.name.length).toBeGreaterThan(0)
      expect(product.brand.length).toBeGreaterThan(0)
      expect(product.emoji.length).toBeGreaterThan(0)
      expect(product.priceAED).toBeGreaterThan(0)
      expect(product.servingGrams).toBeGreaterThan(0)
      expect(product.netWeightG).toBeGreaterThan(0)
      for (const basis of [product.perServing, product.per100g]) {
        expect(Number.isFinite(basis.kcal)).toBe(true)
        expect(Number.isFinite(basis.protein)).toBe(true)
        expect(Number.isFinite(basis.carbs)).toBe(true)
        expect(Number.isFinite(basis.fat)).toBe(true)
      }
      const factor = 100 / product.servingGrams
      expect(Math.abs(product.per100g.protein - product.perServing.protein * factor)).toBeLessThanOrEqual(0.11)
      expect(CATEGORIES.some((category) => category.slug === product.category)).toBe(true)
    }
  })

  it("fills each macro shelf and still leaves everyday items off them", () => {
    expect(productsInSection("high-protein").length).toBeGreaterThanOrEqual(10)
    expect(productsInSection("high-carb").length).toBeGreaterThanOrEqual(10)
    expect(productsInSection("high-fat").length).toBeGreaterThanOrEqual(8)
    const plain = products.filter((product) => shelfTags(product).length === 0)
    expect(plain.length).toBeGreaterThanOrEqual(4)
  })

  it("uses the per serving rule, so pasta is high carb and milk is on no macro shelf", () => {
    const pasta = products.find((product) => product.id === "pasta-barilla")
    const milk = products.find((product) => product.id === "milk-al-ain")
    const turkey = products.find((product) => product.id === "turkey-americana")
    const oats = products.find((product) => product.id === "oats-quaker")
    expect(pasta && isHighCarb(pasta.perServing) && !isHighProtein(pasta.perServing)).toBe(true)
    expect(milk && shelfTags(milk)).toEqual([])
    expect(turkey && isHighProtein(turkey.perServing)).toBe(true)
    expect(oats && oats.per100g.protein >= 10 && !isHighProtein(oats.perServing)).toBe(true)
  })

  it("ranks lentils ahead of chicken on whole pack protein per AED", () => {
    const valued = products
      .filter((product) => shelfTags(product).includes("high-protein"))
      .map((product) => ({ ...product, proteinPerAed: proteinPerAedForProduct(product) }))
    const ranked = sortProducts(valued, "proteinPerAed", "serving")
    expect(ranked[0]?.id).toBe("lentils-bayara")
    expect(ranked.map((product) => product.id)).toContain("chicken-sadia")
    const lentils = proteinPerAedForProduct(products.find((product) => product.id === "lentils-bayara")!)
    const chicken = proteinPerAedForProduct(products.find((product) => product.id === "chicken-sadia")!)
    expect(lentils).toBeGreaterThan(chicken)
  })

  it("covers a 150 g protein goal inside 2000 kcal with at most three foods", () => {
    const picks = suggestGapFillers(
      products
        .filter((product) => isHighProtein(product.perServing))
        .map((product) => ({
          id: product.id,
          protein: product.perServing.protein,
          kcal: product.perServing.kcal,
          priceAED: product.priceAED,
          proteinPerAed: proteinPerAedForProduct(product),
        })),
      150,
      2000,
    )
    const protein = picks.reduce((sum, item) => sum + item.protein * item.qty, 0)
    const kcal = picks.reduce((sum, item) => sum + item.kcal * item.qty, 0)
    expect(picks.length).toBeLessThanOrEqual(3)
    expect(picks[0]?.id).toBe("lentils-bayara")
    expect(protein).toBeGreaterThanOrEqual(150)
    expect(kcal).toBeLessThanOrEqual(2000)
  })
})

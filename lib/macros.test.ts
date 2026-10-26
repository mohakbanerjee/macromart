import { describe, expect, it } from "vitest"
import {
  defaultSort,
  isHighCarb,
  isHighFat,
  isHighProtein,
  proteinPer100Kcal,
  proteinPerAed,
  shelvesFor,
  sortProducts,
  suggestGapFillers,
  type GapCandidate,
  type Sortable,
} from "./macros"

const empty = { kcal: 0, protein: 0, carbs: 0, fat: 0 }

function food(partial: Partial<{ kcal: number; protein: number; carbs: number; fat: number }>) {
  return { ...empty, ...partial }
}

describe("high protein", () => {
  it("passes when protein is exactly 10 g and protein calories are exactly 20%", () => {
    expect(isHighProtein(food({ protein: 10, kcal: 200 }))).toBe(true)
  })

  it("fails when protein is just under 10 g even if the calorie share is high", () => {
    expect(isHighProtein(food({ protein: 9.9, kcal: 50 }))).toBe(false)
  })

  it("fails when protein clears 10 g but the calorie share is under 20%", () => {
    expect(isHighProtein(food({ protein: 12.5, kcal: 355, carbs: 71, fat: 1.5 }))).toBe(false)
  })

  it("fails when calories are zero or missing", () => {
    expect(isHighProtein(food({ protein: 20, kcal: 0 }))).toBe(false)
    expect(isHighProtein(food({ protein: 20, kcal: -10 }))).toBe(false)
  })

  it("can share a shelf with high fat", () => {
    const eggs = food({ kcal: 143, protein: 12.6, carbs: 0.7, fat: 9.5 })
    expect(isHighProtein(eggs)).toBe(true)
    expect(isHighFat(eggs)).toBe(true)
    expect(shelvesFor(eggs)).toEqual(["high-protein", "high-fat"])
  })
})

describe("high carb", () => {
  it("passes at exactly 55% of calories", () => {
    expect(isHighCarb(food({ carbs: 13.75, kcal: 100 }))).toBe(true)
  })

  it("fails just under 55%", () => {
    expect(isHighCarb(food({ carbs: 13.74, kcal: 100 }))).toBe(false)
  })

  it("fails when calories are zero", () => {
    expect(isHighCarb(food({ carbs: 40, kcal: 0 }))).toBe(false)
  })

  it("classifies oats style servings as high carb only", () => {
    const oats = food({ kcal: 189, protein: 6.7, carbs: 34, fat: 2.8 })
    expect(isHighCarb(oats)).toBe(true)
    expect(isHighProtein(oats)).toBe(false)
    expect(isHighFat(oats)).toBe(false)
  })
})

describe("high fat", () => {
  it("passes at exactly 50% of calories", () => {
    expect(isHighFat(food({ fat: 5, kcal: 90 }))).toBe(true)
  })

  it("fails just under 50%", () => {
    expect(isHighFat(food({ fat: 4.99, kcal: 90 }))).toBe(false)
  })

  it("fails when calories are zero", () => {
    expect(isHighFat(food({ fat: 20, kcal: 0 }))).toBe(false)
  })
})

describe("protein value metrics", () => {
  it("returns grams of protein per dirham", () => {
    expect(proteinPerAed(31, 15.5)).toBeCloseTo(2, 5)
  })

  it("returns zero when the price is not positive", () => {
    expect(proteinPerAed(20, 0)).toBe(0)
  })

  it("returns protein grams in 100 kcal", () => {
    expect(proteinPer100Kcal(food({ protein: 20, kcal: 200 }))).toBe(10)
    expect(proteinPer100Kcal(food({ protein: 20, kcal: 0 }))).toBe(0)
  })
})

describe("sort", () => {
  const items: Sortable[] = [
    {
      id: "b",
      priceAED: 10,
      proteinPerAed: 2,
      perServing: food({ protein: 10, kcal: 200 }),
      per100g: food({ protein: 10, kcal: 100 }),
    },
    {
      id: "a",
      priceAED: 5,
      proteinPerAed: 4,
      perServing: food({ protein: 8, kcal: 100 }),
      per100g: food({ protein: 8, kcal: 400 }),
    },
    {
      id: "c",
      priceAED: 5,
      proteinPerAed: 4,
      perServing: food({ protein: 12, kcal: 150 }),
      per100g: food({ protein: 12, kcal: 50 }),
    },
  ]

  it("ranks protein per AED from highest and breaks ties by id", () => {
    expect(sortProducts(items, "proteinPerAed", "serving").map((item) => item.id)).toEqual(["a", "c", "b"])
  })

  it("ranks price from lowest", () => {
    expect(sortProducts(items, "price", "serving").map((item) => item.id)).toEqual(["a", "c", "b"])
  })

  it("ranks calories for the active basis", () => {
    expect(sortProducts(items, "kcal", "serving").map((item) => item.id)).toEqual(["a", "c", "b"])
    expect(sortProducts(items, "kcal", "per100g").map((item) => item.id)).toEqual(["c", "b", "a"])
  })

  it("does not mutate the input list", () => {
    const snapshot = items.map((item) => item.id)
    sortProducts(items, "price", "serving")
    expect(items.map((item) => item.id)).toEqual(snapshot)
  })

  it("uses protein per AED as the high protein default and price elsewhere", () => {
    expect(defaultSort("high-protein")).toBe("proteinPerAed")
    expect(defaultSort("high-carb")).toBe("price")
    expect(defaultSort("high-fat")).toBe("price")
  })
})

describe("close the gap", () => {
  const foods: GapCandidate[] = [
    { id: "best", protein: 12, kcal: 100, priceAED: 8, proteinPerAed: 10 },
    { id: "mid", protein: 20, kcal: 150, priceAED: 4, proteinPerAed: 5 },
    { id: "light", protein: 10, kcal: 40, priceAED: 3, proteinPerAed: 1 },
    { id: "oil", protein: 0, kcal: 90, priceAED: 1, proteinPerAed: 0 },
  ]

  it("returns nothing when protein or calories are already used up", () => {
    expect(suggestGapFillers(foods, 0, 500)).toEqual([])
    expect(suggestGapFillers(foods, 40, 0)).toEqual([])
    expect(suggestGapFillers(foods, -5, 500)).toEqual([])
  })

  it("stacks the best protein per AED up to the serving cap, then the next food", () => {
    const picks = suggestGapFillers(foods, 30, 500, 3, 2)
    expect(picks.map((pick) => ({ id: pick.id, qty: pick.qty }))).toEqual([
      { id: "best", qty: 2 },
      { id: "mid", qty: 1 },
    ])
  })

  it("skips a better value food that would cross the calorie budget", () => {
    const picks = suggestGapFillers(
      [{ id: "huge", protein: 30, kcal: 400, priceAED: 10, proteinPerAed: 20 }, ...foods],
      40,
      120,
      3,
      1,
    )
    expect(picks.map((pick) => pick.id)).toEqual(["best"])
  })

  it("includes a serving that lands exactly on the remaining calories", () => {
    const picks = suggestGapFillers(foods, 12, 100, 3, 1)
    expect(picks).toEqual([{ ...foods[0], qty: 1 }])
  })

  it("ignores foods with no protein and stops at three items", () => {
    const many: GapCandidate[] = [
      { id: "d", protein: 1, kcal: 10, priceAED: 4, proteinPerAed: 4 },
      { id: "c", protein: 1, kcal: 10, priceAED: 3, proteinPerAed: 3 },
      { id: "b", protein: 1, kcal: 10, priceAED: 2, proteinPerAed: 2 },
      { id: "a", protein: 1, kcal: 10, priceAED: 1, proteinPerAed: 1 },
      { id: "zero", protein: 0, kcal: 10, priceAED: 1, proteinPerAed: 99 },
    ]
    expect(suggestGapFillers(many, 10, 100, 3, 1).map((pick) => pick.id)).toEqual(["d", "c", "b"])
  })

  it("breaks equal protein per AED toward the lower price", () => {
    const tied: GapCandidate[] = [
      { id: "pricey", protein: 10, kcal: 50, priceAED: 9, proteinPerAed: 4 },
      { id: "cheap", protein: 10, kcal: 50, priceAED: 3, proteinPerAed: 4 },
    ]
    expect(suggestGapFillers(tied, 10, 100, 3, 1).map((pick) => pick.id)).toEqual(["cheap"])
  })

  it("stops once the protein gap is covered", () => {
    const picks = suggestGapFillers(foods, 12, 1000, 3, 3)
    expect(picks).toEqual([{ ...foods[0], qty: 1 }])
  })

  it("tops up servings after the third food is already chosen", () => {
    const picks = suggestGapFillers(
      [
        { id: "a", protein: 5, kcal: 10, priceAED: 1, proteinPerAed: 3 },
        { id: "b", protein: 5, kcal: 10, priceAED: 1, proteinPerAed: 2 },
        { id: "c", protein: 5, kcal: 10, priceAED: 1, proteinPerAed: 1 },
      ],
      40,
      500,
      3,
      3,
    )
    expect(picks.map((pick) => ({ id: pick.id, qty: pick.qty }))).toEqual([
      { id: "a", qty: 3 },
      { id: "b", qty: 3 },
      { id: "c", qty: 2 },
    ])
  })

  it("does not mutate the candidate list", () => {
    const snapshot = foods.map((item) => item.id)
    suggestGapFillers(foods, 40, 800)
    expect(foods.map((item) => item.id)).toEqual(snapshot)
  })
})

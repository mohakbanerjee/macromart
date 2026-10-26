import { describe, expect, it } from "vitest"
import { formatAED, formatChip } from "./format"

describe("formatChip", () => {
  it("matches the card chip wording", () => {
    expect(formatChip({ kcal: 180, protein: 20, carbs: 5, fat: 4 })).toBe("P 20g · C 5g · F 4g · 180 kcal")
  })

  it("keeps a single decimal and rounds calories", () => {
    expect(formatChip({ kcal: 164.4, protein: 12.64, carbs: 0, fat: 3.56 })).toBe(
      "P 12.6g · C 0g · F 3.6g · 164 kcal",
    )
  })
})

describe("formatAED", () => {
  it("always shows two decimals", () => {
    expect(formatAED(15.9)).toBe("AED 15.90")
    expect(formatAED(8)).toBe("AED 8.00")
  })
})

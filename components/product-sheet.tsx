"use client"

import { getProduct, macrosFor, pricePerServing, shelfTags } from "@/lib/catalog"
import { formatAED, formatAmount, formatChip, formatKcal, formatPercent } from "@/lib/format"
import { macroCalorieShares } from "@/lib/macros"
import { AddButton } from "./add-button"
import { useStore } from "./store"

const SHELF_LABEL = {
  "high-protein": "High protein",
  "high-carb": "High carb",
  "high-fat": "High fat",
} as const

export function ProductSheet({ wide = false }: { wide?: boolean }) {
  const { activeId, closeProduct, basis } = useStore()
  const product = activeId ? getProduct(activeId) : undefined
  if (!product) return null

  const tags = shelfTags(product)
  const shares = macroCalorieShares(product.perServing)
  const active = macrosFor(product, basis)

  return (
    <div className={`${wide ? "fixed" : "absolute"} inset-0 z-40 flex flex-col justify-end bg-black/40`}>
      <button type="button" className="min-h-10 flex-1" aria-label="Close product details" onClick={closeProduct} />
      <div className="max-h-[82%] overflow-y-auto rounded-t-3xl bg-white px-4 pb-6 pt-3 shadow-2xl">
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-neutral-200" />
        <div className="flex items-start gap-3">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#fff4cc] text-4xl" aria-hidden>
            {product.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">{product.brand}</p>
            <h2 className="text-lg font-extrabold leading-tight">{product.name}</h2>
            <p className="mt-0.5 text-sm text-neutral-500">{product.size}</p>
          </div>
          <button type="button" onClick={closeProduct} aria-label="Close" className="grid h-8 w-8 place-items-center rounded-full bg-neutral-100 text-sm font-bold">
            ✕
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {tags.length === 0 ? (
            <span className="rounded-full bg-neutral-100 px-2 py-1 text-[11px] font-bold text-neutral-500">Everyday pick</span>
          ) : (
            tags.map((tag) => (
              <span key={tag} className="rounded-full bg-noon px-2 py-1 text-[11px] font-extrabold">
                {SHELF_LABEL[tag]}
              </span>
            ))
          )}
        </div>

        <p className="mt-3 text-sm font-semibold text-neutral-600" aria-label={formatChip(active)}>
          Showing {basis === "per100g" ? "per 100 g" : "per serving"}. Serving size is {product.servingSize}.
        </p>

        <div className="mt-3 overflow-hidden rounded-2xl border border-neutral-200">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-neutral-50 text-[11px] uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-3 py-2 font-semibold"> </th>
                <th className="px-3 py-2 font-semibold">Serving</th>
                <th className="px-3 py-2 font-semibold">100 g</th>
              </tr>
            </thead>
            <tbody>
              {(
                [
                  ["Calories", formatKcal(product.perServing.kcal), formatKcal(product.per100g.kcal)],
                  ["Protein", formatAmount(product.perServing.protein), formatAmount(product.per100g.protein)],
                  ["Carbs", formatAmount(product.perServing.carbs), formatAmount(product.per100g.carbs)],
                  ["Fat", formatAmount(product.perServing.fat), formatAmount(product.per100g.fat)],
                ] as const
              ).map((row) => (
                <tr key={row[0]} className="border-t border-neutral-100">
                  <th className="px-3 py-2 font-semibold">{row[0]}</th>
                  <td className="px-3 py-2">{row[1]}</td>
                  <td className="px-3 py-2">{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-[12px] leading-relaxed text-neutral-500">
          Per serving, protein is {formatPercent(shares.protein)} of calories, carbs are {formatPercent(shares.carbs)}, and fat is {formatPercent(shares.fat)}. Shelf price {formatAED(product.priceAED)}. One serving is about {formatAED(pricePerServing(product))}.
        </p>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Add one serving</p>
            <p className="text-lg font-extrabold">{formatAED(pricePerServing(product))}</p>
          </div>
          <AddButton id={product.id} name={product.name} />
        </div>
      </div>
    </div>
  )
}

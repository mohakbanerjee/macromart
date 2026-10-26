"use client"

import { macrosFor, shelfTags } from "@/lib/catalog"
import { formatAED } from "@/lib/format"
import type { Product } from "@/lib/types"
import { AddButton } from "./add-button"
import { MacroChip } from "./macro-chip"
import { useStore } from "./store"

const WASH: Record<Product["category"], string> = {
  dairy: "bg-[#fff4cc]",
  meat: "bg-[#fde7dc]",
  produce: "bg-[#e7f5d8]",
  bakery: "bg-[#f6ead7]",
  pantry: "bg-[#f3efe6]",
  breakfast: "bg-[#fff1dc]",
  snacks: "bg-[#fdecc8]",
}

const SHELF_LABEL = {
  "high-protein": "High protein",
  "high-carb": "High carb",
  "high-fat": "High fat",
} as const

export function ProductCard({
  product,
  layout = "rail",
  badge,
  metric,
}: {
  product: Product
  layout?: "rail" | "grid" | "row"
  badge?: string
  metric?: string | null
}) {
  const { basis, openProduct } = useStore()
  const macros = macrosFor(product, basis)
  const wash = WASH[product.category]

  if (layout === "row") {
    return (
      <article className={`relative flex gap-3 rounded-2xl bg-white p-3 shadow-[0_1px_0_rgba(0,0,0,0.04)] ${badge ? "mt-2 ring-2 ring-noon" : ""}`}>
        {badge ? (
          <span className="absolute -top-2 left-3 rounded-full bg-noon px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-ink">
            {badge}
          </span>
        ) : null}
        <button type="button" onClick={() => openProduct(product.id)} className="flex min-w-0 flex-1 gap-3 text-left">
          <span className={`grid h-16 w-16 shrink-0 place-items-center rounded-xl text-3xl ${wash}`} aria-hidden>
            {product.emoji}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[10px] font-semibold uppercase tracking-wide text-neutral-400">{product.brand}</span>
            <span className="block truncate text-[14px] font-extrabold leading-tight">{product.name}</span>
            <span className="mt-0.5 block text-[11px] text-neutral-500">{product.size}</span>
            <MacroChip macros={macros} className="mt-1" />
            {metric ? <span className="mt-1 block text-[11px] font-semibold text-neutral-600">{metric}</span> : null}
          </span>
        </button>
        <div className="flex flex-col items-end justify-between">
          <p className="text-[13px] font-extrabold">{formatAED(product.priceAED)}</p>
          <AddButton id={product.id} name={product.name} />
        </div>
      </article>
    )
  }

  return (
    <article className={`relative rounded-2xl bg-white p-2 shadow-[0_1px_0_rgba(0,0,0,0.04)] ${layout === "rail" ? "w-[148px] shrink-0 snap-start" : "w-full"}`}>
      <button type="button" onClick={() => openProduct(product.id)} className="block w-full text-left">
        <span className={`relative grid h-[92px] place-items-center rounded-xl text-[40px] ${wash}`}>
          {badge ? (
            <span className="absolute left-1.5 top-1.5 rounded-full bg-noon px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-ink">
              {badge}
            </span>
          ) : null}
          <span aria-hidden>{product.emoji}</span>
        </span>
        <span className="mt-2 block truncate text-[10px] font-semibold uppercase tracking-wide text-neutral-400">{product.brand}</span>
        <span className="mt-0.5 block min-h-9 text-[13px] font-bold leading-tight">{product.name}</span>
        <span className="mt-0.5 block text-[11px] text-neutral-500">{product.size}</span>
        <MacroChip macros={macros} className="mt-1 min-h-8" />
      </button>
      <div className="mt-1 flex items-center justify-between gap-1">
        <p className="text-[13px] font-extrabold leading-none">{formatAED(product.priceAED)}</p>
        <AddButton id={product.id} name={product.name} />
      </div>
      <span className="sr-only">{shelfTags(product).map((tag) => SHELF_LABEL[tag]).join(", ")}</span>
    </article>
  )
}

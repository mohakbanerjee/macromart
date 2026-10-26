"use client"

import Link from "next/link"
import { getProduct, shelfTags } from "@/lib/catalog"
import { formatAED } from "@/lib/format"
import { AddButton } from "./add-button"
import { BasisToggle } from "./basis-toggle"
import { MacroChip } from "./macro-chip"
import { useStore } from "./store"

const EXAMPLES = ["chicken-sadia", "oats-quaker", "almonds-bayara"]

const SHELF_LABEL = {
  "high-protein": "High protein",
  "high-carb": "High carb",
  "high-fat": "High fat",
} as const

export function CompareView() {
  const { basis, totals } = useStore()
  const examples = EXAMPLES.map((id) => getProduct(id)).filter((product) => product !== undefined)

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <span className="rounded-md bg-ink px-1.5 py-0.5 text-sm font-black text-noon">noon</span>
          <span className="text-sm font-extrabold">minutes</span>
          <span className="rounded-full bg-noon px-2 py-0.5 text-[10px] font-extrabold uppercase">MacroMart</span>
        </div>
        <div className="flex items-center gap-2">
          <Link id="cart-target" href="/basket" className="rounded-full bg-noon px-3 py-2 text-xs font-extrabold text-ink">
            Basket{totals.servings > 0 ? ` ${totals.servings}` : ""}
          </Link>
          <Link href="/" className="rounded-full bg-ink px-3 py-2 text-xs font-bold text-white">
            Shop
          </Link>
        </div>
      </div>

      <h1 className="mt-8 text-3xl font-extrabold tracking-tight sm:text-4xl">Before and after</h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-neutral-600">
        Same groceries. The left card is the current noon Minutes card: name, size, and price. The right card is MacroMart.
      </p>
      <div className="mt-4 max-w-xs">
        <BasisToggle />
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {examples.map((product) => {
          const tags = shelfTags(product)
          const macros = basis === "per100g" ? product.per100g : product.perServing
          return (
            <div key={product.id} className="grid grid-cols-2 gap-2 sm:gap-4">
              <article className="flex h-full flex-col rounded-2xl bg-white p-3">
                <p className="text-[10px] font-extrabold uppercase tracking-wide text-neutral-400">Before</p>
                <div className="mt-2 grid h-16 place-items-center rounded-xl bg-neutral-100 text-3xl" aria-hidden>
                  {product.emoji}
                </div>
                <h2 className="mt-2 text-[14px] font-extrabold leading-tight">{product.name}</h2>
                <p className="mt-1 text-[12px] text-neutral-500">{product.size}</p>
                <p className="mt-auto pt-3 text-[15px] font-extrabold">{formatAED(product.priceAED)}</p>
              </article>
              <article className="flex h-full flex-col rounded-2xl bg-white p-3 ring-2 ring-noon">
                <p className="text-[10px] font-extrabold uppercase tracking-wide text-ink">After</p>
                <div className="relative mt-2 grid h-16 place-items-center rounded-xl bg-[#fff6cc] text-3xl" aria-hidden>
                  {product.emoji}
                </div>
                <p className="mt-2 truncate text-[10px] font-semibold uppercase tracking-wide text-neutral-400">{product.brand}</p>
                <h2 className="text-[14px] font-extrabold leading-tight">{product.name}</h2>
                <p className="mt-0.5 text-[12px] text-neutral-500">{product.size}</p>
                <MacroChip macros={macros} className="mt-1" />
                <div className="mt-1 flex flex-wrap gap-1">
                  {tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-noon px-1.5 py-0.5 text-[9px] font-extrabold">
                      {SHELF_LABEL[tag]}
                    </span>
                  ))}
                </div>
                <div className="mt-auto flex items-end justify-between gap-2 pt-3">
                  <p className="text-[15px] font-extrabold">{formatAED(product.priceAED)}</p>
                  <AddButton id={product.id} name={product.name} />
                </div>
              </article>
            </div>
          )
        })}
      </div>

      <div className="mt-8 rounded-3xl bg-white p-4 text-[13px] leading-relaxed">
        <p className="font-extrabold">How a food earns a shelf</p>
        <p className="mt-2">High protein: at least 10 g per serving, and protein calories are at least 20 percent.</p>
        <p>High carb: carbohydrate calories are at least 55 percent.</p>
        <p>High fat: fat calories are at least 50 percent.</p>
        <p className="mt-2 text-neutral-500">The chip follows the shop toggle. Open the basket to set a protein goal and close the gap.</p>
        <div className="mt-3">
          <Link href="/basket" className="font-extrabold underline">
            Open the macro goal basket
          </Link>
        </div>
      </div>
    </div>
  )
}

"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { SECTIONS, macrosFor, productsInSection, withValue } from "@/lib/catalog"
import { defaultSort, proteinPer100Kcal, sortProducts } from "@/lib/macros"
import type { Basis, Product, SectionSlug, SortKey } from "@/lib/types"
import { BasisToggle } from "./basis-toggle"
import { ProductCard } from "./product-card"
import { useStore } from "./store"

const SORTS: { key: SortKey; label: string }[] = [
  { key: "proteinPerAed", label: "Protein / AED" },
  { key: "proteinPer100Kcal", label: "Protein / 100 kcal" },
  { key: "price", label: "Price" },
  { key: "kcal", label: "Kcal" },
]

function metricFor(product: Product & { proteinPerAed: number }, sort: SortKey, basis: Basis): string | null {
  if (sort === "proteinPerAed") return `${product.proteinPerAed.toFixed(1)}g protein / AED in the pack`
  if (sort === "proteinPer100Kcal") {
    return `${proteinPer100Kcal(macrosFor(product, basis)).toFixed(1)}g protein / 100 kcal`
  }
  if (sort === "kcal") return `${Math.round(macrosFor(product, basis).kcal)} kcal`
  return null
}

export function SectionView({ slug }: { slug: SectionSlug }) {
  const copy = SECTIONS[slug]
  const { basis } = useStore()
  const [sort, setSort] = useState<SortKey>(defaultSort(slug))
  const ranked = useMemo(
    () => sortProducts(productsInSection(slug).map(withValue), sort, basis),
    [slug, sort, basis],
  )

  return (
    <div className="pb-6">
      <header className="sticky top-0 z-20 border-b border-black/5 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <Link href="/" aria-label="Back to home" className="grid h-9 w-9 place-items-center rounded-full bg-neutral-100 text-lg">
            ←
          </Link>
          <div>
            <h1 className="text-base font-extrabold">{copy.title}</h1>
            <p className="text-[11px] text-neutral-500">{ranked.length} items</p>
          </div>
        </div>
        <div className="mt-3">
          <BasisToggle />
        </div>
      </header>

      <div className="px-4 py-3">
        <p className="rounded-2xl bg-[#fff6cc] px-3 py-3 text-[13px] leading-relaxed">{copy.rule}</p>
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto" role="group" aria-label="Sort">
          {SORTS.map((option) => {
            const active = sort === option.key
            return (
              <button
                key={option.key}
                type="button"
                aria-pressed={active}
                onClick={() => setSort(option.key)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] font-bold ${active ? "bg-ink text-white" : "bg-white text-ink"}`}
              >
                {option.label}
              </button>
            )
          })}
        </div>
        <p className="mt-2 text-[11px] text-neutral-500">
          {sort === "proteinPerAed"
            ? "Ranked by protein in the whole pack per dirham. The top item is marked best value."
            : "The top item is marked best value for this sort."}
        </p>
      </div>

      <div className="flex flex-col gap-3 px-4">
        {ranked.length === 0 ? (
          <div className="rounded-3xl bg-white px-6 py-12 text-center">
            <p className="font-extrabold">This shelf is empty</p>
            <p className="mt-1 text-sm text-neutral-500">No demo item matches the rule.</p>
          </div>
        ) : (
          ranked.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              layout="row"
              badge={index === 0 ? "Best value" : undefined}
              metric={metricFor(product, sort, basis)}
            />
          ))
        )}
      </div>
    </div>
  )
}

"use client"

import Link from "next/link"
import { CATEGORIES, productsInCategory } from "@/lib/catalog"
import type { CategorySlug } from "@/lib/types"
import { BasisToggle } from "./basis-toggle"
import { ProductCard } from "./product-card"

export function CategoryView({ slug }: { slug: CategorySlug }) {
  const category = CATEGORIES.find((item) => item.slug === slug)
  const items = productsInCategory(slug).slice().sort((a, b) => a.priceAED - b.priceAED || a.name.localeCompare(b.name))

  return (
    <div className="pb-6">
      <header className="sticky top-0 z-20 border-b border-black/5 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <Link href="/" aria-label="Back to home" className="grid h-9 w-9 place-items-center rounded-full bg-neutral-100 text-lg">
            ←
          </Link>
          <h1 className="text-base font-extrabold">{category?.name ?? "Aisle"}</h1>
        </div>
        <div className="mt-3">
          <BasisToggle />
        </div>
      </header>
      {items.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <p className="font-extrabold">This aisle is empty</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 px-4 py-4">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} layout="grid" />
          ))}
        </div>
      )}
    </div>
  )
}

"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import {
  CATEGORIES,
  DEMO_NOTICE,
  SECTIONS,
  products,
  productsInCategory,
  productsInSection,
  withValue,
} from "@/lib/catalog"
import { defaultSort, sortProducts } from "@/lib/macros"
import type { SectionSlug } from "@/lib/types"
import { BasisToggle } from "./basis-toggle"
import { ProductCard } from "./product-card"

function Rail({ children }: { children: React.ReactNode }) {
  return <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-1 snap-x">{children}</div>
}

export function HomeView() {
  const [query, setQuery] = useState("")
  const trimmed = query.trim().toLowerCase()

  const results = useMemo(() => {
    if (!trimmed) return []
    return products.filter((product) => `${product.name} ${product.brand} ${product.category}`.toLowerCase().includes(trimmed))
  }, [trimmed])

  const sections: SectionSlug[] = ["high-protein", "high-carb", "high-fat"]

  return (
    <div>
      <div className="sticky top-0 z-20">
        <header className="bg-noon px-4 pb-3 pt-3 text-ink">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="rounded-md bg-ink px-1.5 py-0.5 text-[15px] font-black tracking-tight text-noon">noon</span>
              <span className="text-[15px] font-extrabold">minutes</span>
            </div>
            <span className="rounded-full bg-ink px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-noon">MacroMart</span>
          </div>
          <div className="mt-3 flex items-end justify-between">
            <div>
              <p className="text-[11px] font-semibold">Delivery in 15 mins</p>
              <p className="text-[16px] font-extrabold leading-tight">Business Bay</p>
            </div>
            <p className="text-[12px] font-bold">Dubai</p>
          </div>
          <label className="mt-3 flex items-center gap-2 rounded-full bg-white px-3 py-2.5 shadow-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-neutral-400">
              <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2" />
              <path d="M16 16.5 20 20.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search groceries"
              className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
              aria-label="Search groceries"
            />
            {query ? (
              <button type="button" onClick={() => setQuery("")} className="text-xs font-bold text-neutral-400" aria-label="Clear search">
                Clear
              </button>
            ) : null}
          </label>
        </header>
        <div className="border-b border-black/5 bg-white px-4 py-2">
          <BasisToggle />
        </div>
      </div>

      {trimmed ? (
        <div className="px-4 py-4">
          <p className="mb-3 text-sm font-bold">{results.length === 0 ? "No matches" : `${results.length} found`}</p>
          {results.length === 0 ? (
            <div className="rounded-3xl bg-white px-6 py-12 text-center">
              <p className="text-4xl" aria-hidden>🔎</p>
              <p className="mt-3 font-extrabold">Nothing matches that search</p>
              <p className="mt-1 text-sm text-neutral-500">Try eggs, oats, labneh, or tuna.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {results.map((product) => (
                <ProductCard key={product.id} product={product} layout="grid" />
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 py-4">
            {CATEGORIES.map((category) => (
              <Link key={category.slug} href={`/category/${category.slug}`} className="flex w-16 shrink-0 flex-col items-center gap-1 text-center">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-white text-2xl shadow-sm">{category.emoji}</span>
                <span className="text-[11px] font-semibold leading-tight">{category.name}</span>
              </Link>
            ))}
          </div>

          {sections.map((slug) => {
            const copy = SECTIONS[slug]
            const ranked = sortProducts(productsInSection(slug).map(withValue), defaultSort(slug), "serving").slice(0, 8)
            return (
              <section key={slug} className="mt-1">
                <div className="mb-2 flex items-end justify-between px-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-[16px] font-extrabold">{copy.title}</h2>
                      <span className="rounded bg-ink px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-noon">New</span>
                    </div>
                    <p className="mt-0.5 text-[12px] text-neutral-500">{copy.summary}</p>
                  </div>
                  <Link href={`/section/${slug}`} className="text-[13px] font-extrabold">
                    See all
                  </Link>
                </div>
                <Rail>
                  {ranked.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      layout="rail"
                      badge={slug === "high-protein" && index === 0 ? "Best value" : undefined}
                    />
                  ))}
                </Rail>
              </section>
            )
          })}

          {CATEGORIES.map((category) => {
            const aisle = productsInCategory(category.slug).slice(0, 8)
            return (
              <section key={category.slug} className="mt-5">
                <div className="mb-2 flex items-center justify-between px-4">
                  <h2 className="text-[16px] font-extrabold">{category.name}</h2>
                  <Link href={`/category/${category.slug}`} className="text-[13px] font-extrabold">
                    See all
                  </Link>
                </div>
                <Rail>
                  {aisle.map((product) => (
                    <ProductCard key={product.id} product={product} layout="rail" />
                  ))}
                </Rail>
              </section>
            )
          })}

          <p className="px-6 py-8 text-center text-[11px] leading-relaxed text-neutral-400">{DEMO_NOTICE}</p>
        </>
      )}
    </div>
  )
}

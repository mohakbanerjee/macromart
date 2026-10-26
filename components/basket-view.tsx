"use client"

import Link from "next/link"
import { getProduct, pricePerServing, products, proteinPerAedForProduct } from "@/lib/catalog"
import { formatAED, formatAmount, formatKcal } from "@/lib/format"
import { isHighProtein, suggestGapFillers } from "@/lib/macros"
import type { Goals } from "@/lib/types"
import { flyToCart } from "./fly-to-cart"
import { useStore, DEFAULT_GOALS } from "./store"

const PRESETS: { name: string; goals: Goals }[] = [
  { name: "Balanced", goals: DEFAULT_GOALS },
  { name: "High protein", goals: { protein: 180, carbs: 160, fat: 60, kcal: 2200 } },
  { name: "Lighter", goals: { protein: 110, carbs: 150, fat: 50, kcal: 1600 } },
]

function trimNumber(value: number): string {
  if (!Number.isFinite(value)) return "0"
  const rounded = Math.round(value * 10) / 10
  return Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(1)
}

function Bar({ label, value, goal, unit }: { label: string; value: number; goal: number; unit: string }) {
  const ratio = goal > 0 ? value / goal : value > 0 ? 1 : 0
  const over = goal > 0 && value > goal + 0.05
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2 text-[12px]">
        <span className="font-bold">{label}</span>
        <span className={over ? "font-bold text-red-600" : "text-neutral-500"}>
          {trimNumber(value)} / {trimNumber(goal)} {unit}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-neutral-200">
        <div
          className={`h-full rounded-full transition-[width] duration-500 ease-out ${over ? "bg-red-600" : "bg-ink"}`}
          style={{ width: `${Math.max(0, Math.min(ratio * 100, 100))}%` }}
        />
      </div>
    </div>
  )
}

export function BasketView() {
  const { goals, setGoals, lines, add, setQty, clear, totals } = useStore()
  const proteinLeft = goals.protein - totals.protein
  const kcalLeft = goals.kcal - totals.kcal

  const suggestions = suggestGapFillers(
    products
      .filter((product) => isHighProtein(product.perServing))
      .map((product) => ({
        id: product.id,
        protein: product.perServing.protein,
        kcal: product.perServing.kcal,
        priceAED: product.priceAED,
        proteinPerAed: proteinPerAedForProduct(product),
      })),
    proteinLeft,
    kcalLeft,
  )

  const addedProtein = suggestions.reduce((sum, item) => sum + item.protein * item.qty, 0)
  const addedKcal = suggestions.reduce((sum, item) => sum + item.kcal * item.qty, 0)
  const stillShort = proteinLeft - addedProtein

  function updateGoal(key: keyof Goals, raw: string) {
    if (raw.trim() === "") {
      setGoals({ ...goals, [key]: 0 })
      return
    }
    const next = Number(raw)
    if (!Number.isFinite(next) || next < 0) return
    setGoals({ ...goals, [key]: next })
  }

  return (
    <div className="pb-8">
      <header className="sticky top-0 z-20 border-b border-black/5 bg-noon px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/" aria-label="Back to home" className="grid h-9 w-9 place-items-center rounded-full bg-black/10 text-lg">
            ←
          </Link>
          <div>
            <p className="text-[11px] font-semibold">Macro goal basket</p>
            <h1 className="text-base font-extrabold">Today</h1>
          </div>
        </div>
      </header>

      <section className="px-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold">Daily goals</h2>
          <div className="flex gap-1.5">
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => setGoals(preset.goals)}
                className="rounded-full bg-white px-2 py-1 text-[10px] font-bold"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {(
            [
              ["protein", "Protein g"],
              ["carbs", "Carbs g"],
              ["fat", "Fat g"],
              ["kcal", "Calories"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="rounded-2xl bg-white px-3 py-2">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">{label}</span>
              <input
                type="number"
                min={0}
                inputMode="decimal"
                value={goals[key]}
                onChange={(event) => updateGoal(key, event.target.value)}
                className="mt-0.5 w-full bg-transparent text-lg font-extrabold outline-none"
              />
            </label>
          ))}
        </div>
      </section>

      <section className="mx-4 mt-4 flex flex-col gap-3 rounded-3xl bg-white p-4">
        <h2 className="text-sm font-extrabold">Live progress</h2>
        <Bar label="Protein" value={totals.protein} goal={goals.protein} unit="g" />
        <Bar label="Carbs" value={totals.carbs} goal={goals.carbs} unit="g" />
        <Bar label="Fat" value={totals.fat} goal={goals.fat} unit="g" />
        <Bar label="Calories" value={totals.kcal} goal={goals.kcal} unit="kcal" />
        <p className="text-[11px] leading-relaxed text-neutral-500">
          Bars count servings you add. A chicken pack stays on the shelf card at its full price. The basket prices one serving.
        </p>
      </section>

      <section className="mx-4 mt-4 animate-rise rounded-3xl bg-[#fff6cc] p-4">
        <h2 className="text-sm font-extrabold">Close the gap</h2>
        {proteinLeft <= 0 ? (
          <p className="mt-2 text-sm leading-relaxed">Protein goal is covered. The basket is on track for protein.</p>
        ) : suggestions.length === 0 ? (
          <p className="mt-2 text-sm leading-relaxed">
            You still need {trimNumber(proteinLeft)} g of protein. Nothing in the demo shop fits the calories left.
          </p>
        ) : (
          <>
            <p className="mt-2 text-sm leading-relaxed">
              {stillShort <= 0.05
                ? `These servings add ${trimNumber(addedProtein)} g protein and ${formatKcal(addedKcal)} kcal. That covers the protein still open, inside the calorie budget.`
                : `These servings add ${trimNumber(addedProtein)} g protein and ${formatKcal(addedKcal)} kcal. ${trimNumber(stillShort)} g of protein is still open.`}
            </p>
            <div className="mt-3 flex flex-col gap-2">
              {suggestions.map((item) => {
                const product = getProduct(item.id)
                if (!product) return null
                const servingPrice = pricePerServing(product) * item.qty
                return (
                  <div key={item.id} className="flex items-center gap-2 rounded-2xl bg-white p-2">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#fff4cc] text-2xl" aria-hidden>
                      {product.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-extrabold">{product.name}</p>
                      <p className="text-[11px] text-neutral-500">
                        {item.qty} {item.qty === 1 ? "serving" : "servings"} · {formatAmount(item.protein * item.qty)} protein · {formatKcal(item.kcal * item.qty)} kcal
                      </p>
                      <p className="text-[11px] font-semibold">{item.proteinPerAed.toFixed(1)}g protein / AED · {formatAED(servingPrice)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={(event) => {
                        flyToCart(event.currentTarget.getBoundingClientRect())
                        add(item.id, item.qty)
                      }}
                      className="rounded-full bg-ink px-3 py-2 text-[12px] font-bold text-white active:scale-95"
                    >
                      Add
                    </button>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </section>

      <section className="px-4 pt-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-extrabold">Basket</h2>
          {lines.length > 0 ? (
            <button type="button" onClick={clear} className="text-[12px] font-bold text-neutral-500">
              Clear
            </button>
          ) : null}
        </div>
        {lines.length === 0 ? (
          <div className="rounded-3xl bg-white px-6 py-10 text-center">
            <p className="text-4xl" aria-hidden>🧺</p>
            <p className="mt-3 font-extrabold">Your basket is empty</p>
            <p className="mt-1 text-sm text-neutral-500">Add a serving and the bars move with you.</p>
            <Link href="/" className="mt-4 inline-flex rounded-full bg-noon px-4 py-2 text-sm font-extrabold">
              Browse the shop
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {lines.map((line) => {
              const product = getProduct(line.id)
              if (!product) return null
              return (
                <div key={line.id} className="flex items-center gap-3 rounded-2xl bg-white p-3">
                  <span className="text-2xl" aria-hidden>{product.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-extrabold">{product.name}</p>
                    <p className="text-[11px] text-neutral-500">
                      {line.qty} {line.qty === 1 ? "serving" : "servings"} · {formatAED(pricePerServing(product) * line.qty)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" aria-label={`Remove one ${product.name}`} onClick={() => setQty(line.id, line.qty - 1)} className="grid h-8 w-8 place-items-center rounded-full bg-neutral-100 font-bold">
                      −
                    </button>
                    <span className="w-4 text-center text-sm font-extrabold">{line.qty}</span>
                    <button
                      type="button"
                      aria-label={`Add one ${product.name}`}
                      onClick={(event) => {
                        flyToCart(event.currentTarget.getBoundingClientRect())
                        add(line.id, 1)
                      }}
                      className="grid h-8 w-8 place-items-center rounded-full bg-noon font-black"
                    >
                      +
                    </button>
                  </div>
                </div>
              )
            })}
            <div className="mt-1 flex items-center justify-between rounded-2xl bg-ink px-4 py-3 text-white">
              <span className="text-sm font-bold">{totals.servings} {totals.servings === 1 ? "serving" : "servings"}</span>
              <span className="text-base font-extrabold">{formatAED(totals.price)}</span>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

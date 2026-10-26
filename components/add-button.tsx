"use client"

import { useState } from "react"
import { flyToCart } from "./fly-to-cart"
import { useStore } from "./store"

export function AddButton({
  id,
  name,
  qty = 1,
}: {
  id: string
  name: string
  qty?: number
}) {
  const { add } = useStore()
  const [hot, setHot] = useState(false)

  return (
    <button
      type="button"
      aria-label={`Add ${qty} serving${qty === 1 ? "" : "s"} of ${name}`}
      onClick={(event) => {
        event.stopPropagation()
        flyToCart(event.currentTarget.getBoundingClientRect())
        add(id, qty)
        setHot(true)
        window.setTimeout(() => setHot(false), 680)
      }}
      className={`relative grid h-8 w-8 place-items-center rounded-full bg-noon text-lg font-black leading-none text-ink shadow-sm transition active:scale-90 ${hot ? "animate-pop" : ""}`}
    >
      <span aria-hidden>{hot ? "✓" : "+"}</span>
      {hot ? (
        <span className="pointer-events-none absolute -top-3 text-[10px] font-extrabold animate-float">+{qty}</span>
      ) : null}
    </button>
  )
}

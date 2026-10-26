"use client"

import { useStore } from "./store"
import type { Basis } from "@/lib/types"

const OPTIONS: { id: Basis; label: string }[] = [
  { id: "serving", label: "Per serving" },
  { id: "per100g", label: "Per 100 g" },
]

export function BasisToggle() {
  const { basis, setBasis } = useStore()
  return (
    <div className="grid grid-cols-2 rounded-full bg-neutral-100 p-1 text-[12px] font-bold" role="group" aria-label="Macro basis">
      {OPTIONS.map((option) => {
        const active = basis === option.id
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={active}
            onClick={() => setBasis(option.id)}
            className={`rounded-full px-3 py-1.5 transition ${active ? "bg-ink text-white" : "text-neutral-500"}`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

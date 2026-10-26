"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useStore } from "./store"

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7} />
    </svg>
  )
}

function BasketIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 8h12l-1 12H7L6 8Z" stroke="currentColor" strokeWidth="1.7" />
      <path d="M9 8V6.5A3 3 0 0 1 12 3.5 3 3 0 0 1 15 6.5V8" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}

function CompareIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3.5" y="5" width="7" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
      <rect x="13.5" y="5" width="7" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}

export function BottomNav() {
  const path = usePathname()
  const { totals, bump } = useStore()
  const items = [
    { href: "/", label: "Home", icon: <HomeIcon active={path === "/"} /> },
    { href: "/basket", label: "Basket", icon: <BasketIcon /> },
    { href: "/compare", label: "Compare", icon: <CompareIcon /> },
  ]

  return (
    <nav className="grid grid-cols-3 border-t border-black/5 bg-white px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-1.5" aria-label="Primary">
      {items.map((item) => {
        const active = item.href === "/" ? path === "/" : path.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex flex-col items-center gap-0.5 py-1 text-[11px] font-bold ${active ? "text-ink" : "text-neutral-400"}`}
          >
            <span id={item.href === "/basket" ? "cart-target" : undefined} className="relative">
              {item.icon}
              {item.href === "/basket" && totals.servings > 0 ? (
                <span
                  key={bump}
                  className="absolute -right-2.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-noon px-1 text-[10px] font-extrabold text-ink animate-pop"
                >
                  {totals.servings}
                </span>
              ) : null}
            </span>
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

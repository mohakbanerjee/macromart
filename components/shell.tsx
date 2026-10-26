"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { BottomNav } from "./bottom-nav"
import { ProductSheet } from "./product-sheet"
import { useStore } from "./store"

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname()
  const { closeProduct } = useStore()

  useEffect(() => {
    closeProduct()
  }, [path, closeProduct])

  if (path === "/compare") {
    return (
      <div className="min-h-dvh bg-[#efeee9]">
        {children}
        <ProductSheet wide />
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-[#e4e4e4] md:flex md:h-dvh md:items-center md:justify-center md:overflow-hidden md:py-6">
      <div className="relative mx-auto flex h-dvh w-full max-w-[390px] flex-col overflow-hidden bg-paper md:h-[min(844px,calc(100dvh-3rem))] md:rounded-[2.2rem] md:shadow-[0_30px_80px_rgba(0,0,0,0.18)] md:ring-[10px] md:ring-black">
        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">{children}</div>
        <BottomNav />
        <ProductSheet />
      </div>
    </div>
  )
}

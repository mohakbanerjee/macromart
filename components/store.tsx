"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { getProduct, pricePerServing } from "@/lib/catalog"
import type { Basis, CartLine, Goals, MacroSet } from "@/lib/types"

const STORAGE = {
  cart: "macromart-cart",
  goals: "macromart-goals",
  basis: "macromart-basis",
} as const

export const DEFAULT_GOALS: Goals = {
  protein: 150,
  carbs: 200,
  fat: 65,
  kcal: 2000,
}

export type Totals = MacroSet & { price: number; servings: number }

type StoreValue = {
  basis: Basis
  setBasis: (basis: Basis) => void
  goals: Goals
  setGoals: (goals: Goals) => void
  lines: CartLine[]
  add: (id: string, qty?: number) => void
  setQty: (id: string, qty: number) => void
  clear: () => void
  bump: number
  activeId: string | null
  openProduct: (id: string) => void
  closeProduct: () => void
  totals: Totals
}

const StoreContext = createContext<StoreValue | null>(null)

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [basis, setBasis] = useState<Basis>("serving")
  const [goals, setGoals] = useState<Goals>(DEFAULT_GOALS)
  const [lines, setLines] = useState<CartLine[]>([])
  const [bump, setBump] = useState(0)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const storedBasis = localStorage.getItem(STORAGE.basis)
    const storedGoals = readJson<Goals>(STORAGE.goals)
    const storedLines = readJson<CartLine[]>(STORAGE.cart)
    if (storedBasis === "serving" || storedBasis === "per100g") setBasis(storedBasis)
    if (
      storedGoals &&
      [storedGoals.protein, storedGoals.carbs, storedGoals.fat, storedGoals.kcal].every((value) => typeof value === "number")
    ) {
      setGoals(storedGoals)
    }
    if (Array.isArray(storedLines)) {
      setLines(storedLines.filter((line) => line && typeof line.id === "string" && line.qty > 0))
    }
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    localStorage.setItem(STORAGE.basis, basis)
    localStorage.setItem(STORAGE.goals, JSON.stringify(goals))
    localStorage.setItem(STORAGE.cart, JSON.stringify(lines))
  }, [basis, goals, lines, ready])

  const totals = useMemo<Totals>(() => {
    const sum: Totals = { kcal: 0, protein: 0, carbs: 0, fat: 0, price: 0, servings: 0 }
    for (const line of lines) {
      const product = getProduct(line.id)
      if (!product) continue
      sum.kcal += product.perServing.kcal * line.qty
      sum.protein += product.perServing.protein * line.qty
      sum.carbs += product.perServing.carbs * line.qty
      sum.fat += product.perServing.fat * line.qty
      sum.price += pricePerServing(product) * line.qty
      sum.servings += line.qty
    }
    return sum
  }, [lines])

  const add = useCallback((id: string, qty = 1) => {
    if (!getProduct(id) || !(qty > 0)) return
    setLines((current) => {
      const found = current.find((line) => line.id === id)
      if (!found) return [...current, { id, qty }]
      return current.map((line) => (line.id === id ? { ...line, qty: line.qty + qty } : line))
    })
    setBump((value) => value + 1)
  }, [])

  const setQty = useCallback((id: string, qty: number) => {
    setLines((current) => {
      if (qty <= 0) return current.filter((line) => line.id !== id)
      return current.map((line) => (line.id === id ? { ...line, qty } : line))
    })
  }, [])

  const clear = useCallback(() => setLines([]), [])
  const openProduct = useCallback((id: string) => setActiveId(id), [])
  const closeProduct = useCallback(() => setActiveId(null), [])

  const value = useMemo<StoreValue>(
    () => ({
      basis,
      setBasis,
      goals,
      setGoals,
      lines,
      add,
      setQty,
      clear,
      bump,
      activeId,
      openProduct,
      closeProduct,
      totals,
    }),
    [basis, goals, lines, add, setQty, clear, bump, activeId, openProduct, closeProduct, totals],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const store = useContext(StoreContext)
  if (!store) throw new Error("useStore must be used inside StoreProvider")
  return store
}

import { notFound } from "next/navigation"
import { CategoryView } from "@/components/category-view"
import { CATEGORIES } from "@/lib/catalog"
import type { CategorySlug } from "@/lib/types"

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ slug: category.slug }))
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const category = CATEGORIES.find((item) => item.slug === slug)
  if (!category) notFound()
  return <CategoryView slug={category.slug as CategorySlug} />
}

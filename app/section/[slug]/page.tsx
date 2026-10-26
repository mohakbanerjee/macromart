import { notFound } from "next/navigation"
import { SectionView } from "@/components/section-view"
import type { SectionSlug } from "@/lib/types"

const SLUGS: SectionSlug[] = ["high-protein", "high-carb", "high-fat"]

export function generateStaticParams() {
  return SLUGS.map((slug) => ({ slug }))
}

export default async function SectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!SLUGS.includes(slug as SectionSlug)) notFound()
  return <SectionView slug={slug as SectionSlug} />
}

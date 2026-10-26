import Link from "next/link"

export default function NotFound() {
  return (
    <div className="px-6 py-16 text-center">
      <p className="text-lg font-extrabold">That page is not in the shop</p>
      <Link href="/" className="mt-4 inline-flex rounded-full bg-noon px-4 py-2 text-sm font-extrabold">
        Back home
      </Link>
    </div>
  )
}

import type { Metadata, Viewport } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import { Shell } from "@/components/shell"
import { StoreProvider } from "@/components/store"
import "./globals.css"

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "MacroMart",
  description: "A macro aware upgrade for noon Minutes grocery shopping in the UAE.",
}

export const viewport: Viewport = {
  themeColor: "#ffe500",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${sans.className} bg-[#e4e4e4] text-ink antialiased`}>
        <StoreProvider>
          <Shell>{children}</Shell>
        </StoreProvider>
      </body>
    </html>
  )
}

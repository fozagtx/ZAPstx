import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/layout/theme-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "sBTC Marketplace - The Future of Digital Commerce",
  description: "Buy and sell digital products with sBTC. The first marketplace built on Bitcoin's most secure L2.",
  keywords: ["sBTC", "Bitcoin", "Digital Marketplace", "NFT", "Crypto", "Blockchain"],
  authors: [{ name: "sBTC Marketplace" }],
  creator: "sBTC Marketplace",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://sbtc-marketplace.com",
    title: "sBTC Marketplace - The Future of Digital Commerce",
    description: "Buy and sell digital products with sBTC. The first marketplace built on Bitcoin's most secure L2.",
    siteName: "sBTC Marketplace",
  },
  twitter: {
    card: "summary_large_image",
    title: "sBTC Marketplace - The Future of Digital Commerce",
    description: "Buy and sell digital products with sBTC. The first marketplace built on Bitcoin's most secure L2.",
    creator: "@sbtcmarketplace",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

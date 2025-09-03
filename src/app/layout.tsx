import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/layout/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { StacksProvider } from "@/contexts/StacksContext"

export const metadata: Metadata = {
  title: "ZapX - sBTC Payment Links & Widgets",
  description: "Create secure payment links and embeddable widgets powered by sBTC on Stacks. Accept Bitcoin payments instantly.",
  keywords: ["sBTC", "Bitcoin", "Payment Links", "Stacks", "Crypto Payments", "Blockchain", "Payment Widgets"],
  authors: [{ name: "ZapX" }],
  creator: "ZapX",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://zapx.dev",
    title: "ZapX - sBTC Payment Links & Widgets",
    description: "Create secure payment links and embeddable widgets powered by sBTC on Stacks. Accept Bitcoin payments instantly.",
    siteName: "ZapX",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZapX - sBTC Payment Links & Widgets",
    description: "Create secure payment links and embeddable widgets powered by sBTC on Stacks. Accept Bitcoin payments instantly.",
    creator: "@zapx_dev",
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
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <StacksProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </StacksProvider>
      </body>
    </html>
  )
}

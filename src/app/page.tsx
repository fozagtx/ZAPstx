import { Navigation } from "@/components/layout/navigation"
import { HeroSection } from "@/components/marketplace/hero-section"
import { PageTransition } from "@/components/animations/page-transition"

export default function Home() {
  return (
    <PageTransition>
      <Navigation />
      <main className="pt-16">
        <HeroSection />
      </main>
    </PageTransition>
  )
}

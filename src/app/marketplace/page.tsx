import { Navigation } from "@/components/layout/navigation"
import { PageTransition } from "@/components/animations/page-transition"
import { ProductGrid } from "@/components/marketplace/product-grid"
import { SearchFilters } from "@/components/marketplace/search-filters"
import { CategoryNav } from "@/components/marketplace/category-nav"
import { FeaturedProducts } from "@/components/marketplace/featured-products"

export default function MarketplacePage() {
  return (
    <PageTransition>
      <Navigation />
      <main className="pt-16">
        <div className="container py-8">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold">Marketplace</h1>
            <p className="text-muted-foreground">
              Discover amazing digital products powered by sBTC
            </p>
          </div>

          <FeaturedProducts />
          
          <div className="mt-12">
            <CategoryNav />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <SearchFilters />
            </div>
            <div className="lg:col-span-3">
              <ProductGrid />
            </div>
          </div>
        </div>
      </main>
    </PageTransition>
  )
}
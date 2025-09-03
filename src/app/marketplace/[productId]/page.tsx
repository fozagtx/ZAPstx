import { Navigation } from "@/components/layout/navigation"
import { PageTransition } from "@/components/animations/page-transition"
import { ProductDetail } from "@/components/marketplace/product-detail"
import { ProductReviews } from "@/components/marketplace/product-reviews"
import { RelatedProducts } from "@/components/marketplace/related-products"

interface ProductPageProps {
  params: {
    productId: string
  }
}

export default function ProductPage({ params }: ProductPageProps) {
  return (
    <PageTransition>
      <Navigation />
      <main className="pt-16">
        <div className="container py-8">
          <ProductDetail productId={params.productId} />
          
          <div className="mt-16">
            <ProductReviews productId={params.productId} />
          </div>
          
          <div className="mt-16">
            <RelatedProducts />
          </div>
        </div>
      </main>
    </PageTransition>
  )
}
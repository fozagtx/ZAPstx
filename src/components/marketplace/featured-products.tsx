"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Heart, Download, Eye } from "lucide-react"
import { FadeIn } from "@/components/animations/page-transition"
import Link from "next/link"
import Image from "next/image"

const featuredProducts = [
  {
    id: "1",
    title: "Premium UI Kit",
    description: "Beautiful components for modern web apps",
    price: "0.025",
    originalPrice: "0.050",
    currency: "sBTC",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&h=300&fit=crop",
    category: "Design",
    rating: 4.9,
    downloads: 1250,
    seller: {
      name: "DesignStudio",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    },
    featured: true,
  },
  {
    id: "2",
    title: "React Component Library",
    description: "50+ production-ready React components",
    price: "0.040",
    currency: "sBTC",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&h=300&fit=crop",
    category: "Development",
    rating: 4.8,
    downloads: 950,
    seller: {
      name: "ReactPro",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face",
    },
    featured: true,
  },
  {
    id: "3",
    title: "Marketing Templates",
    description: "Complete marketing campaign templates",
    price: "0.015",
    currency: "sBTC",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&h=300&fit=crop",
    category: "Marketing",
    rating: 4.7,
    downloads: 680,
    seller: {
      name: "MarketingPro",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face",
    },
    featured: true,
  },
]

export function FeaturedProducts() {
  return (
    <section>
      <FadeIn>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Featured Products</h2>
            <p className="text-muted-foreground">Handpicked by our team</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/marketplace/featured">View All</Link>
          </Button>
        </div>
      </FadeIn>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {featuredProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="group overflow-hidden glass-card floating-card">
              <div className="relative overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.title}
                  width={500}
                  height={300}
                  className="aspect-[5/3] w-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" className="glass-card">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="secondary" className="glass-card">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Featured Badge */}
                <Badge className="absolute top-3 left-3 bg-gradient-to-r from-brand-500 to-purple-500">
                  Featured
                </Badge>

                {/* Price Badge */}
                <div className="absolute top-3 right-3 glass-card px-3 py-1 rounded-full">
                  <div className="flex items-center gap-1">
                    {product.originalPrice && (
                      <span className="text-xs text-muted-foreground line-through">
                        {product.originalPrice}
                      </span>
                    )}
                    <span className="font-semibold">{product.price} {product.currency}</span>
                  </div>
                </div>
              </div>

              <CardContent className="p-4">
                <div className="mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {product.category}
                  </Badge>
                </div>

                <h3 className="mb-2 font-semibold line-clamp-1">
                  <Link 
                    href={`/marketplace/${product.id}`}
                    className="hover:text-brand-500 transition-colors"
                  >
                    {product.title}
                  </Link>
                </h3>

                <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                  {product.description}
                </p>

                <div className="mb-4 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{product.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      <span>{product.downloads}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Image
                      src={product.seller.avatar}
                      alt={product.seller.name}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                    <span className="text-sm text-muted-foreground">
                      {product.seller.name}
                    </span>
                  </div>

                  <Button size="sm" className="bg-gradient-to-r from-brand-500 to-purple-500 hover:from-brand-600 hover:to-purple-600">
                    Buy Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
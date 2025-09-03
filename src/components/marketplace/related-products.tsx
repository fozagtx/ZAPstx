"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Heart, Download } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const relatedProducts = [
  {
    id: "2",
    title: "E-commerce UI Components",
    description: "Complete set of e-commerce components",
    price: "0.028",
    currency: "sBTC",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=250&fit=crop",
    category: "Design",
    rating: 4.8,
    downloads: 850,
    seller: {
      name: "ShopDesign",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face",
    },
  },
  {
    id: "3",
    title: "Mobile App UI Kit",
    description: "Modern mobile app design system",
    price: "0.032",
    currency: "sBTC",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=250&fit=crop",
    category: "Design",
    rating: 4.9,
    downloads: 620,
    seller: {
      name: "MobileUI",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face",
    },
  },
  {
    id: "4",
    title: "Landing Page Templates",
    description: "High-converting landing pages",
    price: "0.025",
    currency: "sBTC",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop",
    category: "Marketing",
    rating: 4.7,
    downloads: 940,
    seller: {
      name: "ConvertPro",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    },
  },
  {
    id: "5",
    title: "Icon Pack Pro",
    description: "500+ premium vector icons",
    price: "0.018",
    currency: "sBTC",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=250&fit=crop",
    category: "Design",
    rating: 4.6,
    downloads: 1200,
    seller: {
      name: "IconStudio",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
    },
  },
]

export function RelatedProducts() {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Related Products</h2>
          <p className="text-muted-foreground">You might also like these</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/marketplace?category=design">View All</Link>
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {relatedProducts.map((product, index) => (
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
                  width={400}
                  height={250}
                  className="aspect-[8/5] w-full object-cover transition-transform group-hover:scale-105"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" variant="secondary" className="glass-card">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>

                {/* Price Badge */}
                <div className="absolute top-3 right-3 glass-card px-2 py-1 rounded-full">
                  <span className="text-sm font-semibold">{product.price} {product.currency}</span>
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

                <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
                  {product.description}
                </p>

                <div className="mb-3 flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{product.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    <span>{product.downloads}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Image
                      src={product.seller.avatar}
                      alt={product.seller.name}
                      width={20}
                      height={20}
                      className="rounded-full"
                    />
                    <span className="text-xs text-muted-foreground">
                      {product.seller.name}
                    </span>
                  </div>

                  <Button size="sm" className="bg-gradient-to-r from-brand-500 to-purple-500 hover:from-brand-600 hover:to-purple-600">
                    Buy
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
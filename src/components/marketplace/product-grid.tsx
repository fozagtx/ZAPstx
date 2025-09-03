"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Star, Heart, Download, Eye, ArrowUpDown, Grid3X3, List } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"

const products = [
  {
    id: "1",
    title: "Premium Dashboard UI Kit",
    description: "Complete dashboard with 100+ components and screens",
    price: "0.035",
    currency: "sBTC",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=300&fit=crop",
    category: "Design",
    rating: 4.9,
    downloads: 1250,
    views: 8430,
    seller: {
      name: "DesignStudio",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
      verified: true,
    },
    tags: ["Modern", "Dark Mode", "Responsive"],
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    title: "React Component Collection",
    description: "50+ production-ready React components with TypeScript",
    price: "0.028",
    currency: "sBTC",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&h=300&fit=crop",
    category: "Development",
    rating: 4.8,
    downloads: 950,
    views: 5230,
    seller: {
      name: "ReactPro",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face",
      verified: true,
    },
    tags: ["TypeScript", "React", "Components"],
    createdAt: "2024-01-12",
  },
  {
    id: "3",
    title: "Social Media Templates Pack",
    description: "Instagram and Facebook templates for modern brands",
    price: "0.015",
    currency: "sBTC",
    image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=300&fit=crop",
    category: "Marketing",
    rating: 4.7,
    downloads: 680,
    views: 3420,
    seller: {
      name: "MarketingPro",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face",
      verified: false,
    },
    tags: ["Social Media", "Templates", "Branding"],
    createdAt: "2024-01-10",
  },
  {
    id: "4",
    title: "Mobile App Wireframe Kit",
    description: "Complete wireframe system for iOS and Android apps",
    price: "0.042",
    currency: "sBTC",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500&h=300&fit=crop",
    category: "Design",
    rating: 4.9,
    downloads: 340,
    views: 2100,
    seller: {
      name: "UXMaster",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      verified: true,
    },
    tags: ["Mobile", "Wireframes", "UX"],
    createdAt: "2024-01-08",
  },
  {
    id: "5",
    title: "Email Newsletter Templates",
    description: "Beautiful responsive email templates for all industries",
    price: "0.020",
    currency: "sBTC",
    image: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=500&h=300&fit=crop",
    category: "Marketing",
    rating: 4.6,
    downloads: 520,
    views: 2800,
    seller: {
      name: "EmailDesign",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
      verified: false,
    },
    tags: ["Email", "Newsletter", "Responsive"],
    createdAt: "2024-01-05",
  },
  {
    id: "6",
    title: "Startup Landing Pages",
    description: "5 high-converting landing page designs for startups",
    price: "0.038",
    currency: "sBTC",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&h=300&fit=crop",
    category: "Business",
    rating: 4.8,
    downloads: 450,
    views: 3100,
    seller: {
      name: "StartupDesign",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=40&h=40&fit=crop&crop=face",
      verified: true,
    },
    tags: ["Landing Page", "Startup", "Conversion"],
    createdAt: "2024-01-03",
  },
]

const sortOptions = [
  { label: "Most Popular", value: "popular" },
  { label: "Newest First", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Best Rating", value: "rating" },
  { label: "Most Downloaded", value: "downloads" },
]

export function ProductGrid() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("popular")
  const [favorites, setFavorites] = useState<string[]>([])

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Showing {products.length} products
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowUpDown className="h-4 w-4" />
                {sortOptions.find(opt => opt.value === sortBy)?.label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-card">
              {sortOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={sortBy === option.value ? "bg-accent" : ""}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View Mode Toggle */}
          <div className="flex items-center border rounded-md p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-8 px-2"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="h-8 px-2"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Products Grid/List */}
      <div className={
        viewMode === "grid" 
          ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3" 
          : "space-y-4"
      }>
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className={`group overflow-hidden glass-card floating-card ${
              viewMode === "list" ? "flex" : ""
            }`}>
              <div className={`relative overflow-hidden ${
                viewMode === "list" ? "w-48 flex-shrink-0" : ""
              }`}>
                <Image
                  src={product.image}
                  alt={product.title}
                  width={500}
                  height={300}
                  className={`object-cover transition-transform group-hover:scale-105 ${
                    viewMode === "list" ? "h-32 w-full" : "aspect-[5/3] w-full"
                  }`}
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" className="glass-card">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      className={`glass-card ${favorites.includes(product.id) ? 'text-red-500' : ''}`}
                      onClick={(e) => {
                        e.preventDefault()
                        toggleFavorite(product.id)
                      }}
                    >
                      <Heart className={`h-4 w-4 ${favorites.includes(product.id) ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                </div>

                {/* Price Badge */}
                <div className="absolute top-3 right-3 glass-card px-3 py-1 rounded-full">
                  <span className="font-semibold text-sm">{product.price} {product.currency}</span>
                </div>
              </div>

              <CardContent className={`p-4 ${viewMode === "list" ? "flex-1" : ""}`}>
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {product.category}
                  </Badge>
                  {product.seller.verified && (
                    <Badge variant="outline" className="text-xs">
                      Verified
                    </Badge>
                  )}
                </div>

                <h3 className={`font-semibold line-clamp-1 ${viewMode === "list" ? "text-lg mb-2" : "mb-2"}`}>
                  <Link 
                    href={`/marketplace/${product.id}`}
                    className="hover:text-brand-500 transition-colors"
                  >
                    {product.title}
                  </Link>
                </h3>

                <p className={`text-sm text-muted-foreground ${viewMode === "list" ? "line-clamp-3 mb-3" : "line-clamp-2 mb-4"}`}>
                  {product.description}
                </p>

                {/* Tags */}
                <div className="mb-4 flex flex-wrap gap-1">
                  {product.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Stats */}
                <div className="mb-4 flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{product.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    <span>{product.downloads}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{product.views}</span>
                  </div>
                </div>

                {/* Seller & Buy Button */}
                <div className={`flex items-center ${viewMode === "list" ? "justify-between" : "justify-between"}`}>
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

      {/* Load More */}
      <div className="flex justify-center pt-8">
        <Button variant="outline" className="glass-card">
          Load More Products
        </Button>
      </div>
    </div>
  )
}
"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Star,
  Heart,
  Download,
  Eye,
  Share2,
  ShieldCheck,
  Clock,
  FileText,
  Zap,
  Crown,
  Check,
  ArrowLeft,
} from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { FadeIn } from "@/components/animations/page-transition"

const product = {
  id: "1",
  title: "Premium Dashboard UI Kit",
  description: "A comprehensive dashboard UI kit with over 100 components, 50+ screens, and everything you need to build modern web applications. Perfect for SaaS, admin panels, and analytics dashboards.",
  longDescription: `This premium dashboard UI kit includes everything you need to build professional web applications. 

  **What's Included:**
  - 100+ carefully crafted components
  - 50+ pre-designed screens
  - Dark & light mode support
  - Fully responsive design
  - Figma source files
  - React components (TypeScript)
  - Complete design system
  - Documentation & guidelines

  **Perfect for:**
  - SaaS applications
  - Admin dashboards
  - Analytics platforms
  - Business tools
  - CRM systems

  Built with modern design principles and best practices, this kit will save you hundreds of hours of development time.`,
  price: "0.035",
  currency: "sBTC",
  images: [
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
  ],
  category: "Design",
  rating: 4.9,
  ratingCount: 127,
  downloads: 1250,
  views: 8430,
  createdAt: "2024-01-15",
  updatedAt: "2024-01-20",
  seller: {
    name: "DesignStudio Pro",
    username: "@designstudio",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    verified: true,
    rating: 4.8,
    sales: 2340,
    followers: 8920,
    joinedAt: "2023-06-15",
  },
  tags: ["Modern", "Dark Mode", "Responsive", "TypeScript", "React", "Figma"],
  features: [
    "100+ UI Components",
    "50+ Screen Templates",
    "Dark & Light Modes",
    "Fully Responsive",
    "Figma Source Files",
    "React Components",
    "TypeScript Support",
    "Complete Documentation",
  ],
  files: [
    { name: "figma-source.fig", size: "15.2 MB", type: "Figma" },
    { name: "react-components.zip", size: "8.4 MB", type: "Code" },
    { name: "documentation.pdf", size: "2.1 MB", type: "PDF" },
  ],
  license: "Standard License",
  support: "6 months support included",
}

interface ProductDetailProps {
  productId: string
}

export function ProductDetail({ productId }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [isFavorited, setIsFavorited] = useState(false)
  const [quantity, setQuantity] = useState(1)

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <FadeIn>
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Link href="/marketplace" className="flex items-center gap-2 hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Marketplace
          </Link>
          <span>/</span>
          <span className="capitalize">{product.category}</span>
          <span>/</span>
          <span className="text-foreground">{product.title}</span>
        </nav>
      </FadeIn>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image Gallery */}
        <FadeIn>
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative overflow-hidden rounded-lg glass-card">
              <Image
                src={product.images[selectedImage]}
                alt={product.title}
                width={800}
                height={600}
                className="aspect-[4/3] w-full object-cover"
              />
              
              {/* Image Navigation */}
              <div className="absolute inset-0 flex items-center justify-between p-4">
                <Button
                  size="icon"
                  variant="secondary"
                  className="glass-card"
                  onClick={() => setSelectedImage(prev => prev === 0 ? product.images.length - 1 : prev - 1)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  className="glass-card"
                  onClick={() => setSelectedImage(prev => prev === product.images.length - 1 ? 0 : prev + 1)}
                >
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </Button>
              </div>
            </div>

            {/* Thumbnail Gallery */}
            <div className="flex gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative overflow-hidden rounded-md border-2 transition-all ${
                    selectedImage === index
                      ? "border-brand-500 shadow-lg"
                      : "border-transparent hover:border-border"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.title} ${index + 1}`}
                    width={100}
                    height={75}
                    className="aspect-[4/3] w-20 object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Product Info */}
        <FadeIn delay={0.1}>
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Badge variant="secondary">{product.category}</Badge>
                {product.seller.verified && (
                  <Badge variant="outline" className="gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold">{product.title}</h1>
              <p className="mt-2 text-muted-foreground">{product.description}</p>
            </div>

            {/* Rating & Stats */}
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{product.rating}</span>
                <span className="text-muted-foreground">({product.ratingCount} reviews)</span>
              </div>
              <div className="flex items-center gap-1">
                <Download className="h-4 w-4" />
                <span>{product.downloads} downloads</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{product.views} views</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold">
                {product.price} {product.currency}
              </div>
              <div className="text-sm text-muted-foreground">
                ≈ $85.60 USD
              </div>
            </div>

            {/* Tags */}
            <div>
              <p className="mb-2 text-sm font-medium">Tags:</p>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-accent">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <div className="flex gap-4">
                <Button size="lg" className="flex-1 bg-gradient-to-r from-brand-500 to-purple-500 hover:from-brand-600 hover:to-purple-600">
                  <Zap className="mr-2 h-4 w-4" />
                  Buy Now
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setIsFavorited(!isFavorited)}
                  className={isFavorited ? "text-red-500 border-red-200" : ""}
                >
                  <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
                </Button>
                <Button size="lg" variant="outline">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-green-500" />
                <span>Secure payment with sBTC</span>
              </div>
            </div>

            {/* Seller Info */}
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={product.seller.avatar} />
                    <AvatarFallback>{product.seller.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{product.seller.name}</h3>
                      {product.seller.verified && (
                        <Crown className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{product.seller.username}</p>
                    <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                      <span>⭐ {product.seller.rating} rating</span>
                      <span>📦 {product.seller.sales} sales</span>
                      <span>👥 {product.seller.followers} followers</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Follow
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </FadeIn>
      </div>

      {/* Product Details Tabs */}
      <FadeIn delay={0.2}>
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-4 glass-card">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="license">License</TabsTrigger>
          </TabsList>
          
          <TabsContent value="description" className="mt-6">
            <Card className="glass-card">
              <CardContent className="p-6 prose prose-sm max-w-none dark:prose-invert">
                <div
                  dangerouslySetInnerHTML={{
                    __html: product.longDescription.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\n/g, '<br />')
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="features" className="mt-6">
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="grid gap-3 sm:grid-cols-2">
                  {product.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="files" className="mt-6">
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {product.files.map((file) => (
                    <div key={file.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-muted-foreground">{file.type} • {file.size}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="license" className="mt-6">
            <Card className="glass-card">
              <CardContent className="p-6">
                <h3 className="mb-4 text-lg font-semibold">{product.license}</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Use in unlimited personal and commercial projects</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Modify and customize to fit your needs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>No attribution required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>{product.support}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </FadeIn>
    </div>
  )
}
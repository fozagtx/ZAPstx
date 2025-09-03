"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp,
  Eye,
  Download,
  DollarSign,
  ArrowUpRight,
  Star,
  MoreHorizontal,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"

const topProducts = [
  {
    id: "1",
    name: "Premium Dashboard UI Kit",
    category: "Design",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=80&h=60&fit=crop",
    price: "0.035",
    currency: "sBTC",
    sales: 89,
    revenue: "3.115",
    views: 2340,
    downloads: 89,
    rating: 4.9,
    change: "+12%",
    changeType: "positive" as const,
    progress: 85,
  },
  {
    id: "2", 
    name: "React Component Library",
    category: "Development",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=80&h=60&fit=crop",
    price: "0.028",
    currency: "sBTC",
    sales: 67,
    revenue: "1.876",
    views: 1890,
    downloads: 67,
    rating: 4.8,
    change: "+8%",
    changeType: "positive" as const,
    progress: 67,
  },
  {
    id: "3",
    name: "Marketing Templates Pack",
    category: "Marketing", 
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=80&h=60&fit=crop",
    price: "0.015",
    currency: "sBTC",
    sales: 124,
    revenue: "1.860",
    views: 3200,
    downloads: 124,
    rating: 4.7,
    change: "+15%",
    changeType: "positive" as const,
    progress: 92,
  },
  {
    id: "4",
    name: "Icon Pack Pro",
    category: "Design",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80&h=60&fit=crop",
    price: "0.018",
    currency: "sBTC",
    sales: 98,
    revenue: "1.764",
    views: 2580,
    downloads: 98,
    rating: 4.6,
    change: "+5%",
    changeType: "positive" as const,
    progress: 78,
  },
  {
    id: "5",
    name: "Landing Page Templates",
    category: "Business",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=80&h=60&fit=crop",
    price: "0.025",
    currency: "sBTC",
    sales: 45,
    revenue: "1.125",
    views: 1450,
    downloads: 45,
    rating: 4.8,
    change: "-2%",
    changeType: "negative" as const,
    progress: 45,
  },
]

export function TopProducts() {
  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Products
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Your best performing products this month
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/products">
              View All
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Products List */}
        <div className="space-y-4">
          {topProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-brand-500 to-purple-500 text-sm font-bold text-white">
                  {index + 1}
                </div>

                {/* Product Image */}
                <Image
                  src={product.image}
                  alt={product.name}
                  width={60}
                  height={45}
                  className="rounded-lg object-cover"
                />

                {/* Product Info */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium group-hover:text-brand-500 transition-colors">
                      {product.name}
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {product.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {product.rating}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {product.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      {product.downloads}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Revenue */}
                <div className="text-right">
                  <p className="font-semibold">
                    {product.revenue} {product.currency}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {product.sales} sales
                  </p>
                </div>

                {/* Change */}
                <Badge 
                  variant={product.changeType === "positive" ? "default" : "destructive"}
                  className="gap-1 text-xs"
                >
                  <TrendingUp className={`h-3 w-3 ${
                    product.changeType === "negative" ? "rotate-180" : ""
                  }`} />
                  {product.change}
                </Badge>

                {/* Actions */}
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Performance Overview */}
        <div className="space-y-4 border-t pt-6">
          <h4 className="font-semibold">Performance Overview</h4>
          
          {topProducts.slice(0, 3).map((product, index) => (
            <div key={`progress-${product.id}`} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{product.name}</span>
                <span className="text-muted-foreground">
                  {product.sales} / {Math.round(product.sales * 1.2)} target
                </span>
              </div>
              <Progress value={product.progress} className="h-2" />
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 sm:grid-cols-2 border-t pt-6">
          <div className="space-y-1">
            <p className="text-2xl font-bold flex items-center gap-1">
              <DollarSign className="h-5 w-5" />
              8.74 sBTC
            </p>
            <p className="text-sm text-muted-foreground">
              Total Revenue from Top 5
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold flex items-center gap-1">
              <Download className="h-5 w-5" />
              423
            </p>
            <p className="text-sm text-muted-foreground">
              Total Downloads
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
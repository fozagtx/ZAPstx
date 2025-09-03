"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, ArrowRight, Sparkles, TrendingUp, Users } from "lucide-react"
import { FadeIn, StaggerChildren } from "@/components/animations/page-transition"
import Link from "next/link"

const stats = [
  { label: "Digital Products", value: "10K+", icon: Sparkles },
  { label: "Active Sellers", value: "2.5K+", icon: Users },
  { label: "Total Sales", value: "$1.2M+", icon: TrendingUp },
]

const categories = [
  "Design", "Development", "Marketing", "Business", "Photography", "Audio", "Video", "3D"
]

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-purple-50 to-blue-50 dark:from-brand-950/20 dark:via-purple-950/20 dark:to-blue-950/20" />
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              "radial-gradient(circle at 20% 80%, rgb(249, 115, 22) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 20%, rgb(168, 85, 247) 0%, transparent 50%)",
              "radial-gradient(circle at 40% 40%, rgb(59, 130, 246) 0%, transparent 50%)",
            ],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
        
        {/* Floating Elements */}
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-2 w-2 rounded-full bg-gradient-to-r from-brand-400 to-purple-400"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </div>

      <div className="container">
        <StaggerChildren className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <FadeIn>
            <Badge
              variant="secondary"
              className="mb-6 px-4 py-2 text-sm glass-card border-brand-200 dark:border-brand-800"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Now live on sBTC testnet!
            </Badge>
          </FadeIn>

          {/* Heading */}
          <FadeIn delay={0.1}>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              The Future of{" "}
              <span className="gradient-text">
                Digital Commerce
              </span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="mb-8 text-xl text-muted-foreground sm:text-2xl">
              Buy and sell digital products with sBTC. The first marketplace built on Bitcoin's most secure L2.
            </p>
          </FadeIn>

          {/* Search Bar */}
          <FadeIn delay={0.3}>
            <div className="mx-auto mb-12 max-w-2xl">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search for digital products..."
                    className="h-12 pl-10 glass-card border-brand-200 dark:border-brand-800"
                  />
                </div>
                <Button size="lg" className="h-12 bg-gradient-to-r from-brand-500 to-purple-500 hover:from-brand-600 hover:to-purple-600">
                  Search
                </Button>
              </div>
            </div>
          </FadeIn>

          {/* CTA Buttons */}
          <FadeIn delay={0.4}>
            <div className="mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="bg-gradient-to-r from-brand-500 to-purple-500 hover:from-brand-600 hover:to-purple-600 h-12 px-8"
                asChild
              >
                <Link href="/marketplace">
                  Explore Marketplace
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 glass-card" asChild>
                <Link href="/dashboard/products/new">
                  Start Selling
                </Link>
              </Button>
            </div>
          </FadeIn>

          {/* Categories */}
          <FadeIn delay={0.5}>
            <div className="mb-16">
              <p className="mb-4 text-sm font-medium text-muted-foreground">Popular Categories</p>
              <div className="flex flex-wrap justify-center gap-2">
                {categories.map((category) => (
                  <Badge
                    key={category}
                    variant="secondary"
                    className="cursor-pointer glass-card hover:bg-brand-100 dark:hover:bg-brand-900/50 transition-colors"
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Stats */}
          <FadeIn delay={0.6}>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="glass-card rounded-2xl p-6 floating-card"
                  whileHover={{ y: -5 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <div className="mb-2 flex justify-center">
                    <stat.icon className="h-8 w-8 text-brand-500" />
                  </div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </FadeIn>
        </StaggerChildren>
      </div>
    </section>
  )
}
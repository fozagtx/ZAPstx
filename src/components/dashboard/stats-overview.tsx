"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Users, 
  Eye,
  Download,
  ShoppingCart
} from "lucide-react"
import { FadeIn, StaggerChildren } from "@/components/animations/page-transition"

const stats = [
  {
    title: "Total Revenue",
    value: "2.4567 sBTC",
    usdValue: "$112,450",
    change: "+12.3%",
    changeType: "positive" as const,
    icon: DollarSign,
    description: "Last 30 days",
  },
  {
    title: "Total Sales",
    value: "1,247",
    change: "+8.1%",
    changeType: "positive" as const,
    icon: ShoppingCart,
    description: "Orders completed",
  },
  {
    title: "Active Products",
    value: "89",
    change: "+3",
    changeType: "positive" as const,
    icon: Package,
    description: "Currently published",
  },
  {
    title: "Total Customers",
    value: "3,204",
    change: "+23.4%",
    changeType: "positive" as const,
    icon: Users,
    description: "Unique buyers",
  },
  {
    title: "Page Views",
    value: "45,231",
    change: "-2.1%",
    changeType: "negative" as const,
    icon: Eye,
    description: "This month",
  },
  {
    title: "Downloads",
    value: "8,942",
    change: "+15.7%",
    changeType: "positive" as const,
    icon: Download,
    description: "Total downloads",
  },
]

export function StatsOverview() {
  return (
    <section>
      <StaggerChildren className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            variants={{
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card className="glass-card floating-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg ${
                    stat.changeType === "positive" 
                      ? "bg-green-100 dark:bg-green-900/20" 
                      : "bg-red-100 dark:bg-red-900/20"
                  }`}>
                    <stat.icon className={`h-4 w-4 ${
                      stat.changeType === "positive" 
                        ? "text-green-600 dark:text-green-400" 
                        : "text-red-600 dark:text-red-400"
                    }`} />
                  </div>
                  <Badge 
                    variant={stat.changeType === "positive" ? "default" : "destructive"}
                    className="gap-1 text-xs"
                  >
                    {stat.changeType === "positive" ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {stat.change}
                  </Badge>
                </div>
                
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  {stat.usdValue && (
                    <p className="text-sm text-muted-foreground">{stat.usdValue}</p>
                  )}
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </StaggerChildren>
    </section>
  )
}
"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  LayoutDashboard,
  Package,
  CreditCard,
  BarChart3,
  Users,
  Settings,
  Plus,
  Wallet,
  FileText,
  Bell,
  HelpCircle,
  Zap,
  TrendingUp,
} from "lucide-react"

const navigation = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Analytics",
        href: "/dashboard/analytics",
        icon: BarChart3,
        badge: "Pro",
      },
    ],
  },
  {
    title: "Products",
    items: [
      {
        title: "All Products",
        href: "/dashboard/products",
        icon: Package,
      },
      {
        title: "Add Product",
        href: "/dashboard/products/new",
        icon: Plus,
      },
    ],
  },
  {
    title: "Sales",
    items: [
      {
        title: "Payments",
        href: "/dashboard/payments",
        icon: CreditCard,
      },
      {
        title: "Payment Links",
        href: "/dashboard/payments/links",
        icon: Wallet,
      },
      {
        title: "Customers",
        href: "/dashboard/customers",
        icon: Users,
      },
    ],
  },
  {
    title: "Tools",
    items: [
      {
        title: "Widgets",
        href: "/dashboard/widgets",
        icon: Zap,
        badge: "New",
      },
      {
        title: "Reports",
        href: "/dashboard/reports",
        icon: FileText,
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        title: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
      },
      {
        title: "Notifications",
        href: "/dashboard/notifications",
        icon: Bell,
      },
      {
        title: "Help & Support",
        href: "/dashboard/help",
        icon: HelpCircle,
      },
    ],
  },
]

const quickStats = [
  {
    title: "Revenue",
    value: "2.4 sBTC",
    change: "+12%",
    icon: TrendingUp,
    color: "text-green-500",
  },
  {
    title: "Sales",
    value: "128",
    change: "+8%",
    icon: Package,
    color: "text-blue-500",
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <motion.div
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
      className="w-70 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-brand-500 to-purple-500">
              <LayoutDashboard className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Dashboard</h2>
              <p className="text-sm text-muted-foreground">Manage your store</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Quick Stats */}
        <div className="p-6">
          <h3 className="mb-4 text-sm font-medium text-muted-foreground">Quick Stats</h3>
          <div className="space-y-3">
            {quickStats.map((stat) => (
              <div
                key={stat.title}
                className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
              >
                <div className="flex items-center gap-3">
                  <stat.icon className={cn("h-4 w-4", stat.color)} />
                  <div>
                    <p className="text-sm font-medium">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.title}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {stat.change}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-6">
          <nav className="space-y-8">
            {navigation.map((section) => (
              <div key={section.title}>
                <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {section.title}
                </h3>
                <ul className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href
                    
                    return (
                      <motion.li
                        key={item.href}
                        whileHover={{ x: 2 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      >
                        <Link href={item.href}>
                          <Button
                            variant={isActive ? "secondary" : "ghost"}
                            className={cn(
                              "w-full justify-start gap-3 text-left",
                              isActive && "bg-accent text-accent-foreground shadow-sm"
                            )}
                          >
                            <item.icon className="h-4 w-4" />
                            <span className="flex-1">{item.title}</span>
                            {item.badge && (
                              <Badge
                                variant={item.badge === "Pro" ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </Button>
                        </Link>
                      </motion.li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="border-t p-6">
          <Button
            asChild
            className="w-full bg-gradient-to-r from-brand-500 to-purple-500 hover:from-brand-600 hover:to-purple-600"
          >
            <Link href="/dashboard/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
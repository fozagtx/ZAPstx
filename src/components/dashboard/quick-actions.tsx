"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Upload, 
  Link, 
  BarChart3, 
  Zap,
  FileText,
  Share,
  Settings,
  Palette,
  Code,
} from "lucide-react"
import Link from "next/link"
import { FadeIn, StaggerChildren } from "@/components/animations/page-transition"

const quickActions = [
  {
    title: "Add New Product",
    description: "Create and publish a new digital product",
    icon: Plus,
    href: "/dashboard/products/new",
    color: "from-green-500 to-emerald-500",
    featured: true,
  },
  {
    title: "Upload Files",
    description: "Bulk upload product files and assets",
    icon: Upload,
    href: "/dashboard/products/upload",
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Create Payment Link",
    description: "Generate instant payment links to share",
    icon: Link,
    href: "/dashboard/payments/create-link",
    color: "from-purple-500 to-violet-500",
  },
  {
    title: "View Analytics",
    description: "Deep dive into your sales performance",
    icon: BarChart3,
    href: "/dashboard/analytics",
    color: "from-orange-500 to-red-500",
    badge: "Pro",
  },
  {
    title: "Payment Widgets",
    description: "Embed payments on your website",
    icon: Zap,
    href: "/dashboard/widgets",
    color: "from-yellow-500 to-amber-500",
    badge: "New",
  },
  {
    title: "Generate Report",
    description: "Export sales and revenue reports",
    icon: FileText,
    href: "/dashboard/reports",
    color: "from-slate-500 to-gray-500",
  },
]

const integrations = [
  {
    name: "Figma",
    description: "Design assets",
    icon: Palette,
    status: "connected",
  },
  {
    name: "GitHub",
    description: "Code repositories",
    icon: Code,
    status: "available",
  },
  {
    name: "Share Links",
    description: "Social sharing",
    icon: Share,
    status: "connected",
  },
]

export function QuickActions() {
  return (
    <div className="space-y-8">
      {/* Quick Actions */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Quick Actions</h2>
            <p className="text-muted-foreground">Get things done faster</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/dashboard/settings">
              <Settings className="mr-2 h-4 w-4" />
              Customize
            </Link>
          </Button>
        </div>

        <StaggerChildren className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              variants={{
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Link href={action.href}>
                <Card className={`glass-card floating-card cursor-pointer group ${
                  action.featured ? 'ring-2 ring-brand-500/20' : ''
                }`}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Icon and Badge */}
                      <div className="flex items-center justify-between">
                        <div className={`p-3 rounded-xl bg-gradient-to-r ${action.color} shadow-lg`}>
                          <action.icon className="h-6 w-6 text-white" />
                        </div>
                        {action.badge && (
                          <Badge 
                            variant={action.badge === "New" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {action.badge}
                          </Badge>
                        )}
                        {action.featured && (
                          <Badge className="text-xs bg-gradient-to-r from-brand-500 to-purple-500">
                            Featured
                          </Badge>
                        )}
                      </div>

                      {/* Content */}
                      <div className="space-y-2">
                        <h3 className="font-semibold group-hover:text-brand-500 transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </StaggerChildren>
      </section>

      {/* Integrations */}
      <section>
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Integrations</h2>
          <p className="text-muted-foreground">Connected tools and services</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {integrations.map((integration, index) => (
            <FadeIn key={integration.name} delay={index * 0.1}>
              <Card className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <integration.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-medium">{integration.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {integration.description}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={integration.status === "connected" ? "default" : "outline"}
                      className="text-xs"
                    >
                      {integration.status === "connected" ? "Connected" : "Connect"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </section>
    </div>
  )
}
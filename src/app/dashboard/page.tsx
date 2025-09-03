import { PageTransition } from "@/components/animations/page-transition"
import { StatsOverview } from "@/components/dashboard/stats-overview"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { TopProducts } from "@/components/dashboard/top-products"
import { QuickActions } from "@/components/dashboard/quick-actions"

export default function DashboardPage() {
  return (
    <PageTransition className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your store.
        </p>
      </div>

      {/* Stats Overview */}
      <StatsOverview />

      {/* Quick Actions */}
      <QuickActions />

      {/* Charts and Data */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueChart />
        <TopProducts />
      </div>

      {/* Recent Activity */}
      <RecentTransactions />
    </PageTransition>
  )
}
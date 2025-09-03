"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts"
import { TrendingUp, Calendar, Download } from "lucide-react"

const revenueData = [
  { month: "Jan", revenue: 0.145, sales: 23, usd: 6500 },
  { month: "Feb", revenue: 0.234, sales: 45, usd: 10800 },
  { month: "Mar", revenue: 0.178, sales: 38, usd: 8200 },
  { month: "Apr", revenue: 0.289, sales: 67, usd: 13400 },
  { month: "May", revenue: 0.356, sales: 89, usd: 16800 },
  { month: "Jun", revenue: 0.412, sales: 102, usd: 19200 },
  { month: "Jul", revenue: 0.298, sales: 78, usd: 13900 },
  { month: "Aug", revenue: 0.445, sales: 124, usd: 20800 },
  { month: "Sep", revenue: 0.523, sales: 156, usd: 24600 },
  { month: "Oct", revenue: 0.489, sales: 134, usd: 22800 },
  { month: "Nov", revenue: 0.567, sales: 167, usd: 26500 },
  { month: "Dec", revenue: 0.634, sales: 189, usd: 29800 },
]

const dailyData = [
  { day: "Mon", revenue: 0.045, sales: 12 },
  { day: "Tue", revenue: 0.067, sales: 18 },
  { day: "Wed", revenue: 0.089, sales: 24 },
  { day: "Thu", revenue: 0.123, sales: 31 },
  { day: "Fri", revenue: 0.156, sales: 42 },
  { day: "Sat", revenue: 0.134, sales: 36 },
  { day: "Sun", revenue: 0.098, sales: 27 },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card rounded-lg border p-4 shadow-lg">
        <p className="font-medium">{label}</p>
        <div className="mt-2 space-y-1">
          <p className="text-sm">
            <span className="text-brand-500">Revenue: </span>
            {payload[0].value} sBTC
          </p>
          {payload[1] && (
            <p className="text-sm">
              <span className="text-purple-500">Sales: </span>
              {payload[1].value}
            </p>
          )}
        </div>
      </div>
    )
  }
  return null
}

export function RevenueChart() {
  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Revenue Analytics
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Track your earnings and sales performance
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Calendar className="h-3 w-3" />
              Last 12 months
            </Badge>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="monthly" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
          </TabsList>
          
          <TabsContent value="monthly" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <p className="text-2xl font-bold">2.4567 sBTC</p>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <Badge variant="outline" className="gap-1 text-xs">
                  <TrendingUp className="h-3 w-3" />
                  +12.3% vs last year
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold">$112,450</p>
                <p className="text-sm text-muted-foreground">USD Value</p>
                <Badge variant="outline" className="gap-1 text-xs">
                  <TrendingUp className="h-3 w-3" />
                  +8.7% vs last year
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold">1,247</p>
                <p className="text-sm text-muted-foreground">Total Sales</p>
                <Badge variant="outline" className="gap-1 text-xs">
                  <TrendingUp className="h-3 w-3" />
                  +15.2% vs last year
                </Badge>
              </div>
            </div>
            
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#f97316"
                    fillOpacity={1}
                    fill="url(#revenueGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="weekly" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <p className="text-2xl font-bold">0.712 sBTC</p>
                <p className="text-sm text-muted-foreground">This Week</p>
                <Badge variant="outline" className="gap-1 text-xs">
                  <TrendingUp className="h-3 w-3" />
                  +18.2% vs last week
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold">$32,150</p>
                <p className="text-sm text-muted-foreground">USD Value</p>
                <Badge variant="outline" className="gap-1 text-xs">
                  <TrendingUp className="h-3 w-3" />
                  +14.8% vs last week
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold">190</p>
                <p className="text-sm text-muted-foreground">Sales Count</p>
                <Badge variant="outline" className="gap-1 text-xs">
                  <TrendingUp className="h-3 w-3" />
                  +22.1% vs last week
                </Badge>
              </div>
            </div>
            
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#f97316"
                    strokeWidth={3}
                    dot={{ fill: "#f97316", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "#f97316", strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#a855f7"
                    strokeWidth={3}
                    dot={{ fill: "#a855f7", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "#a855f7", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
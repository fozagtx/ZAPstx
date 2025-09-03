"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  MoreHorizontal
} from "lucide-react"
import { formatRelativeTime } from "@/lib/utils"
import Link from "next/link"
import { motion } from "framer-motion"

const transactions = [
  {
    id: "txn_001",
    type: "purchase",
    customer: {
      name: "Sarah Johnson",
      email: "sarah@example.com",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face",
    },
    product: "Premium Dashboard UI Kit",
    amount: "0.035",
    currency: "sBTC",
    usdValue: "$85.60",
    status: "completed",
    txHash: "0x1a2b3c4d5e6f...",
    createdAt: "2024-01-20T10:30:00Z",
  },
  {
    id: "txn_002",
    type: "purchase",
    customer: {
      name: "Mike Chen",
      email: "mike@example.com", 
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    },
    product: "React Component Library",
    amount: "0.028",
    currency: "sBTC",
    usdValue: "$68.50",
    status: "pending",
    txHash: "0x2b3c4d5e6f7a...",
    createdAt: "2024-01-20T09:15:00Z",
  },
  {
    id: "txn_003",
    type: "refund",
    customer: {
      name: "Elena Rodriguez",
      email: "elena@example.com",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
    },
    product: "Marketing Templates Pack",
    amount: "0.015",
    currency: "sBTC", 
    usdValue: "$36.75",
    status: "completed",
    txHash: "0x3c4d5e6f7a8b...",
    createdAt: "2024-01-19T16:45:00Z",
  },
  {
    id: "txn_004",
    type: "purchase",
    customer: {
      name: "Alex Thompson",
      email: "alex@example.com",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face",
    },
    product: "Icon Pack Pro",
    amount: "0.018",
    currency: "sBTC",
    usdValue: "$44.10",
    status: "completed",
    txHash: "0x4d5e6f7a8b9c...",
    createdAt: "2024-01-19T14:20:00Z",
  },
  {
    id: "txn_005",
    type: "purchase",
    customer: {
      name: "Jessica Lee",
      email: "jessica@example.com",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    },
    product: "Landing Page Templates",
    amount: "0.025",
    currency: "sBTC",
    usdValue: "$61.25",
    status: "failed",
    txHash: "0x5e6f7a8b9c0d...",
    createdAt: "2024-01-19T11:30:00Z",
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "text-green-500 bg-green-100 dark:bg-green-900/20"
    case "pending":
      return "text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20"
    case "failed":
      return "text-red-500 bg-red-100 dark:bg-red-900/20"
    default:
      return "text-gray-500 bg-gray-100 dark:bg-gray-900/20"
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return CheckCircle
    case "pending":
      return Clock
    case "failed":
      return XCircle
    default:
      return Clock
  }
}

const getTransactionIcon = (type: string) => {
  switch (type) {
    case "purchase":
      return ArrowDownRight
    case "refund":
      return ArrowUpRight
    default:
      return ArrowDownRight
  }
}

export function RecentTransactions() {
  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Recent Transactions
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Latest payment activity from your customers
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/dashboard/payments">
              View All
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction, index) => {
            const StatusIcon = getStatusIcon(transaction.status)
            const TransactionIcon = getTransactionIcon(transaction.type)
            
            return (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Transaction Icon */}
                  <div className={`p-2 rounded-full ${
                    transaction.type === "refund" 
                      ? "bg-red-100 dark:bg-red-900/20" 
                      : "bg-green-100 dark:bg-green-900/20"
                  }`}>
                    <TransactionIcon className={`h-4 w-4 ${
                      transaction.type === "refund" 
                        ? "text-red-600 dark:text-red-400" 
                        : "text-green-600 dark:text-green-400"
                    }`} />
                  </div>

                  {/* Customer Info */}
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={transaction.customer.avatar} />
                    <AvatarFallback>
                      {transaction.customer.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{transaction.customer.name}</p>
                      <Badge variant="outline" className="text-xs capitalize">
                        {transaction.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {transaction.product}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(transaction.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Amount */}
                  <div className="text-right">
                    <p className="font-semibold">
                      {transaction.type === "refund" ? "-" : "+"}{transaction.amount} {transaction.currency}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.usdValue}
                    </p>
                  </div>

                  {/* Status */}
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                    <StatusIcon className="h-3 w-3" />
                    <span className="capitalize">{transaction.status}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/payments/${transaction.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-6 pt-6 border-t">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">
                {transactions.filter(t => t.status === "completed").length}
              </p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-500">
                {transactions.filter(t => t.status === "pending").length}
              </p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">
                {transactions.filter(t => t.status === "failed").length}
              </p>
              <p className="text-sm text-muted-foreground">Failed</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Download,
  Copy,
  ExternalLink,
  ArrowLeft,
  RefreshCw,
} from "lucide-react"
import { toast } from "sonner"
import { copyToClipboard } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"

interface PaymentStatusProps {
  payment: {
    id: string
    status: 'completed' | 'failed' | 'pending' | 'expired'
    amount: string
    currency: string
    txId?: string | null
    completedAt?: string | null
    product?: {
      title: string
      image: string
    } | null
  }
}

const statusConfig = {
  completed: {
    icon: CheckCircle,
    color: "text-green-500",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    borderColor: "border-green-200 dark:border-green-800",
    title: "Payment Successful!",
    description: "Your payment has been completed and confirmed on the blockchain.",
  },
  failed: {
    icon: XCircle,
    color: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    borderColor: "border-red-200 dark:border-red-800",
    title: "Payment Failed",
    description: "Your payment could not be processed. Please try again.",
  },
  pending: {
    icon: Clock,
    color: "text-yellow-500", 
    bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
    borderColor: "border-yellow-200 dark:border-yellow-800",
    title: "Payment Pending",
    description: "Your payment is being processed on the blockchain.",
  },
  expired: {
    icon: AlertTriangle,
    color: "text-orange-500",
    bgColor: "bg-orange-50 dark:bg-orange-900/20", 
    borderColor: "border-orange-200 dark:border-orange-800",
    title: "Payment Expired",
    description: "This payment link has expired. Please create a new payment.",
  },
}

export function PaymentStatus({ payment }: PaymentStatusProps) {
  const config = statusConfig[payment.status]
  const StatusIcon = config.icon

  const handleCopyTxId = async () => {
    if (payment.txId) {
      const success = await copyToClipboard(payment.txId)
      if (success) {
        toast.success("Transaction ID copied to clipboard")
      } else {
        toast.error("Failed to copy transaction ID")
      }
    }
  }

  const getExplorerUrl = (txId: string) => {
    return `https://explorer.hiro.so/txid/${txId}?chain=testnet`
  }

  return (
    <div className="space-y-8">
      {/* Status Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className={`glass-card ${config.borderColor} ${config.bgColor}`}>
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${config.bgColor}`}>
                <StatusIcon className={`h-8 w-8 ${config.color}`} />
              </div>
            </div>

            <h1 className="text-2xl font-bold mb-2">{config.title}</h1>
            <p className="text-muted-foreground mb-6">{config.description}</p>

            {/* Payment Details */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg font-semibold">
                  {payment.amount} {payment.currency}
                </span>
                <Badge variant="outline">
                  {payment.status === 'completed' ? 'Paid' : payment.status}
                </Badge>
              </div>

              {payment.completedAt && (
                <p className="text-sm text-muted-foreground">
                  Completed on {new Date(payment.completedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}
            </div>

            {/* Product Info */}
            {payment.product && (
              <div className="mb-6 flex items-center justify-center gap-4 p-4 rounded-lg bg-muted/50">
                <Image
                  src={payment.product.image}
                  alt={payment.product.title}
                  width={48}
                  height={48}
                  className="rounded-lg object-cover"
                />
                <div className="text-left">
                  <h3 className="font-medium">{payment.product.title}</h3>
                  <p className="text-sm text-muted-foreground">Digital Product</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {payment.status === 'completed' && (
                <Button className="bg-gradient-to-r from-brand-500 to-purple-500 hover:from-brand-600 hover:to-purple-600">
                  <Download className="mr-2 h-4 w-4" />
                  Download Product
                </Button>
              )}

              {payment.status === 'failed' && (
                <Button className="bg-gradient-to-r from-brand-500 to-purple-500 hover:from-brand-600 hover:to-purple-600">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              )}

              {payment.status === 'pending' && (
                <Button variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Status
                </Button>
              )}

              <Button variant="outline" asChild>
                <Link href="/marketplace">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Marketplace
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Transaction Details */}
      {payment.txId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="glass-card">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Transaction Details</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Payment ID:</span>
                  <span className="text-sm font-mono">{payment.id}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Transaction ID:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono truncate max-w-[200px]">
                      {payment.txId}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyTxId}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Network:</span>
                  <span className="text-sm">Stacks Testnet</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Blockchain Explorer:</span>
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={getExplorerUrl(payment.txId)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Transaction
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Help Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Card className="glass-card">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Need Help?</h2>
            
            <div className="space-y-3 text-sm">
              <p>
                <strong>Payment taking too long?</strong> Blockchain transactions can take 10-20 minutes to confirm.
              </p>
              <p>
                <strong>Payment failed?</strong> Check your wallet balance and try again. Contact support if issues persist.
              </p>
              <p>
                <strong>Can't download?</strong> Make sure your payment is completed and confirmed on the blockchain.
              </p>
            </div>

            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/support">
                  Contact Support
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/help">
                  View FAQ
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
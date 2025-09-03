'use client'

import { useState, useEffect } from 'react'
import { useStacks } from '@/contexts/StacksContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Loader2, CheckCircle, AlertCircle, Wallet, QrCode } from 'lucide-react'
import { transferSBTC, monitorTransaction, formatSBTC, parseSBTC, getSBTCBalance } from '@/lib/stacks'

interface PaymentWidgetProps {
  // Required props
  recipientAddress: string
  amount: number
  title: string
  
  // Optional props
  description?: string
  currency?: string
  theme?: 'light' | 'dark' | 'auto'
  compact?: boolean
  showQR?: boolean
  onSuccess?: (txId: string) => void
  onError?: (error: string) => void
  onCancel?: () => void
  
  // Customization
  primaryColor?: string
  borderRadius?: string
  customCSS?: string
  
  // Behavior
  allowCustomAmount?: boolean
  minAmount?: number
  maxAmount?: number
}

type PaymentStatus = 'idle' | 'connecting' | 'processing' | 'confirming' | 'completed' | 'failed'

export function PaymentWidget({
  recipientAddress,
  amount,
  title,
  description,
  currency = 'SBTC',
  theme = 'auto',
  compact = false,
  showQR = false,
  onSuccess,
  onError,
  onCancel,
  primaryColor = '#f97316',
  borderRadius = '0.5rem',
  customCSS,
  allowCustomAmount = false,
  minAmount,
  maxAmount,
}: PaymentWidgetProps) {
  const { isConnected, userAddress, connect } = useStacks()
  const { toast } = useToast()
  
  const [status, setStatus] = useState<PaymentStatus>('idle')
  const [txId, setTxId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [customAmount, setCustomAmount] = useState(amount)
  const [userBalance, setUserBalance] = useState<number>(0)

  // Load user balance when connected
  useEffect(() => {
    if (isConnected && userAddress) {
      getSBTCBalance(userAddress).then(setUserBalance).catch(console.error)
    }
  }, [isConnected, userAddress])

  const finalAmount = allowCustomAmount ? customAmount : amount
  const finalAmountInSatoshis = parseSBTC(finalAmount.toString())

  const handleConnect = async () => {
    setStatus('connecting')
    try {
      await connect()
    } catch (error) {
      setError('Failed to connect wallet')
      setStatus('idle')
      onError?.('Failed to connect wallet')
    }
  }

  const handlePayment = async () => {
    if (!userAddress || !isConnected) {
      await handleConnect()
      return
    }

    // Validate amount
    if (minAmount && finalAmount < minAmount) {
      setError(`Minimum amount is ${minAmount} ${currency}`)
      return
    }
    
    if (maxAmount && finalAmount > maxAmount) {
      setError(`Maximum amount is ${maxAmount} ${currency}`)
      return
    }

    // Check balance
    const balanceInBTC = userBalance / 100000000
    if (balanceInBTC < finalAmount) {
      setError(`Insufficient balance. You have ${balanceInBTC.toFixed(8)} ${currency}`)
      return
    }

    setStatus('processing')
    setError(null)
    
    try {
      await transferSBTC({
        recipientAddress,
        amount: finalAmountInSatoshis,
        memo: `ZapX: ${title}`,
        onFinish: async (data) => {
          const transactionId = data.txId
          setTxId(transactionId)
          setStatus('confirming')
          
          try {
            // Monitor transaction for confirmations
            await monitorTransaction(
              transactionId,
              (txStatus) => {
                console.log('Transaction update:', txStatus)
              },
              1
            )
            
            setStatus('completed')
            toast({
              title: 'Payment successful!',
              description: `Your payment of ${finalAmount} ${currency} has been confirmed.`,
            })
            
            onSuccess?.(transactionId)
            
          } catch (monitorError) {
            console.error('Transaction monitoring failed:', monitorError)
            // Still consider it successful if transaction was submitted
            setStatus('completed')
            onSuccess?.(transactionId)
          }
        },
        onCancel: () => {
          setStatus('idle')
          setError('Payment cancelled')
          onCancel?.()
        },
      })
      
    } catch (error) {
      console.error('Payment error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Payment failed'
      setError(errorMessage)
      setStatus('failed')
      onError?.(errorMessage)
    }
  }

  const handleRetry = () => {
    setStatus('idle')
    setError(null)
    setTxId(null)
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'connecting':
      case 'processing':
      case 'confirming':
        return <Loader2 className="h-4 w-4 animate-spin" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Wallet className="h-4 w-4" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'connecting':
        return 'Connecting wallet...'
      case 'processing':
        return 'Processing payment...'
      case 'confirming':
        return 'Confirming transaction...'
      case 'completed':
        return 'Payment completed!'
      case 'failed':
        return 'Payment failed'
      default:
        return isConnected ? 'Ready to pay' : 'Connect wallet'
    }
  }

  const isLoading = ['connecting', 'processing', 'confirming'].includes(status)
  const isCompleted = status === 'completed'
  const canPay = isConnected && !isLoading && !isCompleted

  return (
    <Card 
      className={`${compact ? 'w-80' : 'w-full max-w-md'} mx-auto`}
      style={{ 
        borderRadius,
        ...(customCSS ? {} : {})
      }}
    >
      {customCSS && <style>{customCSS}</style>}
      
      <CardHeader className={compact ? 'p-4 pb-2' : ''}>
        <CardTitle className="flex items-center gap-2 text-lg">
          {getStatusIcon()}
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-sm">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent className={`space-y-4 ${compact ? 'p-4 pt-2' : ''}`}>
        {/* Amount Display/Input */}
        <div className="text-center">
          {allowCustomAmount ? (
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ({currency})</Label>
              <Input
                id="amount"
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(parseFloat(e.target.value) || 0)}
                disabled={isLoading || isCompleted}
                step="0.00000001"
                min={minAmount}
                max={maxAmount}
              />
            </div>
          ) : (
            <div className="text-2xl font-bold" style={{ color: primaryColor }}>
              {finalAmount} {currency}
            </div>
          )}
        </div>

        {/* Recipient Info */}
        {!compact && (
          <div className="text-center text-sm text-muted-foreground">
            <div>To: {recipientAddress.slice(0, 8)}...{recipientAddress.slice(-8)}</div>
          </div>
        )}

        {/* Balance Info */}
        {isConnected && userBalance > 0 && (
          <div className="text-center text-sm text-muted-foreground">
            Balance: {formatSBTC(userBalance)} {currency}
          </div>
        )}

        {/* Status Badge */}
        <div className="flex justify-center">
          <Badge 
            variant={
              status === 'completed' ? 'default' : 
              status === 'failed' ? 'destructive' : 
              'secondary'
            }
          >
            {getStatusText()}
          </Badge>
        </div>

        {/* Transaction ID */}
        {txId && (
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Transaction ID</div>
            <code className="text-xs bg-muted px-2 py-1 rounded block">
              {txId.slice(0, 12)}...{txId.slice(-12)}
            </code>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="text-center text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          {!isConnected ? (
            <Button 
              onClick={handleConnect}
              disabled={isLoading}
              className="w-full"
              style={{ backgroundColor: primaryColor }}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Connect Wallet
            </Button>
          ) : (
            <>
              {!isCompleted && (
                <Button 
                  onClick={handlePayment}
                  disabled={!canPay || finalAmount <= 0}
                  className="w-full"
                  style={{ backgroundColor: primaryColor }}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Pay {finalAmount} {currency}
                </Button>
              )}
              
              {status === 'failed' && (
                <Button 
                  onClick={handleRetry}
                  variant="outline"
                  className="w-full"
                >
                  Try Again
                </Button>
              )}
            </>
          )}
        </div>

        {/* QR Code Option */}
        {showQR && !compact && (
          <div className="text-center">
            <Button variant="ghost" size="sm">
              <QrCode className="h-4 w-4 mr-2" />
              Show QR Code
            </Button>
          </div>
        )}

        {/* Testnet Badge */}
        {!compact && (
          <div className="text-center">
            <Badge variant="outline" className="text-xs">
              Stacks Testnet
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Widget factory function for easy embedding
export const createPaymentWidget = (containerId: string, props: PaymentWidgetProps) => {
  if (typeof window === 'undefined') return

  const container = document.getElementById(containerId)
  if (!container) {
    console.error(`Container with id "${containerId}" not found`)
    return
  }

  // This would typically use a React renderer in a real implementation
  console.log('Payment widget would be rendered here with props:', props)
}

// Widget configuration builder
export class PaymentWidgetBuilder {
  private config: Partial<PaymentWidgetProps> = {}

  recipient(address: string) {
    this.config.recipientAddress = address
    return this
  }

  amount(value: number) {
    this.config.amount = value
    return this
  }

  title(text: string) {
    this.config.title = text
    return this
  }

  description(text: string) {
    this.config.description = text
    return this
  }

  theme(mode: 'light' | 'dark' | 'auto') {
    this.config.theme = mode
    return this
  }

  compact(enabled = true) {
    this.config.compact = enabled
    return this
  }

  allowCustomAmount(enabled = true, min?: number, max?: number) {
    this.config.allowCustomAmount = enabled
    if (min !== undefined) this.config.minAmount = min
    if (max !== undefined) this.config.maxAmount = max
    return this
  }

  primaryColor(color: string) {
    this.config.primaryColor = color
    return this
  }

  onSuccess(callback: (txId: string) => void) {
    this.config.onSuccess = callback
    return this
  }

  onError(callback: (error: string) => void) {
    this.config.onError = callback
    return this
  }

  build(): PaymentWidgetProps {
    if (!this.config.recipientAddress) {
      throw new Error('Recipient address is required')
    }
    if (!this.config.amount) {
      throw new Error('Amount is required')
    }
    if (!this.config.title) {
      throw new Error('Title is required')
    }

    return this.config as PaymentWidgetProps
  }
}
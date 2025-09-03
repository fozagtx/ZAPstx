'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { useStacks } from '@/contexts/StacksContext'
import { transferSBTC, monitorTransaction, formatSBTC, parseSBTC } from '@/lib/stacks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Loader2, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react'

interface PaymentLink {
  id: string
  title: string
  description?: string
  amount: number
  currency: string
  slug: string
  user: {
    name: string
    stacksAddress: string
  }
}

export default function PaymentPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const { isConnected, userAddress, connect } = useStacks()
  const { toast } = useToast()
  
  const [paymentLink, setPaymentLink] = useState<PaymentLink | null>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'completed' | 'failed'>('idle')
  const [txId, setTxId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const isEmbed = searchParams.get('embed') === 'true'
  const slug = params.slug as string

  useEffect(() => {
    if (slug) {
      fetchPaymentLink()
    }
  }, [slug])

  const fetchPaymentLink = async () => {
    try {
      const response = await fetch(`/api/payment-links/${slug}`)
      if (response.ok) {
        const data = await response.json()
        setPaymentLink(data.paymentLink)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Payment link not found')
      }
    } catch (error) {
      console.error('Error fetching payment link:', error)
      setError('Failed to load payment link')
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!paymentLink || !userAddress) return

    setPaying(true)
    setPaymentStatus('processing')
    
    try {
      // Convert payment amount to satoshis
      const amountInSatoshis = parseSBTC(paymentLink.amount.toString())
      
      // Create the sBTC transaction
      await transferSBTC({
        recipientAddress: paymentLink.user.stacksAddress,
        amount: amountInSatoshis,
        memo: `ZapX Payment: ${paymentLink.title}`,
        onFinish: async (data) => {
          const txId = data.txId
          setTxId(txId)
          
          // Monitor transaction for confirmations
          try {
            await monitorTransaction(
              txId,
              (status) => {
                console.log('Transaction status:', status)
              },
              1 // Require 1 confirmation
            )
            
            // Submit to API after blockchain confirmation
            await submitPaymentToAPI(txId, userAddress, paymentLink.amount)
            
          } catch (monitorError) {
            console.error('Transaction monitoring failed:', monitorError)
            // Still try to submit to API
            await submitPaymentToAPI(txId, userAddress, paymentLink.amount)
          }
        },
        onCancel: () => {
          setPaying(false)
          setPaymentStatus('idle')
          toast({
            title: 'Payment cancelled',
            description: 'You cancelled the payment transaction.',
            variant: 'destructive',
          })
        },
      })
      
    } catch (error) {
      console.error('Payment initiation error:', error)
      setError('Failed to initiate payment. Please try again.')
      setPaymentStatus('failed')
      setPaying(false)
    }
  }
  
  const submitPaymentToAPI = async (txId: string, payerAddress: string, amount: number) => {
    try {
      const response = await fetch(`/api/payment-links/${slug}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          txId,
          payerAddress,
          amount,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setPaymentStatus('completed')
        setPaying(false)
        toast({
          title: 'Payment successful!',
          description: 'Your payment has been confirmed on the blockchain.',
        })

        // Redirect to success URL if provided
        if (data.payment.successUrl) {
          setTimeout(() => {
            window.open(data.payment.successUrl, '_blank')
          }, 2000)
        }
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Payment verification failed')
        setPaymentStatus('failed')
        setPaying(false)
      }
    } catch (apiError) {
      console.error('API submission error:', apiError)
      setError('Payment processing failed. Please contact support.')
      setPaymentStatus('failed')
      setPaying(false)
    }
  }

  if (loading) {
    return (
      <div className={`${isEmbed ? 'p-4' : 'min-h-screen'} flex items-center justify-center`}>
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className={`${isEmbed ? 'p-4' : 'min-h-screen'} flex items-center justify-center`}>
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error</h3>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!paymentLink) {
    return (
      <div className={`${isEmbed ? 'p-4' : 'min-h-screen'} flex items-center justify-center`}>
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Payment link not found</h3>
            <p className="text-muted-foreground">This payment link may have expired or been removed.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`${isEmbed ? 'p-2' : 'min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4'}`}>
      <div className={`${isEmbed ? '' : 'container mx-auto py-16'}`}>
        <div className={`${isEmbed ? '' : 'max-w-md'} mx-auto`}>
          <Card className="w-full">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                {paymentStatus === 'completed' ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-orange-500 to-red-600" />
                )}
                {paymentLink.title}
              </CardTitle>
              {paymentLink.description && (
                <CardDescription className="mt-2">
                  {paymentLink.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payment Details */}
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">
                  {paymentLink.amount} {paymentLink.currency}
                </div>
                <div className="text-sm text-muted-foreground">
                  To: {paymentLink.user.name}
                </div>
                <div className="text-xs text-muted-foreground font-mono mt-1 break-all">
                  {paymentLink.user.stacksAddress.slice(0, 8)}...{paymentLink.user.stacksAddress.slice(-8)}
                </div>
              </div>

              {/* Payment Status */}
              {paymentStatus !== 'idle' && (
                <div className="text-center">
                  <Badge 
                    variant={paymentStatus === 'completed' ? 'default' : 
                            paymentStatus === 'failed' ? 'destructive' : 'secondary'}
                    className="mb-2"
                  >
                    {paymentStatus === 'processing' && 'Processing...'}
                    {paymentStatus === 'completed' && 'Payment Successful'}
                    {paymentStatus === 'failed' && 'Payment Failed'}
                  </Badge>
                  
                  {txId && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground mb-2">Transaction ID:</p>
                      <div className="flex items-center justify-center gap-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {txId.slice(0, 8)}...{txId.slice(-8)}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`https://explorer.stacks.co/txid/${txId}?chain=testnet`, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Payment Button */}
              {paymentStatus === 'idle' && (
                <div>
                  {!isConnected ? (
                    <div className="text-center space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Connect your Stacks wallet to make a payment
                      </p>
                      <Button onClick={connect} className="w-full">
                        Connect Wallet
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      onClick={handlePayment} 
                      disabled={paying}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                    >
                      {paying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Pay {paymentLink.amount} {paymentLink.currency}
                    </Button>
                  )}
                </div>
              )}

              {/* Error Display */}
              {error && paymentStatus === 'failed' && (
                <div className="text-center">
                  <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setError(null)
                      setPaymentStatus('idle')
                    }}
                  >
                    Try Again
                  </Button>
                </div>
              )}

              {/* Testnet Notice */}
              {!isEmbed && (
                <div className="text-center">
                  <Badge variant="outline" className="text-xs">
                    Stacks Testnet
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
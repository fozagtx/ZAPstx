"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  ShieldCheck, 
  Wallet, 
  CreditCard, 
  ArrowRight, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Bitcoin
} from "lucide-react"
import { 
  createPayment, 
  formatSBTC, 
  convertSBTCToUSD,
  getSBTCBalance
} from "@/lib/stacks"
import { useConnect } from "@stacks/connect-react"
import { toast } from "sonner"
import Image from "next/image"

interface PaymentFormProps {
  product: {
    id: string
    title: string
    price: string
    currency: string
    image: string
    seller: {
      name: string
      address: string
    }
  }
  onPaymentComplete?: (paymentId: string) => void
}

type PaymentStep = 'wallet' | 'review' | 'processing' | 'complete'

export function PaymentForm({ product, onPaymentComplete }: PaymentFormProps) {
  const [currentStep, setCurrentStep] = useState<PaymentStep>('wallet')
  const [isConnected, setIsConnected] = useState(false)
  const [userAddress, setUserAddress] = useState<string>("")
  const [sbtcBalance, setSbtcBalance] = useState<number>(0)
  const [usdPrice, setUsdPrice] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false)
  const [paymentId, setPaymentId] = useState<string>("")

  const { authenticate, authOptions, userSession } = useConnect()

  // Check if user is already authenticated
  useEffect(() => {
    if (userSession?.isUserSignedIn()) {
      const userData = userSession.loadUserData()
      setUserAddress(userData.profile.stxAddress.testnet)
      setIsConnected(true)
      setCurrentStep('review')
      loadUserBalance(userData.profile.stxAddress.testnet)
    }
  }, [userSession])

  // Convert price to USD
  useEffect(() => {
    const fetchUSDPrice = async () => {
      try {
        const usd = await convertSBTCToUSD(parseFloat(product.price))
        setUsdPrice(usd)
      } catch (error) {
        console.error('Error converting price:', error)
      }
    }
    fetchUSDPrice()
  }, [product.price])

  const loadUserBalance = async (address: string) => {
    try {
      const balance = await getSBTCBalance(address)
      setSbtcBalance(balance)
    } catch (error) {
      console.error('Error loading balance:', error)
    }
  }

  const connectWallet = async () => {
    setIsLoading(true)
    try {
      authenticate()
    } catch (error) {
      console.error('Error connecting wallet:', error)
      toast.error('Failed to connect wallet')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!userAddress) {
      toast.error('Please connect your wallet first')
      return
    }

    setIsLoading(true)
    setCurrentStep('processing')

    try {
      await createPayment({
        recipientAddress: product.seller.address,
        amount: Math.round(parseFloat(product.price) * 100000000), // Convert to satoshis
        productId: product.id,
        buyerAddress: userAddress,
        onFinish: (data) => {
          console.log('Payment transaction broadcast:', data)
          setPaymentId(data.txId)
          setCurrentStep('complete')
          setIsLoading(false)
          onPaymentComplete?.(data.txId)
          toast.success('Payment submitted successfully!')
        },
        onCancel: () => {
          setCurrentStep('review')
          setIsLoading(false)
          toast.error('Payment cancelled')
        }
      })
    } catch (error) {
      console.error('Payment error:', error)
      setCurrentStep('review')
      setIsLoading(false)
      toast.error('Payment failed. Please try again.')
    }
  }

  const steps = [
    { key: 'wallet', title: 'Connect Wallet', completed: isConnected },
    { key: 'review', title: 'Review & Pay', completed: currentStep === 'complete' },
    { key: 'processing', title: 'Processing', completed: currentStep === 'complete' },
    { key: 'complete', title: 'Complete', completed: currentStep === 'complete' },
  ]

  const currentStepIndex = steps.findIndex(step => step.key === currentStep)

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="mb-6 flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.key} className="flex items-center">
                <div className={`
                  flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium
                  ${step.completed 
                    ? 'border-green-500 bg-green-500 text-white' 
                    : index <= currentStepIndex 
                      ? 'border-brand-500 bg-brand-500 text-white' 
                      : 'border-gray-300 text-gray-400'
                  }
                `}>
                  {step.completed ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={`ml-2 text-sm ${
                  index <= currentStepIndex ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`mx-4 h-px w-12 ${
                    index < currentStepIndex ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>

          <Progress 
            value={(currentStepIndex / (steps.length - 1)) * 100} 
            className="h-2"
          />
        </CardContent>
      </Card>

      {/* Payment Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Payment Form */}
        <div className="lg:col-span-2 space-y-6">
          {currentStep === 'wallet' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Connect Your Wallet
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-muted-foreground">
                    Connect your Stacks wallet to make secure sBTC payments
                  </p>

                  <div className="space-y-4">
                    <Button
                      size="lg"
                      onClick={connectWallet}
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-brand-500 to-purple-500 hover:from-brand-600 hover:to-purple-600"
                    >
                      {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Wallet className="mr-2 h-4 w-4" />
                      )}
                      Connect Stacks Wallet
                    </Button>

                    <div className="grid gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-green-500" />
                        <span>Secure connection with Stacks Connect</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Bitcoin className="h-4 w-4 text-orange-500" />
                        <span>Pay with sBTC on Bitcoin L2</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                        <span>No account creation required</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {currentStep === 'review' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Review Payment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Wallet Info */}
                  <div className="rounded-lg bg-muted/50 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Connected Wallet</span>
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Connected
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">
                      {userAddress}
                    </p>
                    <div className="mt-2 flex items-center gap-4 text-sm">
                      <span>sBTC Balance: {formatSBTC(sbtcBalance)}</span>
                      {sbtcBalance < parseFloat(product.price) * 100000000 && (
                        <Badge variant="destructive" className="text-xs">
                          Insufficient Balance
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Product Price</span>
                      <span className="font-medium">
                        {product.price} {product.currency}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Network Fee</span>
                      <span className="text-sm text-muted-foreground">
                        ~0.001 STX
                      </span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-lg font-semibold">
                      <span>Total</span>
                      <div className="text-right">
                        <div>{product.price} {product.currency}</div>
                        <div className="text-sm text-muted-foreground font-normal">
                          ≈ ${usdPrice.toFixed(2)} USD
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    onClick={handlePayment}
                    disabled={isLoading || sbtcBalance < parseFloat(product.price) * 100000000}
                    className="w-full bg-gradient-to-r from-brand-500 to-purple-500 hover:from-brand-600 hover:to-purple-600"
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowRight className="mr-2 h-4 w-4" />
                    )}
                    Complete Payment
                  </Button>

                  {sbtcBalance < parseFloat(product.price) * 100000000 && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <span>Insufficient sBTC balance to complete this purchase</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {currentStep === 'processing' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="glass-card">
                <CardContent className="p-6 text-center">
                  <div className="mb-4">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-brand-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Processing Payment</h3>
                  <p className="text-muted-foreground mb-4">
                    Please confirm the transaction in your wallet and wait for blockchain confirmation.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Secure sBTC transaction in progress</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {currentStep === 'complete' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="glass-card border-green-200">
                <CardContent className="p-6 text-center">
                  <div className="mb-4">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Payment Successful!</h3>
                  <p className="text-muted-foreground mb-4">
                    Your payment has been submitted to the blockchain. You'll receive download access once confirmed.
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Transaction ID:</span>
                      <span className="font-mono text-xs truncate max-w-[200px]">
                        {paymentId}
                      </span>
                    </div>
                  </div>
                  <Button className="mt-4" asChild>
                    <a href={`/purchases/${paymentId}`}>
                      View Purchase Details
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Order Summary */}
        <div>
          <Card className="glass-card sticky top-4">
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Image
                  src={product.image}
                  alt={product.title}
                  width={60}
                  height={60}
                  className="rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-medium line-clamp-2">{product.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    by {product.seller.name}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Price</span>
                  <span>{product.price} {product.currency}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>USD Value</span>
                  <span>${usdPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Network Fee</span>
                  <span>~0.001 STX</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <div className="text-right">
                  <div>{product.price} {product.currency}</div>
                  <div className="text-sm font-normal text-muted-foreground">
                    ${usdPrice.toFixed(2)} USD
                  </div>
                </div>
              </div>

              {/* Security Features */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="h-3 w-3" />
                  <span>Secured by Bitcoin</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle className="h-3 w-3" />
                  <span>Instant download access</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Bitcoin className="h-3 w-3" />
                  <span>sBTC payment</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
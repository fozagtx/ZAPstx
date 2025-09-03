"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  CreditCard,
  ShieldCheck,
  Bitcoin,
  ExternalLink,
  Copy,
  CheckCircle,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

interface PaymentWidgetProps {
  product?: {
    title: string
    price: string
    currency: string
    image?: string
    seller?: string
  }
  customization?: {
    primaryColor?: string
    borderRadius?: "none" | "small" | "medium" | "large"
    theme?: "light" | "dark" | "auto"
    showBranding?: boolean
    compactMode?: boolean
  }
  onPaymentInitiated?: (paymentId: string) => void
  onPaymentComplete?: (paymentId: string, txId: string) => void
}

export function PaymentWidget({ 
  product, 
  customization = {},
  onPaymentInitiated,
  onPaymentComplete 
}: PaymentWidgetProps) {
  const [email, setEmail] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStep, setPaymentStep] = useState<"details" | "processing" | "complete">("details")

  const {
    primaryColor = "#f97316",
    borderRadius = "medium",
    theme = "light",
    showBranding = true,
    compactMode = false,
  } = customization

  const borderRadiusClass = {
    none: "rounded-none",
    small: "rounded-sm",
    medium: "rounded-lg",
    large: "rounded-xl",
  }[borderRadius]

  const handlePayment = async () => {
    if (!email) {
      toast.error("Please enter your email address")
      return
    }

    setIsProcessing(true)
    setPaymentStep("processing")

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const paymentId = `pay_${Date.now()}`
      const txId = `0x${Math.random().toString(16).substr(2, 64)}`
      
      onPaymentInitiated?.(paymentId)
      
      // Simulate successful payment
      setTimeout(() => {
        setPaymentStep("complete")
        onPaymentComplete?.(paymentId, txId)
        toast.success("Payment completed successfully!")
      }, 2000)
      
    } catch (error) {
      toast.error("Payment failed. Please try again.")
      setPaymentStep("details")
    } finally {
      setIsProcessing(false)
    }
  }

  if (paymentStep === "processing") {
    return (
      <Card className={`w-full max-w-sm glass-card ${borderRadiusClass}`}>
        <CardContent className="p-6 text-center">
          <div className="mb-4">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-brand-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Processing Payment</h3>
          <p className="text-sm text-muted-foreground">
            Please wait while we process your sBTC payment...
          </p>
        </CardContent>
      </Card>
    )
  }

  if (paymentStep === "complete") {
    return (
      <Card className={`w-full max-w-sm glass-card border-green-200 ${borderRadiusClass}`}>
        <CardContent className="p-6 text-center">
          <div className="mb-4">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Payment Successful!</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Your payment has been completed and you'll receive access shortly.
          </p>
          {showBranding && (
            <p className="text-xs text-muted-foreground">
              Powered by sBTC Marketplace
            </p>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card 
      className={`w-full max-w-sm glass-card ${borderRadiusClass}`}
      style={{ 
        borderColor: primaryColor + "40",
        ...(theme === "dark" && { 
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          color: "white" 
        })
      }}
    >
      <CardContent className={compactMode ? "p-4" : "p-6"}>
        {/* Header */}
        {!compactMode && (
          <div className="mb-6 text-center">
            <h3 className="text-lg font-semibold mb-1">Secure Payment</h3>
            <p className="text-sm text-muted-foreground">
              Pay with sBTC on Bitcoin L2
            </p>
          </div>
        )}

        {/* Product Info */}
        {product && (
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              {product.image && (
                <Image
                  src={product.image}
                  alt={product.title}
                  width={48}
                  height={48}
                  className="rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <h4 className="font-medium text-sm">{product.title}</h4>
                {product.seller && (
                  <p className="text-xs text-muted-foreground">
                    by {product.seller}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold">
                {product.price} {product.currency}
              </span>
              <Badge variant="outline" className="text-xs">
                ≈ $124.50 USD
              </Badge>
            </div>
          </div>
        )}

        {!compactMode && <Separator className="mb-6" />}

        {/* Payment Form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="glass-card"
            />
          </div>

          <Button
            onClick={handlePayment}
            disabled={isProcessing || !email}
            className="w-full font-medium"
            style={{ 
              backgroundColor: primaryColor,
              borderColor: primaryColor,
            }}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Pay with sBTC
          </Button>
        </div>

        {/* Security Features */}
        {!compactMode && (
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-3 w-3" />
              <span>Secured by Bitcoin blockchain</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Bitcoin className="h-3 w-3" />
              <span>Instant digital delivery</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle className="h-3 w-3" />
              <span>No account required</span>
            </div>
          </div>
        )}

        {/* Branding */}
        {showBranding && (
          <div className="mt-6 pt-4 border-t text-center">
            <p className="text-xs text-muted-foreground">
              Powered by{" "}
              <a 
                href="https://sbtc-marketplace.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                sBTC Marketplace
              </a>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Widget Generator Component
export function PaymentWidgetGenerator() {
  const [widgetProps, setWidgetProps] = useState({
    product: {
      title: "Premium UI Kit",
      price: "0.025",
      currency: "sBTC",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&h=100&fit=crop",
      seller: "DesignStudio",
    },
    customization: {
      primaryColor: "#f97316",
      borderRadius: "medium" as const,
      theme: "light" as const,
      showBranding: true,
      compactMode: false,
    },
  })

  const [embedCode, setEmbedCode] = useState("")

  const generateEmbedCode = () => {
    const code = `<iframe 
  src="https://sbtc-marketplace.com/widget/embed?${new URLSearchParams({
    productId: "example-product-id",
    theme: widgetProps.customization.theme,
    primaryColor: widgetProps.customization.primaryColor,
    borderRadius: widgetProps.customization.borderRadius,
    showBranding: widgetProps.customization.showBranding.toString(),
    compactMode: widgetProps.customization.compactMode.toString(),
  }).toString()}"
  width="400"
  height="600"
  frameborder="0"
  style="border: none; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
</iframe>`
    
    setEmbedCode(code)
  }

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode)
    toast.success("Embed code copied to clipboard!")
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Payment Widget Generator</h2>
        <p className="text-muted-foreground">
          Create embeddable payment widgets for your website
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Configuration */}
        <Card className="glass-card">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Widget Configuration</h3>
            
            <div className="space-y-4">
              {/* Product Settings */}
              <div className="space-y-3">
                <h4 className="font-medium">Product Details</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={widgetProps.product.title}
                      onChange={(e) => setWidgetProps(prev => ({
                        ...prev,
                        product: { ...prev.product, title: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label>Price</Label>
                    <Input
                      value={widgetProps.product.price}
                      onChange={(e) => setWidgetProps(prev => ({
                        ...prev,
                        product: { ...prev.product, price: e.target.value }
                      }))}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Appearance Settings */}
              <div className="space-y-3">
                <h4 className="font-medium">Appearance</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label>Primary Color</Label>
                    <Input
                      type="color"
                      value={widgetProps.customization.primaryColor}
                      onChange={(e) => setWidgetProps(prev => ({
                        ...prev,
                        customization: { ...prev.customization, primaryColor: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label>Border Radius</Label>
                    <select 
                      className="w-full p-2 rounded-lg border bg-background"
                      value={widgetProps.customization.borderRadius}
                      onChange={(e) => setWidgetProps(prev => ({
                        ...prev,
                        customization: { 
                          ...prev.customization, 
                          borderRadius: e.target.value as any 
                        }
                      }))}
                    >
                      <option value="none">None</option>
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>
                </div>
              </div>

              <Button
                onClick={generateEmbedCode}
                className="w-full bg-gradient-to-r from-brand-500 to-purple-500 hover:from-brand-600 hover:to-purple-600"
              >
                Generate Embed Code
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Live Preview</h3>
            <div className="flex justify-center">
              <PaymentWidget {...widgetProps} />
            </div>
          </div>

          {/* Embed Code */}
          {embedCode && (
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">Embed Code</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyEmbedCode}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Code
                  </Button>
                </div>
                <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
                  <code>{embedCode}</code>
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
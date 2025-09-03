'use client'

import { useState } from 'react'
import { useStacks } from '@/contexts/StacksContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Copy, ExternalLink, Zap, Shield, Code, ArrowRight } from 'lucide-react'
import { FadeIn, SlideUp } from '@/components/animations/page-transition'

export default function Home() {
  const { isConnected, userAddress, connect, disconnect, isLoading } = useStacks()
  const { toast } = useToast()
  const [creating, setCreating] = useState(false)
  const [createdLink, setCreatedLink] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCreatePaymentLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userAddress) return

    setCreating(true)
    try {
      const response = await fetch('/api/payment-links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          stacksAddress: userAddress,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setCreatedLink(data.paymentLink.url)
        setFormData({ title: '', description: '', amount: '' })
        toast({
          title: 'Payment link created!',
          description: 'Your payment link has been generated successfully.',
        })
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to create payment link',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error creating payment link:', error)
      toast({
        title: 'Error',
        description: 'Failed to create payment link',
        variant: 'destructive',
      })
    } finally {
      setCreating(false)
    }
  }

  const copyToClipboard = () => {
    if (createdLink) {
      navigator.clipboard.writeText(createdLink)
      toast({
        title: 'Copied!',
        description: 'Payment link copied to clipboard',
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <FadeIn className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-sm font-medium mb-6">
              <Zap className="h-4 w-4" />
              Powered by sBTC on Stacks Testnet
            </div>
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent leading-tight">
              ZapX Payment<br />Links & Widgets
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Create secure, embeddable payment solutions powered by Bitcoin on Stacks. 
              Accept sBTC payments with beautiful, customizable widgets and shareable links.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <button 
                onClick={() => window.location.href = '/dashboard'}
                className="group px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-medium rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center gap-2"
              >
                View Dashboard
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <a 
                href="https://github.com/zapx-dev/zapx" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-8 py-4 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-all duration-300 hover:scale-105"
              >
                View on GitHub
              </a>
            </div>
          </FadeIn>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <SlideUp delay={0.2} className="text-center p-6">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
              <p className="text-muted-foreground">Create payment links in seconds with our intuitive interface</p>
            </SlideUp>
            
            <SlideUp delay={0.4} className="text-center p-6">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Secure & Trustless</h3>
              <p className="text-muted-foreground">Built on Bitcoin security with Stacks smart contracts</p>
            </SlideUp>
            
            <SlideUp delay={0.6} className="text-center p-6">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Code className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Developer Friendly</h3>
              <p className="text-muted-foreground">Embeddable widgets with customizable themes and settings</p>
            </SlideUp>
          </div>
          
          <div className="max-w-2xl mx-auto">
            {/* Wallet Connection */}
            {!isConnected ? (
              <FadeIn delay={0.8}>
                <Card className="mb-8 border-2 border-dashed border-gray-200 dark:border-gray-700">
                  <CardHeader className="text-center">
                    <CardTitle>Connect Your Stacks Wallet</CardTitle>
                    <CardDescription>
                      Connect your Stacks wallet to start creating payment links
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Button 
                      onClick={connect} 
                      disabled={isLoading}
                      size="lg"
                      className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                    >
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Connect Account
                    </Button>
                  </CardContent>
                </Card>
              </FadeIn>
          ) : (
            <>
              {/* Connected Wallet Info */}
              <FadeIn delay={0.2}>
                <Card className="mb-8 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center text-green-800 dark:text-green-200">
                      <span>Connected Wallet</span>
                      <Button variant="outline" size="sm" onClick={disconnect}>
                        Disconnect
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-green-600 dark:text-green-400 font-mono break-all bg-white dark:bg-slate-800 p-3 rounded-lg">
                      {userAddress}
                    </p>
                  </CardContent>
                </Card>
              </FadeIn>

              {/* Payment Link Creator */}
              <FadeIn delay={0.4}>
                <Card className="mb-8 shadow-lg">
                <CardHeader>
                  <CardTitle>Create Payment Link</CardTitle>
                  <CardDescription>
                    Generate a secure payment link that anyone can use to send you sBTC
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreatePaymentLink} className="space-y-6">
                    <div>
                      <Label htmlFor="title">Payment Title *</Label>
                      <Input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="e.g. Invoice #001, Product Payment"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="amount">Amount (sBTC) *</Label>
                      <Input
                        id="amount"
                        name="amount"
                        type="number"
                        step="0.00000001"
                        min="0.00000001"
                        value={formData.amount}
                        onChange={handleInputChange}
                        placeholder="0.001"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Additional details about this payment..."
                        rows={3}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      disabled={creating || !formData.title || !formData.amount}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                    >
                      {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Create Payment Link
                    </Button>
                  </form>
                </CardContent>
                </Card>
              </FadeIn>

              {/* Generated Link */}
              {createdLink && (
                <FadeIn delay={0.6}>
                  <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                  <CardHeader>
                    <CardTitle className="text-green-700 dark:text-green-300">
                      Payment Link Created!
                    </CardTitle>
                    <CardDescription>
                      Share this link to receive payments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Input 
                        value={createdLink} 
                        readOnly 
                        className="font-mono text-sm"
                      />
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={copyToClipboard}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => window.open(createdLink, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Embeddable Widget:</h4>
                      <Input 
                        value={`<iframe src="${createdLink}?embed=true" width="400" height="300" frameborder="0"></iframe>`}
                        readOnly 
                        className="font-mono text-xs"
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => {
                          const embedCode = `<iframe src="${createdLink}?embed=true" width="400" height="300" frameborder="0"></iframe>`
                          navigator.clipboard.writeText(embedCode)
                          toast({
                            title: 'Copied!',
                            description: 'Embed code copied to clipboard',
                          })
                        }}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy Embed Code
                      </Button>
                    </div>
                  </CardContent>
                  </Card>
                </FadeIn>
              )}
            </>
          )}
          </div>
        </div>
      </div>
    </div>
  )
}

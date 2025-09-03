'use client'

import { useState, useEffect } from 'react'
import { useStacks } from '@/contexts/StacksContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { 
  Loader2, 
  Copy, 
  ExternalLink, 
  Plus, 
  Edit,
  Trash2,
  BarChart3,
  Wallet,
  CreditCard,
  Code,
  Eye,
  TrendingUp,
} from 'lucide-react'
import { formatSBTC, getSBTCBalance } from '@/lib/stacks'

interface PaymentLink {
  id: string
  title: string
  description?: string
  amount: number
  currency: string
  slug: string
  active: boolean
  viewCount: number
  currentUses: number
  totalEarnings: number
  url: string
  createdAt: string
}

interface Widget {
  id: string
  name: string
  description?: string
  impressions: number
  conversions: number
  active: boolean
  embedCode: string
  createdAt: string
}

export default function Dashboard() {
  const { isConnected, userAddress, connect } = useStacks()
  const { toast } = useToast()
  
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([])
  const [widgets, setWidgets] = useState<Widget[]>([])
  const [loading, setLoading] = useState(true)
  const [balance, setBalance] = useState<number>(0)
  const [totalEarnings, setTotalEarnings] = useState<number>(0)
  const [totalPayments, setTotalPayments] = useState<number>(0)

  useEffect(() => {
    if (isConnected && userAddress) {
      loadDashboardData()
      loadBalance()
    } else {
      setLoading(false)
    }
  }, [isConnected, userAddress])

  const loadDashboardData = async () => {
    try {
      const [linksRes, widgetsRes] = await Promise.all([
        fetch(`/api/payment-links?stacksAddress=${userAddress}`),
        fetch(`/api/widgets?stacksAddress=${userAddress}`)
      ])

      if (linksRes.ok) {
        const linksData = await linksRes.json()
        setPaymentLinks(linksData.paymentLinks || [])
        
        // Calculate totals
        const total = linksData.paymentLinks?.reduce((sum: number, link: any) => 
          sum + (link.totalEarnings || 0), 0) || 0
        setTotalEarnings(total)
        
        const payments = linksData.paymentLinks?.reduce((sum: number, link: any) => 
          sum + (link._count?.payments || 0), 0) || 0
        setTotalPayments(payments)
      }

      if (widgetsRes.ok) {
        const widgetsData = await widgetsRes.json()
        setWidgets(widgetsData.widgets || [])
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const loadBalance = async () => {
    if (!userAddress) return
    
    try {
      const sbtcBalance = await getSBTCBalance(userAddress)
      setBalance(sbtcBalance)
    } catch (error) {
      console.error('Error loading balance:', error)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: 'Copied!',
      description: `${label} copied to clipboard`,
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle>Connect Your Wallet</CardTitle>
                <CardDescription>
                  Connect your Stacks wallet to access your dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button onClick={connect} size="lg">
                  <Wallet className="h-4 w-4 mr-2" />
                  Connect Wallet
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const conversionRate = widgets.reduce((sum, w) => sum + w.impressions, 0) > 0 
    ? (widgets.reduce((sum, w) => sum + w.conversions, 0) / widgets.reduce((sum, w) => sum + w.impressions, 0) * 100).toFixed(1)
    : '0.0'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your payment links and widgets
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Balance</p>
                  <p className="text-2xl font-bold">
                    {formatSBTC(balance)} SBTC
                  </p>
                </div>
                <Wallet className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                  <p className="text-2xl font-bold">
                    {totalEarnings.toFixed(8)} SBTC
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Payments</p>
                  <p className="text-2xl font-bold">{totalPayments}</p>
                </div>
                <CreditCard className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                  <p className="text-2xl font-bold">{conversionRate}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="payment-links" className="space-y-6">
          <TabsList>
            <TabsTrigger value="payment-links">Payment Links</TabsTrigger>
            <TabsTrigger value="widgets">Widgets</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Payment Links Tab */}
          <TabsContent value="payment-links" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Payment Links</h2>
              <Button asChild>
                <a href="/">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Link
                </a>
              </Button>
            </div>

            <div className="grid gap-4">
              {paymentLinks.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No payment links yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first payment link to start receiving payments
                    </p>
                    <Button asChild>
                      <a href="/">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Payment Link
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                paymentLinks.map((link) => (
                  <Card key={link.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {link.title}
                            <Badge variant={link.active ? 'default' : 'secondary'}>
                              {link.active ? 'Active' : 'Inactive'}
                            </Badge>
                          </CardTitle>
                          <CardDescription>
                            {link.description || 'No description'}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">
                            {link.amount} {link.currency}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Created {formatDate(link.createdAt)}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold">{link.viewCount}</p>
                          <p className="text-sm text-muted-foreground">Views</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">{link.currentUses}</p>
                          <p className="text-sm text-muted-foreground">Payments</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">{link.totalEarnings.toFixed(4)}</p>
                          <p className="text-sm text-muted-foreground">Earned</p>
                        </div>
                      </div>

                      <div className="flex gap-2 items-center mb-4">
                        <Input 
                          value={link.url} 
                          readOnly 
                          className="flex-1 font-mono text-sm"
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => copyToClipboard(link.url, 'Payment link')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(link.url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Widgets Tab */}
          <TabsContent value="widgets" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Payment Widgets</h2>
              <Button disabled>
                <Plus className="h-4 w-4 mr-2" />
                Create Widget (Coming Soon)
              </Button>
            </div>

            <div className="grid gap-4">
              {widgets.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Code className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No widgets yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create embeddable payment widgets for your website
                    </p>
                    <Button disabled>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Widget (Coming Soon)
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                widgets.map((widget) => (
                  <Card key={widget.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {widget.name}
                            <Badge variant={widget.active ? 'default' : 'secondary'}>
                              {widget.active ? 'Active' : 'Inactive'}
                            </Badge>
                          </CardTitle>
                          <CardDescription>
                            {widget.description || 'No description'}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            Created {formatDate(widget.createdAt)}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold">{widget.impressions}</p>
                          <p className="text-sm text-muted-foreground">Impressions</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">{widget.conversions}</p>
                          <p className="text-sm text-muted-foreground">Conversions</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">
                            {widget.impressions > 0 ? (widget.conversions / widget.impressions * 100).toFixed(1) : '0.0'}%
                          </p>
                          <p className="text-sm text-muted-foreground">Rate</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`embed-${widget.id}`}>Embed Code</Label>
                        <div className="flex gap-2">
                          <Textarea 
                            id={`embed-${widget.id}`}
                            value={widget.embedCode} 
                            readOnly 
                            className="font-mono text-xs resize-none"
                            rows={4}
                          />
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => copyToClipboard(widget.embedCode, 'Embed code')}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-semibold">Analytics</h2>
            
            <Card>
              <CardContent className="p-8 text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Advanced Analytics Coming Soon</h3>
                <p className="text-muted-foreground">
                  Detailed analytics and reporting features are in development
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
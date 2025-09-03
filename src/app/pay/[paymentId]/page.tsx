import { Navigation } from "@/components/layout/navigation"
import { PageTransition } from "@/components/animations/page-transition"
import { PaymentForm } from "@/components/payment/payment-form"
import { PaymentStatus } from "@/components/payment/payment-status"
import { prisma } from "@/lib/database"
import { notFound } from "next/navigation"

interface PaymentPageProps {
  params: {
    paymentId: string
  }
}

async function getPayment(paymentId: string) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
            seller: {
              select: {
                name: true,
                stacksAddress: true,
              },
            },
          },
        },
      },
    })

    return payment
  } catch (error) {
    console.error('Error fetching payment:', error)
    return null
  }
}

export default async function PaymentPage({ params }: PaymentPageProps) {
  const payment = await getPayment(params.paymentId)

  if (!payment) {
    notFound()
  }

  // Check if payment is expired
  const isExpired = payment.expiresAt && payment.expiresAt < new Date()

  // If payment is completed or expired, show status page
  if (payment.status === 'COMPLETED' || payment.status === 'FAILED' || isExpired) {
    return (
      <PageTransition>
        <Navigation />
        <main className="pt-16">
          <div className="container py-8">
            <PaymentStatus 
              payment={{
                id: payment.id,
                status: isExpired ? 'expired' : payment.status.toLowerCase(),
                amount: payment.amount.toString(),
                currency: payment.currency,
                txId: payment.txId,
                completedAt: payment.completedAt?.toISOString(),
                product: payment.product ? {
                  title: payment.product.title,
                  image: payment.product.imageUrl || '',
                } : null,
              }}
            />
          </div>
        </main>
      </PageTransition>
    )
  }

  // Show payment form for pending payments
  return (
    <PageTransition>
      <Navigation />
      <main className="pt-16">
        <div className="container py-8">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold">Complete Payment</h1>
              <p className="text-muted-foreground">
                Secure sBTC payment powered by Bitcoin
              </p>
            </div>

            <PaymentForm
              product={{
                id: payment.productId || '',
                title: payment.product?.title || payment.description || 'Digital Product',
                price: payment.amount.toString(),
                currency: payment.currency,
                image: payment.product?.imageUrl || '/placeholder-product.jpg',
                seller: {
                  name: payment.product?.seller?.name || 'Seller',
                  address: payment.product?.seller?.stacksAddress || '',
                },
              }}
              onPaymentComplete={(txId) => {
                // Payment completion will be handled by the smart contract callback
                console.log('Payment completed:', txId)
              }}
            />
          </div>
        </div>
      </main>
    </PageTransition>
  )
}
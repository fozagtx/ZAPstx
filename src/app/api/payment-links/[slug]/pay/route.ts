import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { transactionMonitor } from '@/lib/transaction-monitor'

const paymentSchema = z.object({
  txId: z.string().min(1, 'Transaction ID is required'),
  payerAddress: z.string().min(1, 'Payer address is required'),
  amount: z.string().transform((val) => parseFloat(val)),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  try {
    const body = await request.json()
    const validatedData = paymentSchema.parse(body)

    const paymentLink = await prisma.paymentLink.findUnique({
      where: { slug },
      include: { user: true }
    })

    if (!paymentLink) {
      return NextResponse.json(
        { error: 'Payment link not found' },
        { status: 404 }
      )
    }

    if (!paymentLink.active) {
      return NextResponse.json(
        { error: 'Payment link is inactive' },
        { status: 400 }
      )
    }

    if (paymentLink.expiresAt && paymentLink.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Payment link has expired' },
        { status: 400 }
      )
    }

    if (paymentLink.maxUses && paymentLink.currentUses >= paymentLink.maxUses) {
      return NextResponse.json(
        { error: 'Payment link has reached maximum uses' },
        { status: 400 }
      )
    }

    // Check if transaction already exists
    const existingPayment = await prisma.payment.findUnique({
      where: { txId: validatedData.txId }
    })

    if (existingPayment) {
      return NextResponse.json(
        { error: 'Transaction already processed' },
        { status: 400 }
      )
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        amount: validatedData.amount,
        netAmount: validatedData.amount * 0.97, // 3% fee
        feeAmount: validatedData.amount * 0.03,
        currency: paymentLink.currency,
        description: paymentLink.title,
        txId: validatedData.txId,
        status: 'PENDING',
        paymentLinkId: paymentLink.id,
        userId: paymentLink.userId,
        metadata: {
          payerAddress: validatedData.payerAddress,
          userAgent: request.headers.get('user-agent'),
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        }
      }
    })

    // Update payment link usage
    await prisma.paymentLink.update({
      where: { id: paymentLink.id },
      data: { currentUses: { increment: 1 } }
    })

    // Start monitoring the transaction for blockchain confirmations
    transactionMonitor.startMonitoring(validatedData.txId, payment.id)
    
    // Send webhook notification if configured
    if (paymentLink.webhookUrl) {
      try {
        await fetch(paymentLink.webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-ZapX-Signature': 'sha256=' + paymentLink.webhookSecret, // In production, implement proper HMAC
          },
          body: JSON.stringify({
            event: 'payment.created',
            payment: {
              id: payment.id,
              txId: payment.txId,
              amount: payment.amount,
              status: payment.status,
              paymentLink: {
                id: paymentLink.id,
                title: paymentLink.title,
              }
            },
            timestamp: new Date().toISOString()
          })
        })
      } catch (webhookError) {
        console.error('Webhook notification failed:', webhookError)
      }
    }

    return NextResponse.json({
      payment: {
        id: payment.id,
        amount: payment.amount,
        status: payment.status,
        txId: payment.txId,
        successUrl: paymentLink.successUrl,
        successMessage: paymentLink.successMessage,
      }
    })

  } catch (error) {
    console.error('Error processing payment:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { nanoid } from 'nanoid'

const createPaymentLinkSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  amount: z.string().transform((val) => parseFloat(val)),
  currency: z.string().default('SBTC'),
  expiresAt: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  maxUses: z.number().optional(),
  successUrl: z.string().url().optional(),
  successMessage: z.string().optional(),
  theme: z.string().default('default'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // For now, we'll use a simple auth check by looking for stacksAddress in the body
    // In a real app, you'd validate the session/JWT
    const { stacksAddress, ...paymentLinkData } = body
    
    if (!stacksAddress) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Find or create user with stacks address
    let user = await prisma.user.findUnique({
      where: { stacksAddress }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          stacksAddress,
          name: stacksAddress.slice(0, 8) + '...',
        }
      })
    }

    const validatedData = createPaymentLinkSchema.parse(paymentLinkData)
    
    const paymentLink = await prisma.paymentLink.create({
      data: {
        ...validatedData,
        slug: nanoid(12),
        userId: user.id,
      }
    })

    return NextResponse.json({
      paymentLink: {
        ...paymentLink,
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pay/${paymentLink.slug}`
      }
    })

  } catch (error) {
    console.error('Error creating payment link:', error)
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const stacksAddress = searchParams.get('stacksAddress')
    
    if (!stacksAddress) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { stacksAddress }
    })

    if (!user) {
      return NextResponse.json({ paymentLinks: [] })
    }

    const paymentLinks = await prisma.paymentLink.findMany({
      where: { userId: user.id },
      include: {
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true,
          }
        },
        _count: {
          select: {
            payments: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const paymentLinksWithUrls = paymentLinks.map(link => ({
      ...link,
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pay/${link.slug}`,
      totalPayments: link._count.payments,
      totalEarnings: link.payments
        .filter(p => p.status === 'COMPLETED')
        .reduce((sum, p) => sum + Number(p.amount), 0)
    }))

    return NextResponse.json({ paymentLinks: paymentLinksWithUrls })

  } catch (error) {
    console.error('Error fetching payment links:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
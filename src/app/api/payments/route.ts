import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/database"
import { z } from "zod"

const createPaymentSchema = z.object({
  productId: z.string().optional(),
  amount: z.number().positive(),
  currency: z.string().default("SBTC"),
  description: z.string().optional(),
  widgetId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const skip = (page - 1) * limit

    const where: any = {
      userId: (session.user as any).id,
    }

    if (status) {
      where.status = status
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              title: true,
              imageUrl: true,
              seller: {
                select: {
                  name: true,
                  username: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.payment.count({ where }),
    ])

    return NextResponse.json({
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = createPaymentSchema.parse(body)

    // Generate unique payment ID
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    let product = null
    if (data.productId) {
      product = await prisma.product.findUnique({
        where: { id: data.productId },
        select: {
          id: true,
          title: true,
          price: true,
          sellerId: true,
        },
      })

      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }

      // Verify amount matches product price
      if (data.amount !== parseFloat(product.price.toString())) {
        return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 })
      }
    }

    // Calculate fees (2.9% + 30 cents equivalent in sBTC)
    const feePercent = 0.029
    const fixedFee = 0.000001 // ~30 cents in sBTC
    const feeAmount = data.amount * feePercent + fixedFee
    const netAmount = data.amount - feeAmount

    const payment = await prisma.payment.create({
      data: {
        id: paymentId,
        amount: data.amount,
        feeAmount,
        netAmount,
        currency: data.currency,
        description: data.description || (product ? `Payment for ${product.title}` : 'Payment'),
        productId: data.productId,
        widgetId: data.widgetId,
        metadata: data.metadata,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    })

    return NextResponse.json({
      payment,
      paymentUrl: `${process.env.NEXTAUTH_URL}/pay/${paymentId}`,
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating payment:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
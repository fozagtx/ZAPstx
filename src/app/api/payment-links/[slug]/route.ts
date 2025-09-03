import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  try {
    const paymentLink = await prisma.paymentLink.findUnique({
      where: { slug },
      include: {
        user: {
          select: {
            name: true,
            stacksAddress: true,
          }
        }
      }
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
        { status: 410 }
      )
    }

    if (paymentLink.expiresAt && paymentLink.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Payment link has expired' },
        { status: 410 }
      )
    }

    if (paymentLink.maxUses && paymentLink.currentUses >= paymentLink.maxUses) {
      return NextResponse.json(
        { error: 'Payment link has reached maximum uses' },
        { status: 410 }
      )
    }

    // Increment view count
    await prisma.paymentLink.update({
      where: { id: paymentLink.id },
      data: { viewCount: { increment: 1 } }
    })

    return NextResponse.json({ paymentLink })

  } catch (error) {
    console.error('Error fetching payment link:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  try {
    const body = await request.json()
    const { stacksAddress, ...updateData } = body

    if (!stacksAddress) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

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

    if (paymentLink.user.stacksAddress !== stacksAddress) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const updatedPaymentLink = await prisma.paymentLink.update({
      where: { id: paymentLink.id },
      data: updateData
    })

    return NextResponse.json({ paymentLink: updatedPaymentLink })

  } catch (error) {
    console.error('Error updating payment link:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  try {
    const { searchParams } = new URL(request.url)
    const stacksAddress = searchParams.get('stacksAddress')

    if (!stacksAddress) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

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

    if (paymentLink.user.stacksAddress !== stacksAddress) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    await prisma.paymentLink.delete({
      where: { id: paymentLink.id }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting payment link:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
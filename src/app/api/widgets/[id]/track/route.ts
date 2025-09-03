import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const trackEventSchema = z.object({
  event: z.enum(['impression', 'conversion', 'error']),
  data: z.record(z.any()).optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const { event, data } = trackEventSchema.parse(body)

    // Verify widget exists and is active
    const widget = await prisma.widget.findUnique({
      where: { id: id },
      select: { id: true, active: true }
    })

    if (!widget || !widget.active) {
      return NextResponse.json(
        { error: 'Widget not found or inactive' },
        { status: 404 }
      )
    }

    // Update widget metrics based on event type
    const updateData: any = {}
    
    if (event === 'impression') {
      updateData.impressions = { increment: 1 }
    } else if (event === 'conversion') {
      updateData.conversions = { increment: 1 }
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.widget.update({
        where: { id: id },
        data: updateData
      })
    }

    // Store detailed analytics
    await prisma.analytics.create({
      data: {
        event: `widget_${event}`,
        data: {
          widgetId: id,
          timestamp: new Date().toISOString(),
          userAgent: request.headers.get('user-agent'),
          referer: request.headers.get('referer'),
          ...data,
        }
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error tracking widget event:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid event data' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle CORS for cross-origin widget embeds
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateWidgetSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  theme: z.string().optional(),
  customCSS: z.string().optional(),
  settings: z.object({
    recipientAddress: z.string().optional(),
    amount: z.number().positive().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    currency: z.string().optional(),
    compact: z.boolean().optional(),
    showQR: z.boolean().optional(),
    primaryColor: z.string().optional(),
    borderRadius: z.string().optional(),
    allowCustomAmount: z.boolean().optional(),
    minAmount: z.number().positive().optional(),
    maxAmount: z.number().positive().optional(),
  }).optional(),
  allowedOrigins: z.array(z.string()).optional(),
  rateLimit: z.number().int().positive().optional(),
  active: z.boolean().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const widget = await prisma.widget.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            stacksAddress: true,
          }
        }
      }
    })

    if (!widget) {
      return NextResponse.json(
        { error: 'Widget not found' },
        { status: 404 }
      )
    }

    if (!widget.active) {
      return NextResponse.json(
        { error: 'Widget is inactive' },
        { status: 410 }
      )
    }

    // Increment impressions
    await prisma.widget.update({
      where: { id: widget.id },
      data: { impressions: { increment: 1 } }
    })

    return NextResponse.json({ widget })

  } catch (error) {
    console.error('Error fetching widget:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    const { stacksAddress, ...updateData } = body

    if (!stacksAddress) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const widget = await prisma.widget.findUnique({
      where: { id },
      include: { user: true }
    })

    if (!widget) {
      return NextResponse.json(
        { error: 'Widget not found' },
        { status: 404 }
      )
    }

    if (widget.user.stacksAddress !== stacksAddress) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const validatedData = updateWidgetSchema.parse(updateData)

    const updatedWidget = await prisma.widget.update({
      where: { id: widget.id },
      data: validatedData
    })

    return NextResponse.json({ 
      widget: {
        ...updatedWidget,
        embedCode: generateEmbedCode(updatedWidget.id, updatedWidget.settings),
        scriptUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/widgets/${updatedWidget.id}/script.js`,
      }
    })

  } catch (error) {
    console.error('Error updating widget:', error)
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const { searchParams } = new URL(request.url)
    const stacksAddress = searchParams.get('stacksAddress')

    if (!stacksAddress) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const widget = await prisma.widget.findUnique({
      where: { id },
      include: { user: true }
    })

    if (!widget) {
      return NextResponse.json(
        { error: 'Widget not found' },
        { status: 404 }
      )
    }

    if (widget.user.stacksAddress !== stacksAddress) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    await prisma.widget.delete({
      where: { id: widget.id }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting widget:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateEmbedCode(widgetId: string, settings: any): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  return `<!-- ZapX Payment Widget -->
<div id="zapx-widget-${widgetId}"></div>
<script>
  (function() {
    const script = document.createElement('script');
    script.src = '${baseUrl}/api/widgets/${widgetId}/script.js';
    script.async = true;
    document.head.appendChild(script);
  })();
</script>`
}
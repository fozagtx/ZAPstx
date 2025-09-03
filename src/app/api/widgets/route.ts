import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { nanoid } from 'nanoid'

const createWidgetSchema = z.object({
  name: z.string().min(1, 'Widget name is required'),
  description: z.string().optional(),
  theme: z.string().default('default'),
  customCSS: z.string().optional(),
  settings: z.object({
    recipientAddress: z.string().min(1, 'Recipient address is required'),
    amount: z.number().positive('Amount must be positive').optional(),
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    currency: z.string().default('SBTC'),
    compact: z.boolean().default(false),
    showQR: z.boolean().default(false),
    primaryColor: z.string().default('#f97316'),
    borderRadius: z.string().default('0.5rem'),
    allowCustomAmount: z.boolean().default(false),
    minAmount: z.number().positive().optional(),
    maxAmount: z.number().positive().optional(),
    allowedOrigins: z.array(z.string()).default([]),
  }),
  allowedOrigins: z.array(z.string()).default([]),
  rateLimit: z.number().int().positive().default(100),
})

const updateWidgetSchema = createWidgetSchema.partial()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // For now, we'll use a simple auth check by looking for stacksAddress in the body
    const { stacksAddress, ...widgetData } = body
    
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

    const validatedData = createWidgetSchema.parse(widgetData)
    
    const widget = await prisma.widget.create({
      data: {
        ...validatedData,
        userId: user.id,
      }
    })

    return NextResponse.json({
      widget: {
        ...widget,
        embedCode: generateEmbedCode(widget.id, validatedData.settings),
        scriptUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/widgets/${widget.id}/script.js`,
      }
    })

  } catch (error) {
    console.error('Error creating widget:', error)
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
      return NextResponse.json({ widgets: [] })
    }

    const widgets = await prisma.widget.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    const widgetsWithEmbedCode = widgets.map(widget => ({
      ...widget,
      embedCode: generateEmbedCode(widget.id, widget.settings),
      scriptUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/widgets/${widget.id}/script.js`,
    }))

    return NextResponse.json({ widgets: widgetsWithEmbedCode })

  } catch (error) {
    console.error('Error fetching widgets:', error)
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
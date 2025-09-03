import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/database"
import { z } from "zod"

const createProductSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(10).max(2000),
  shortDesc: z.string().optional(),
  price: z.number().positive(),
  currency: z.string().default("SBTC"),
  fileUrl: z.string().url(),
  fileName: z.string(),
  fileSize: z.number(),
  fileMimeType: z.string(),
  previewUrl: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
  galleryUrls: z.array(z.string().url()).optional(),
  category: z.string().min(1),
  subcategory: z.string().optional(),
  tags: z.array(z.string()).optional(),
  metaTitle: z.string().optional(),
  metaDesc: z.string().optional(),
})

const searchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  sortBy: z.enum(['newest', 'price_asc', 'price_desc', 'popular', 'rating']).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.enum(['PUBLISHED', 'DRAFT', 'ARCHIVED']).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const params = searchSchema.parse({
      q: searchParams.get('q'),
      category: searchParams.get('category'),
      minPrice: searchParams.get('minPrice'),
      maxPrice: searchParams.get('maxPrice'),
      sortBy: searchParams.get('sortBy'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      status: searchParams.get('status'),
    })

    const page = parseInt(params.page || '1')
    const limit = parseInt(params.limit || '12')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      status: params.status || 'PUBLISHED',
    }

    if (params.q) {
      where.OR = [
        { title: { contains: params.q, mode: 'insensitive' } },
        { description: { contains: params.q, mode: 'insensitive' } },
        { tags: { has: params.q } },
      ]
    }

    if (params.category) {
      where.category = params.category
    }

    if (params.minPrice || params.maxPrice) {
      where.price = {}
      if (params.minPrice) {
        where.price.gte = parseFloat(params.minPrice)
      }
      if (params.maxPrice) {
        where.price.lte = parseFloat(params.maxPrice)
      }
    }

    // Build order by clause
    let orderBy: any = { createdAt: 'desc' }
    switch (params.sortBy) {
      case 'newest':
        orderBy = { createdAt: 'desc' }
        break
      case 'price_asc':
        orderBy = { price: 'asc' }
        break
      case 'price_desc':
        orderBy = { price: 'desc' }
        break
      case 'popular':
        orderBy = { downloadCount: 'desc' }
        break
      case 'rating':
        orderBy = { rating: 'desc' }
        break
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
              verified: true,
            },
          },
          _count: {
            select: {
              reviews: true,
              favorites: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = createProductSchema.parse(body)

    // Generate slug from title
    const slug = data.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')

    // Check if slug already exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug },
    })

    const finalSlug = existingProduct 
      ? `${slug}-${Date.now()}`
      : slug

    const product = await prisma.product.create({
      data: {
        ...data,
        slug: finalSlug,
        sellerId: (session.user as any).id,
        tags: data.tags || [],
        galleryUrls: data.galleryUrls || [],
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            verified: true,
          },
        },
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
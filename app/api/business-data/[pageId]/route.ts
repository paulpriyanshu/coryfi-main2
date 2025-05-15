// app/api/business/[pageId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import db from '@/db'

export async function GET(req: NextRequest, { params }) {
  const { pageId } = params
  const pageData = await db.businessPageLayout.findFirst({
    where: { pageId },
    include: {
      categories: true,
      categoryCarousel: {
        select: { categories: true, products: true }
      },
      products: true,
    },
  })

  if (!pageData) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ pageData })
}
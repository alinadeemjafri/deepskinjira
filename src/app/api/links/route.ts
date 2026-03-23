import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const body = await req.json()

  // Prevent duplicate links
  const existing = await prisma.itemLink.findFirst({
    where: {
      OR: [
        { sourceId: body.sourceId, targetId: body.targetId },
        { sourceId: body.targetId, targetId: body.sourceId },
      ],
    },
  })
  if (existing) return NextResponse.json(existing)

  const link = await prisma.itemLink.create({
    data: {
      sourceType: body.sourceType,
      sourceId: body.sourceId,
      targetType: body.targetType,
      targetId: body.targetId,
    },
  })
  return NextResponse.json(link)
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const epics = await prisma.epic.findMany({
    include: {
      stories: { orderBy: { createdAt: 'desc' } },
      attachments: false,
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(epics)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const epic = await prisma.epic.create({
    data: {
      title: body.title,
      description: body.description || null,
      status: body.status || 'TODO',
      priority: body.priority || 'MEDIUM',
      assignee: body.assignee || null,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      color: body.color || '#3C2415',
      createdBy: body.createdBy,
    },
    include: { stories: true, attachments: true },
  })
  return NextResponse.json(epic)
}

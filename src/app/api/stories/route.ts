import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const stories = await prisma.story.findMany({
    include: { epic: true, attachments: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(stories)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const story = await prisma.story.create({
    data: {
      title: body.title,
      description: body.description || null,
      status: body.status || 'TODO',
      priority: body.priority || 'MEDIUM',
      assignee: body.assignee || null,
      storyPoints: body.storyPoints || null,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      epicId: body.epicId,
      createdBy: body.createdBy,
    },
    include: { epic: true, attachments: true },
  })
  return NextResponse.json(story)
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const count = await prisma.subTask.count({ where: { storyId: body.storyId } })
  const subtask = await prisma.subTask.create({
    data: {
      title: body.title,
      storyId: body.storyId,
      order: count,
    },
  })
  return NextResponse.json(subtask)
}

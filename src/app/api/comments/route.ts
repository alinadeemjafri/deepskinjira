import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const comment = await prisma.comment.create({
    data: {
      content: body.content,
      author: body.author,
      epicId: body.epicId || null,
      storyId: body.storyId || null,
    },
  })
  return NextResponse.json(comment)
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const story = await prisma.story.findUnique({
    where: { id },
    include: { epic: true, attachments: true },
  })
  if (!story) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(story)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const data: Record<string, unknown> = {}

  if (body.title !== undefined) data.title = body.title
  if (body.description !== undefined) data.description = body.description
  if (body.status !== undefined) data.status = body.status
  if (body.priority !== undefined) data.priority = body.priority
  if (body.assignee !== undefined) data.assignee = body.assignee
  if (body.storyPoints !== undefined) data.storyPoints = body.storyPoints
  if (body.epicId !== undefined) data.epicId = body.epicId
  if (body.startDate !== undefined) data.startDate = body.startDate ? new Date(body.startDate) : null
  if (body.endDate !== undefined) data.endDate = body.endDate ? new Date(body.endDate) : null

  const story = await prisma.story.update({
    where: { id },
    data,
    include: { epic: true, attachments: true },
  })
  return NextResponse.json(story)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.story.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

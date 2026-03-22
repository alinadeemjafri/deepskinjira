import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const data: Record<string, unknown> = {}
  if (body.title !== undefined) data.title = body.title
  if (body.done !== undefined) data.done = body.done
  if (body.order !== undefined) data.order = body.order

  const subtask = await prisma.subTask.update({ where: { id }, data })
  return NextResponse.json(subtask)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.subTask.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
